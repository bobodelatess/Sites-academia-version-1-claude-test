/**
 * Client minimal pour Voyage AI Embeddings.
 *
 * Modèle : voyage-3 (1024 dims, multilingue, FR couvert).
 * Batching : 128 inputs / call max côté API.
 * Truncation activée pour qu'un chunk trop long ne fasse pas exploser l'appel.
 *
 * input_type=document à l'ingestion, input_type=query au retrieval :
 * recommandation officielle Voyage pour aligner les embeddings.
 */

import { getServerEnv } from "@/lib/db/env";

const VOYAGE_URL = "https://api.voyageai.com/v1/embeddings";
const VOYAGE_MODEL = "voyage-3";
const EMBED_DIM = 1024;
const BATCH_SIZE = 128;

export type EmbedInputType = "document" | "query";

type VoyageResponse = {
  data: { embedding: number[]; index: number }[];
  model: string;
  usage: { total_tokens: number };
};

export async function embed(
  texts: string[],
  inputType: EmbedInputType = "document"
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const env = getServerEnv();
  const all: number[][] = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const res = await fetch(VOYAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.VOYAGE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VOYAGE_MODEL,
        input: batch,
        input_type: inputType,
        truncation: true,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Voyage API ${res.status}: ${text}`);
    }
    const data = (await res.json()) as VoyageResponse;
    // Voyage renvoie dans l'ordre mais on trie par sécurité.
    data.data.sort((a, b) => a.index - b.index);
    for (const item of data.data) {
      if (item.embedding.length !== EMBED_DIM) {
        throw new Error(
          `Voyage returned ${item.embedding.length} dims, expected ${EMBED_DIM}`
        );
      }
      all.push(item.embedding);
    }
  }
  return all;
}

export async function embedQuery(text: string): Promise<number[]> {
  const out = await embed([text], "query");
  const first = out[0];
  if (!first) throw new Error("Voyage returned no embedding for query");
  return first;
}
