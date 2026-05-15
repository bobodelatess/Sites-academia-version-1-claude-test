"use client";

import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

import { ChatEmpty } from "./chat-empty";
import { ChatInput } from "./chat-input";
import { ChatMessage } from "./chat-message";
import { CitationPanel } from "./citation-panel";
import type { ChatSource } from "./types";
import { useChatStream } from "./use-chat-stream";

type Props = {
  ueName: string;
};

export function ChatView({ ueName }: Props) {
  const { messages, status, error, send, reset } = useChatStream();
  const [input, setInput] = useState("");
  const [openSource, setOpenSource] = useState<ChatSource | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Autoscroll en bas quand un nouveau token arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const handleSubmit = () => {
    const text = input.trim();
    if (!text || status === "streaming") return;
    setInput("");
    void send(text);
  };

  const handleNew = () => {
    reset();
    setInput("");
    setOpenSource(null);
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[100dvh] flex-col bg-background">
      <header className="flex items-center justify-between gap-3 border-b border-border bg-card/80 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            AcademIA
          </p>
          <h1 className="truncate text-sm font-semibold leading-tight">
            Tuteur {ueName}
          </h1>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleNew}
          disabled={isEmpty && status !== "streaming"}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Nouvelle conversation</span>
        </Button>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        {isEmpty ? (
          <ChatEmpty ueName={ueName} onPick={(t) => setInput(t)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4 px-3 py-4 sm:px-6">
            {messages.map((m) => (
              <ChatMessage
                key={m.id}
                message={m}
                onCitationClick={setOpenSource}
              />
            ))}
            <div ref={bottomRef} className="h-px" />
          </div>
        )}
      </main>

      {error ? (
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-6">
          <div className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-500">
            {error}
          </div>
        </div>
      ) : null}

      <footer className="border-t border-border bg-background/95 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pt-3 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={status === "streaming"}
            isStreaming={status === "streaming"}
            onStop={reset}
          />
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Réponses ancrées sur tes supports — vérifie toujours en cliquant les
            citations.
          </p>
        </div>
      </footer>

      <CitationPanel
        source={openSource}
        onClose={() => setOpenSource(null)}
      />
    </div>
  );
}
