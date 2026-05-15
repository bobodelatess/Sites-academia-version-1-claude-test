import type { DocumentType } from "@/lib/db/types";

/** Source enrichie envoyée par /api/chat dans l'événement SSE 'meta'. */
export type ChatSource = {
  label: string;
  chunk_id: string;
  document_id: string;
  document_title: string;
  document_type: DocumentType;
  page: number;
  score: number;
  text: string;
};

export type ChatMeta = {
  conversation_id: string;
  sources: ChatSource[];
  below_threshold: boolean;
};

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  sources?: ChatSource[];
  isStreaming?: boolean;
  /** Sources fournies mais aucun [N] inline → réponse possiblement non sourcée. */
  missingCitations?: boolean;
};
