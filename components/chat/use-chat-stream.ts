"use client";

import { useCallback, useRef, useState } from "react";

import type { ChatMessage, ChatMeta, ChatSource } from "./types";

type ChatStatus = "idle" | "streaming" | "error";

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setError(null);
    setStatus("streaming");

    const userMsg: ChatMessage = {
      id: cryptoRandomId(),
      role: "user",
      content: text.trim(),
    };
    const assistantId = cryptoRandomId();
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          conversation_id: conversationIdRef.current ?? undefined,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${errText}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const updateAssistant = (mut: (msg: ChatMessage) => ChatMessage) => {
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? mut(m) : m))
        );
      };

      let receivedSources: ChatSource[] | undefined;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sepIdx: number;
        while ((sepIdx = buffer.indexOf("\n\n")) !== -1) {
          const block = buffer.slice(0, sepIdx);
          buffer = buffer.slice(sepIdx + 2);
          const parsed = parseSseBlock(block);
          if (!parsed) continue;
          const { event, data } = parsed;

          if (event === "meta") {
            const meta = data as ChatMeta;
            conversationIdRef.current = meta.conversation_id;
            receivedSources = meta.sources;
            updateAssistant((m) => ({ ...m, sources: meta.sources }));
          } else if (event === "delta") {
            const text = (data as { text: string }).text;
            updateAssistant((m) => ({ ...m, content: m.content + text }));
          } else if (event === "done") {
            updateAssistant((m) => ({
              ...m,
              isStreaming: false,
              sources: receivedSources ?? m.sources,
            }));
            setStatus("idle");
            return;
          } else if (event === "error") {
            const err = (data as { error: string }).error;
            updateAssistant((m) => ({
              ...m,
              isStreaming: false,
              content: m.content || `Erreur : ${err}`,
            }));
            setStatus("error");
            setError(err);
            return;
          }
        }
      }

      updateAssistant((m) => ({ ...m, isStreaming: false }));
      setStatus("idle");
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        setStatus("idle");
        return;
      }
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
      setStatus("error");
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                isStreaming: false,
                content: m.content || `Erreur : ${msg}`,
              }
            : m
        )
      );
    }
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setStatus("idle");
    setError(null);
    conversationIdRef.current = null;
  }, []);

  return { messages, status, error, send, reset };
}

function parseSseBlock(
  block: string
): { event: string; data: unknown } | null {
  let event = "message";
  let dataLine = "";
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7).trim();
    else if (line.startsWith("data: ")) dataLine = line.slice(6);
  }
  if (!dataLine) return null;
  try {
    return { event, data: JSON.parse(dataLine) };
  } catch {
    return null;
  }
}

function cryptoRandomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}
