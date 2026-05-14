/**
 * Schémas Zod pour les payloads API et la validation runtime.
 * Utilisés par /api/ingest et /api/chat pour valider les inputs.
 */

import { z } from "zod";

export const DocumentTypeSchema = z.enum([
  "cours",
  "td",
  "td-corrige",
  "annale",
  "corrige",
  "autre",
]);
export type DocumentTypeT = z.infer<typeof DocumentTypeSchema>;

export const MessageRoleSchema = z.enum(["user", "assistant"]);
export type MessageRoleT = z.infer<typeof MessageRoleSchema>;

export const CitationSchema = z.object({
  chunk_id: z.string().uuid(),
  document_id: z.string().uuid(),
  page: z.number().int().positive(),
  score: z.number().min(0).max(1),
  label: z.string().min(1),
});
export type CitationT = z.infer<typeof CitationSchema>;

// ----- Ingestion -----
// FormData multipart : file (PDF) + title + type + source?
export const IngestMetadataSchema = z.object({
  title: z.string().min(1).max(300),
  type: DocumentTypeSchema,
  source: z.string().max(200).optional(),
  chapter: z.string().max(200).optional(),
});
export type IngestMetadataT = z.infer<typeof IngestMetadataSchema>;

// ----- Chat -----
export const ChatRequestSchema = z.object({
  conversation_id: z.string().uuid().optional(),
  message: z.string().min(1).max(4000),
});
export type ChatRequestT = z.infer<typeof ChatRequestSchema>;

// ----- Conversation persistée -----
export const ChunkMetadataSchema = z.object({
  chapter: z.string().optional(),
  section: z.string().optional(),
  source: z.string().optional(),
});
export type ChunkMetadataT = z.infer<typeof ChunkMetadataSchema>;
