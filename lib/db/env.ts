/**
 * Validation centralisée des variables d'environnement.
 * Échoue tôt et fort si une variable critique manque côté serveur.
 */

import { z } from "zod";

const ServerEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().min(1),
  VOYAGE_API_KEY: z.string().min(1),
  NEXT_PUBLIC_UE_NAME: z.string().min(1).default("Analyse 2"),
  NEXT_PUBLIC_UE_CODE: z.string().min(1).default("analyse-2"),
  RAG_SIMILARITY_THRESHOLD: z.coerce.number().min(0).max(1).default(0.55),
  RAG_TOP_K: z.coerce.number().int().positive().default(8),
  RAG_MAX_CONTEXT_CHUNKS: z.coerce.number().int().positive().default(6),
});

const PublicEnvSchema = ServerEnvSchema.pick({
  NEXT_PUBLIC_SUPABASE_URL: true,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: true,
  NEXT_PUBLIC_UE_NAME: true,
  NEXT_PUBLIC_UE_CODE: true,
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type PublicEnv = z.infer<typeof PublicEnvSchema>;

let cachedServer: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cachedServer) return cachedServer;
  const parsed = ServerEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment variables (server):\n${msg}\nVoir .env.local.example`
    );
  }
  cachedServer = parsed.data;
  return cachedServer;
}

export function getPublicEnv(): PublicEnv {
  const parsed = PublicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env["NEXT_PUBLIC_SUPABASE_URL"],
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    NEXT_PUBLIC_UE_NAME: process.env["NEXT_PUBLIC_UE_NAME"],
    NEXT_PUBLIC_UE_CODE: process.env["NEXT_PUBLIC_UE_CODE"],
  });
  if (!parsed.success) {
    const msg = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables (public):\n${msg}`);
  }
  return parsed.data;
}
