/**
 * Types miroirs du schéma SQL (supabase/migrations/0001_init.sql).
 *
 * À régénérer via `supabase gen types typescript --project-id <ID>` une
 * fois le projet Supabase provisionné — la forme doit rester identique.
 *
 * Note: utilise `type` (alias) plutôt que `interface` pour que les Row
 * satisfassent `Record<string, unknown>` (contrainte de postgrest-js).
 */

export type DocumentType =
  | "cours"
  | "td"
  | "td-corrige"
  | "annale"
  | "corrige"
  | "autre";

export type MessageRole = "user" | "assistant";

export type Citation = {
  chunk_id: string;
  document_id: string;
  page: number;
  score: number;
  label: string;
};

export type DocumentRow = {
  id: string;
  ue_code: string;
  title: string;
  source: string | null;
  type: DocumentType;
  storage_path: string;
  page_count: number | null;
  uploaded_by: string | null;
  created_at: string;
};

export type ChunkRow = {
  id: string;
  document_id: string;
  ue_code: string;
  page: number;
  position: number;
  text: string;
  token_count: number;
  embedding: number[];
  metadata: Record<string, unknown>;
  created_at: string;
};

export type ConversationRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  ue_code: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type MessageRow = {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  citations: Citation[];
  created_at: string;
};

export type MatchChunkResult = {
  id: string;
  document_id: string;
  page: number;
  position: number;
  text: string;
  token_count: number;
  metadata: Record<string, unknown>;
  similarity: number;
};

/**
 * Database type compatible avec @supabase/supabase-js generics.
 */
export type Database = {
  public: {
    Tables: {
      documents: {
        Row: DocumentRow;
        Insert: Omit<DocumentRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<DocumentRow>;
        Relationships: [];
      };
      chunks: {
        Row: ChunkRow;
        Insert: Omit<ChunkRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<ChunkRow>;
        Relationships: [];
      };
      conversations: {
        Row: ConversationRow;
        Insert: Omit<ConversationRow, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<ConversationRow>;
        Relationships: [];
      };
      messages: {
        Row: MessageRow;
        Insert: Omit<MessageRow, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<MessageRow>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[];
          match_ue_code: string;
          match_threshold: number;
          match_count: number;
        };
        Returns: MatchChunkResult[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
