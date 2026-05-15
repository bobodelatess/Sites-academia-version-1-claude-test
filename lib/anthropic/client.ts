/**
 * Client Anthropic singleton.
 *
 * Modèle de chat : claude-sonnet-4-6 (imposé par le brief AcademIA).
 * Prompt caching activé sur le system prompt — actif quand le prompt
 * dépasse ~1024 tokens (sinon l'API accepte mais ne cache pas).
 */

import Anthropic from "@anthropic-ai/sdk";

import { getServerEnv } from "@/lib/db/env";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const env = getServerEnv();
  cached = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return cached;
}

export const CHAT_MODEL = "claude-sonnet-4-6";
export const MAX_OUTPUT_TOKENS = 1024;
export const TEMPERATURE = 0;
