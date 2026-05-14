/**
 * Helpers de requêtes Supabase, typés contre Database.
 * Tous utilisent le service-role client : à n'appeler que depuis le serveur.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  Citation,
  ChunkRow,
  ConversationRow,
  Database,
  DocumentRow,
  DocumentType,
  MatchChunkResult,
  MessageRole,
  MessageRow,
} from "./types";

type Client = SupabaseClient<Database>;

// ===== Documents =====

export async function insertDocument(
  client: Client,
  input: {
    ue_code: string;
    title: string;
    type: DocumentType;
    storage_path: string;
    source?: string | null;
    page_count?: number | null;
    uploaded_by?: string | null;
  }
): Promise<DocumentRow> {
  const { data, error } = await client
    .from("documents")
    .insert({
      ue_code: input.ue_code,
      title: input.title,
      type: input.type,
      storage_path: input.storage_path,
      source: input.source ?? null,
      page_count: input.page_count ?? null,
      uploaded_by: input.uploaded_by ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(`insertDocument: ${error.message}`);
  return data;
}

export async function listDocuments(
  client: Client,
  ueCode: string
): Promise<DocumentRow[]> {
  const { data, error } = await client
    .from("documents")
    .select("*")
    .eq("ue_code", ueCode)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listDocuments: ${error.message}`);
  return data ?? [];
}

export async function deleteDocument(
  client: Client,
  id: string
): Promise<void> {
  const { error } = await client.from("documents").delete().eq("id", id);
  if (error) throw new Error(`deleteDocument: ${error.message}`);
}

// ===== Chunks =====

export type ChunkInsert = {
  document_id: string;
  ue_code: string;
  page: number;
  position: number;
  text: string;
  token_count: number;
  embedding: number[];
  metadata?: Record<string, unknown>;
};

export async function insertChunks(
  client: Client,
  rows: ChunkInsert[]
): Promise<void> {
  if (rows.length === 0) return;
  // Supabase REST limite la taille du body : on insère par paquets de 100.
  const BATCH = 100;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH).map((r) => ({
      ...r,
      metadata: r.metadata ?? {},
    }));
    const { error } = await client.from("chunks").insert(slice);
    if (error) throw new Error(`insertChunks (batch ${i}): ${error.message}`);
  }
}

export async function countChunks(
  client: Client,
  documentId: string
): Promise<number> {
  const { count, error } = await client
    .from("chunks")
    .select("*", { count: "exact", head: true })
    .eq("document_id", documentId);
  if (error) throw new Error(`countChunks: ${error.message}`);
  return count ?? 0;
}

export async function matchChunks(
  client: Client,
  input: {
    query_embedding: number[];
    ue_code: string;
    threshold: number;
    top_k: number;
  }
): Promise<MatchChunkResult[]> {
  const { data, error } = await client.rpc("match_chunks", {
    query_embedding: input.query_embedding,
    match_ue_code: input.ue_code,
    match_threshold: input.threshold,
    match_count: input.top_k,
  });
  if (error) throw new Error(`matchChunks: ${error.message}`);
  return data ?? [];
}

export async function getChunksByIds(
  client: Client,
  ids: string[]
): Promise<ChunkRow[]> {
  if (ids.length === 0) return [];
  const { data, error } = await client
    .from("chunks")
    .select("*")
    .in("id", ids);
  if (error) throw new Error(`getChunksByIds: ${error.message}`);
  return data ?? [];
}

// ===== Conversations =====

export async function createConversation(
  client: Client,
  input: {
    ue_code: string;
    user_id?: string | null;
    session_id?: string | null;
    title?: string | null;
  }
): Promise<ConversationRow> {
  const { data, error } = await client
    .from("conversations")
    .insert({
      ue_code: input.ue_code,
      user_id: input.user_id ?? null,
      session_id: input.session_id ?? null,
      title: input.title ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(`createConversation: ${error.message}`);
  return data;
}

export async function getConversation(
  client: Client,
  id: string
): Promise<ConversationRow | null> {
  const { data, error } = await client
    .from("conversations")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getConversation: ${error.message}`);
  return data;
}

export async function touchConversation(
  client: Client,
  id: string,
  patch: { title?: string | null } = {}
): Promise<void> {
  const update: Database["public"]["Tables"]["conversations"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (patch.title !== undefined) update.title = patch.title;
  const { error } = await client
    .from("conversations")
    .update(update)
    .eq("id", id);
  if (error) throw new Error(`touchConversation: ${error.message}`);
}

// ===== Messages =====

export async function appendMessage(
  client: Client,
  input: {
    conversation_id: string;
    role: MessageRole;
    content: string;
    citations?: Citation[];
  }
): Promise<MessageRow> {
  const { data, error } = await client
    .from("messages")
    .insert({
      conversation_id: input.conversation_id,
      role: input.role,
      content: input.content,
      citations: input.citations ?? [],
    })
    .select()
    .single();
  if (error) throw new Error(`appendMessage: ${error.message}`);
  return data;
}

export async function listMessages(
  client: Client,
  conversationId: string,
  limit = 50
): Promise<MessageRow[]> {
  const { data, error } = await client
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(`listMessages: ${error.message}`);
  return data ?? [];
}
