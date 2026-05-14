/**
 * Retrieval RAG : embed la question → kNN sur les chunks → enrichit
 * avec le titre/type du document parent.
 *
 * Sortie destinée à être consommée par /api/chat (assemblage du prompt)
 * ou par le script CLI scripts/retrieve.ts.
 */

import { createServiceClient } from "@/lib/db/client";
import { getServerEnv } from "@/lib/db/env";
import { matchChunks } from "@/lib/db/queries";
import type { DocumentType } from "@/lib/db/types";
import { embedQuery } from "@/lib/embeddings/voyage";

export type RetrievedChunk = {
  chunk_id: string;
  document_id: string;
  document_title: string;
  document_type: DocumentType;
  page: number;
  position: number;
  text: string;
  token_count: number;
  score: number;
  metadata: Record<string, unknown>;
};

export type RetrieveOptions = {
  ueCode?: string;
  topK?: number;
  threshold?: number;
};

export type RetrieveResult = {
  query: string;
  chunks: RetrievedChunk[];
  /** Vrai si aucun chunk n'atteint le seuil de similarité. */
  belowThreshold: boolean;
};

export async function retrieve(
  query: string,
  opts: RetrieveOptions = {}
): Promise<RetrieveResult> {
  const env = getServerEnv();
  const client = createServiceClient();
  const ueCode = opts.ueCode ?? env.NEXT_PUBLIC_UE_CODE;
  const topK = opts.topK ?? env.RAG_TOP_K;
  const threshold = opts.threshold ?? env.RAG_SIMILARITY_THRESHOLD;

  const embedding = await embedQuery(query);
  const matches = await matchChunks(client, {
    query_embedding: embedding,
    ue_code: ueCode,
    threshold,
    top_k: topK,
  });

  if (matches.length === 0) {
    return { query, chunks: [], belowThreshold: true };
  }

  // Métadonnées documents (titre + type) en un seul aller-retour
  const docIds = [...new Set(matches.map((m) => m.document_id))];
  const { data: docs, error } = await client
    .from("documents")
    .select("id, title, type")
    .in("id", docIds);
  if (error) {
    throw new Error(`retrieve: fetch documents: ${error.message}`);
  }
  const docMap = new Map(
    (docs ?? []).map((d) => [d.id, { title: d.title, type: d.type }])
  );

  const chunks: RetrievedChunk[] = matches.map((m) => {
    const doc = docMap.get(m.document_id);
    return {
      chunk_id: m.id,
      document_id: m.document_id,
      document_title: doc?.title ?? "(document inconnu)",
      document_type: (doc?.type ?? "autre") as DocumentType,
      page: m.page,
      position: m.position,
      text: m.text,
      token_count: m.token_count,
      score: m.similarity,
      metadata: m.metadata,
    };
  });

  return { query, chunks, belowThreshold: false };
}

/**
 * Tronque la liste de chunks à un budget de tokens, en gardant l'ordre
 * (les plus pertinents d'abord). Utile pour rester dans la fenêtre de
 * contexte du LLM.
 */
export function trimToBudget(
  chunks: RetrievedChunk[],
  maxTokens: number
): RetrievedChunk[] {
  const out: RetrievedChunk[] = [];
  let used = 0;
  for (const c of chunks) {
    if (used + c.token_count > maxTokens && out.length > 0) break;
    out.push(c);
    used += c.token_count;
  }
  return out;
}
