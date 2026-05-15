/**
 * POST /api/chat — streaming SSE
 *
 * Body : { conversation_id?: uuid, message: string }
 *
 * Sortie : flux SSE avec trois types d'événements
 *   event: meta   data: { conversation_id, citations, below_threshold }
 *   event: delta  data: { text }
 *   event: done   data: { conversation_id }
 *   event: error  data: { error }
 *
 * Garde-fou anti-hallucination : si retrieve() renvoie belowThreshold,
 * on ne fait PAS d'appel à Anthropic et on stream une réponse de refus
 * pré-câblée, persistée comme un message assistant normal (citations vides).
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  CHAT_MODEL,
  getAnthropic,
  MAX_OUTPUT_TOKENS,
  TEMPERATURE,
} from "@/lib/anthropic/client";
import {
  buildAugmentedUserMessage,
  buildSystemPrompt,
  REFUSAL_RESPONSE_TEMPLATE,
} from "@/lib/anthropic/prompts";
import { createServiceClient } from "@/lib/db/client";
import { getServerEnv } from "@/lib/db/env";
import {
  appendMessage,
  createConversation,
  getConversation,
  listMessages,
  touchConversation,
} from "@/lib/db/queries";
import { ChatRequestSchema } from "@/lib/db/schemas";
import type { Citation } from "@/lib/db/types";
import { retrieve, trimToBudget } from "@/lib/rag/retrieve";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Combien de tours de conversation passés on injecte dans le contexte. */
const HISTORY_TURNS = 6;
/** Budget tokens dédié aux chunks dans le prompt utilisateur. */
const CHUNK_TOKEN_BUDGET = 3000;
/** Délai entre les "mots" du refus, ms — émule un streaming. */
const REFUSAL_WORD_DELAY_MS = 25;

export async function POST(request: NextRequest) {
  let body: { conversation_id?: string; message: string };
  try {
    body = ChatRequestSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "ValidationError", issues: err.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const env = getServerEnv();
    const ueCode = env.NEXT_PUBLIC_UE_CODE;
    const ueName = env.NEXT_PUBLIC_UE_NAME;
    const client = createServiceClient();

    // ----- Conversation -----
    const conversation = body.conversation_id
      ? await getConversation(client, body.conversation_id)
      : await createConversation(client, { ue_code: ueCode });

    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation introuvable" },
        { status: 404 }
      );
    }

    // ----- Retrieval -----
    const retrieveResult = await retrieve(body.message);
    const trimmedChunks = trimToBudget(retrieveResult.chunks, CHUNK_TOKEN_BUDGET);
    const citations: Citation[] = trimmedChunks.map((c, i) => ({
      chunk_id: c.chunk_id,
      document_id: c.document_id,
      page: c.page,
      score: c.score,
      label: String(i + 1),
    }));

    // ----- Historique (avant de persister le message courant) -----
    const history = await listMessages(client, conversation.id, HISTORY_TURNS * 2);

    // ----- Persistance message utilisateur (raw) -----
    await appendMessage(client, {
      conversation_id: conversation.id,
      role: "user",
      content: body.message,
    });

    const isRefusal =
      retrieveResult.belowThreshold || trimmedChunks.length === 0;

    // ----- Stream SSE -----
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const encoder = new TextEncoder();
        const send = (event: string, data: unknown): void => {
          controller.enqueue(
            encoder.encode(
              `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
            )
          );
        };

        try {
          send("meta", {
            conversation_id: conversation.id,
            citations,
            below_threshold: retrieveResult.belowThreshold,
          });

          // ===== Chemin refus (anti-hallucination) =====
          if (isRefusal) {
            const refusal = REFUSAL_RESPONSE_TEMPLATE(ueName);
            for (const word of refusal.split(/(\s+)/)) {
              send("delta", { text: word });
              await sleep(REFUSAL_WORD_DELAY_MS);
            }
            await appendMessage(client, {
              conversation_id: conversation.id,
              role: "assistant",
              content: refusal,
              citations: [],
            });
            await touchConversation(client, conversation.id);
            send("done", { conversation_id: conversation.id });
            controller.close();
            return;
          }

          // ===== Chemin normal — appel Anthropic =====
          const anthropic = getAnthropic();
          const augmented = buildAugmentedUserMessage(
            body.message,
            trimmedChunks
          );
          const messages = [
            ...history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user" as const, content: augmented },
          ];

          const anthropicStream = anthropic.messages.stream({
            model: CHAT_MODEL,
            max_tokens: MAX_OUTPUT_TOKENS,
            temperature: TEMPERATURE,
            system: [
              {
                type: "text",
                text: buildSystemPrompt(ueName),
                cache_control: { type: "ephemeral" },
              },
            ],
            messages,
          });

          let accumulated = "";
          for await (const event of anthropicStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              accumulated += event.delta.text;
              send("delta", { text: event.delta.text });
            }
          }

          await appendMessage(client, {
            conversation_id: conversation.id,
            role: "assistant",
            content: accumulated,
            citations,
          });
          await touchConversation(client, conversation.id);

          send("done", { conversation_id: conversation.id });
          controller.close();
        } catch (err) {
          console.error("[chat] stream error:", err);
          const msg = err instanceof Error ? err.message : "Unknown error";
          try {
            send("error", { error: msg });
          } catch {
            /* swallow */
          }
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[chat] error:", err);
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
