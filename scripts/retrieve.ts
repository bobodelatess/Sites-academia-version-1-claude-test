/**
 * CLI : pnpm retrieve "<question>"
 *
 * Lance un retrieval sur les chunks de l'UE active (défaut : Analyse 2)
 * et imprime les passages les plus pertinents avec leur score.
 *
 * Usage : pnpm retrieve "Énoncer le théorème des accroissements finis"
 */

import { retrieve } from "@/lib/rag/retrieve";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: pnpm retrieve "<question>"');
    process.exit(1);
  }
  const question = args.join(" ");
  console.log(`\nQuestion : ${question}\n`);

  const start = Date.now();
  const result = await retrieve(question);
  const elapsed = Date.now() - start;

  if (result.belowThreshold || result.chunks.length === 0) {
    console.log(
      `Aucun chunk au-dessus du seuil de similarité (${elapsed} ms).`
    );
    console.log("→ /api/chat répondra : « je n'ai pas trouvé cette info ».");
    return;
  }

  console.log(`${result.chunks.length} chunk(s) trouvé(s) en ${elapsed} ms\n`);
  result.chunks.forEach((c, i) => {
    const idx = (i + 1).toString().padStart(2, "0");
    console.log(
      `[${idx}]  score=${c.score.toFixed(3)}  ${c.document_title} (${c.document_type}) p.${c.page}`
    );
    console.log(`     tokens=${c.token_count}  chunk_id=${c.chunk_id.slice(0, 8)}`);
    const preview = c.text.replace(/\s+/g, " ").slice(0, 240);
    console.log(`     ${preview}${c.text.length > 240 ? "…" : ""}`);
    console.log();
  });
}

main().catch((err) => {
  console.error("Erreur :");
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
