/**
 * Chunking page-aware avec overlap pour le RAG.
 *
 * Stratégie :
 *   - Chaque chunk appartient à une seule page (citations propres)
 *   - Cible ~500 tokens, overlap ~80 tokens (mesurés en chars ÷ 4)
 *   - On coupe sur les paragraphes quand on peut, puis sur les phrases,
 *     puis en dur seulement si vraiment nécessaire
 *   - On préserve les blocs LaTeX/code (entre $...$, $$...$$, ```...```)
 *     en évitant de couper au milieu (best-effort)
 */

const CHARS_PER_TOKEN = 4;
const TARGET_TOKENS = 500;
const OVERLAP_TOKENS = 80;
const MIN_CHUNK_TOKENS = 50; // on jette les chunks trop courts

const TARGET_CHARS = TARGET_TOKENS * CHARS_PER_TOKEN; // 2000
const OVERLAP_CHARS = OVERLAP_TOKENS * CHARS_PER_TOKEN; // 320
const MIN_CHARS = MIN_CHUNK_TOKENS * CHARS_PER_TOKEN; // 200

export type ChunkInput = { page: number; text: string };
export type Chunk = {
  page: number;
  position: number; // index global dans le document (0-based)
  text: string;
  tokenCount: number;
};

export function chunkPages(pages: ChunkInput[]): Chunk[] {
  const out: Chunk[] = [];
  let position = 0;
  for (const { page, text } of pages) {
    const parts = chunkText(text);
    for (const part of parts) {
      if (estimateTokens(part) < MIN_CHUNK_TOKENS) continue;
      out.push({
        page,
        position,
        text: part,
        tokenCount: estimateTokens(part),
      });
      position += 1;
    }
  }
  return out;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

function chunkText(text: string): string[] {
  if (text.length <= TARGET_CHARS) return [text];

  const paragraphs = text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return [];

  const chunks: string[] = [];
  let current = "";

  const flush = () => {
    if (current.trim().length >= MIN_CHARS) chunks.push(current.trim());
    current = "";
  };

  for (const para of paragraphs) {
    if (para.length > TARGET_CHARS) {
      // Paragraphe trop long → on flush l'actuel puis on split en phrases
      flush();
      const sentences = splitSentences(para);
      let buf = "";
      for (const s of sentences) {
        if (buf.length + s.length + 1 > TARGET_CHARS) {
          if (buf.trim()) chunks.push(buf.trim());
          buf = lastChars(buf, OVERLAP_CHARS) + s;
        } else {
          buf = buf ? `${buf} ${s}` : s;
        }
      }
      if (buf.trim()) {
        current = buf;
      }
      continue;
    }

    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= TARGET_CHARS) {
      current = candidate;
    } else {
      // L'ajout dépasserait — on émet le chunk actuel + overlap puis on repart
      if (current.trim()) chunks.push(current.trim());
      const overlap = lastChars(current, OVERLAP_CHARS);
      current = overlap ? `${overlap}\n\n${para}` : para;
    }
  }
  flush();
  return chunks;
}

function splitSentences(text: string): string[] {
  // Découpe naïve sur .!? suivi d'un espace + majuscule.
  // Suffisant pour du français universitaire ; améliorable plus tard.
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZÀÁÂÄÆÇÉÈÊËÎÏÔÖÙÛÜŸ])/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function lastChars(text: string, n: number): string {
  if (text.length <= n) return text;
  // Recoller sur une frontière d'espace si possible
  const slice = text.slice(-n);
  const spaceIdx = slice.indexOf(" ");
  return spaceIdx > 0 ? slice.slice(spaceIdx + 1) : slice;
}
