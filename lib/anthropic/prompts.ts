/**
 * Construction des prompts AcademIA.
 *
 * Stratégie : system prompt strict + user message augmenté avec les
 * extraits récupérés. L'historique de conversation passe brut (raw user
 * questions + assistant replies) ; seul le dernier user message est
 * augmenté avec ses chunks pour le tour courant.
 */

import type { DocumentType } from "@/lib/db/types";
import type { RetrievedChunk } from "@/lib/rag/retrieve";

const TYPE_LABEL: Record<DocumentType, string> = {
  cours: "Cours",
  td: "TD",
  "td-corrige": "TD corrigé",
  annale: "Annale",
  corrige: "Corrigé d'annale",
  autre: "Document",
};

export function buildSystemPrompt(ueName: string): string {
  return `Tu es l'assistant de révision de l'UE « ${ueName} » à l'université Paul Sabatier (Toulouse).

Règles strictes :
1. Tu réponds UNIQUEMENT à partir des extraits de cours fournis dans le message utilisateur. Pas de connaissance générale, même si tu connais la réponse autrement.
2. Si l'information demandée n'est PAS clairement présente dans les extraits, dis-le franchement : « Je n'ai pas trouvé cette information dans tes supports d'${ueName}. » N'invente rien, ne complète pas par tes connaissances.
3. Cite tes sources avec [n] en ligne, où n est le numéro de l'extrait utilisé. Toute affirmation factuelle DOIT être citée — sinon c'est un bug.
4. Si plusieurs extraits couvrent la même notion, synthétise sans les paraphraser un par un.
5. Style : direct, pédagogique, en français. Utilise du LaTeX entre $...$ ou $$...$$ pour les formules. Garde les notations originales du cours.
6. Si la question est ambiguë, demande une précision avant de répondre.`;
}

export const REFUSAL_RESPONSE_TEMPLATE = (ueName: string): string =>
  `Je n'ai pas trouvé cette information dans tes supports d'${ueName}. ` +
  `Essaie de reformuler ta question, ou vérifie qu'un cours / TD couvrant ce point a bien été ingéré dans la plateforme.`;

export function buildAugmentedUserMessage(
  query: string,
  chunks: RetrievedChunk[]
): string {
  const sources = chunks
    .map((c, i) => {
      const label = TYPE_LABEL[c.document_type] ?? "Document";
      const chapterRaw = c.metadata["chapter"];
      const chapter =
        typeof chapterRaw === "string" && chapterRaw.length > 0
          ? ` — ${chapterRaw}`
          : "";
      return `[${i + 1}] ${label} : « ${c.document_title} »${chapter}, page ${c.page}\n${c.text}`;
    })
    .join("\n\n");

  return `Extraits de tes supports :

${sources}

---

Question : ${query}`;
}
