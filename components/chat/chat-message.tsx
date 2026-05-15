"use client";

import "katex/dist/katex.min.css";

import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { cn } from "@/lib/utils";

import { CitationChip } from "./citation-chip";
import type { ChatMessage as ChatMessageT, ChatSource } from "./types";

type Props = {
  message: ChatMessageT;
  onCitationClick?: (source: ChatSource) => void;
};

export function ChatMessage({ message, onCitationClick }: Props) {
  const isUser = message.role === "user";
  return (
    <div
      className={cn(
        "flex w-full gap-2",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed sm:max-w-[80%]",
          isUser
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md border border-border bg-card text-card-foreground"
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : (
          <>
            <div className="academia-md break-words">
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {message.content}
                </ReactMarkdown>
              ) : null}
              {message.isStreaming ? (
                <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-current align-text-bottom opacity-70" />
              ) : null}
            </div>
            {message.sources && message.sources.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border/60 pt-2.5">
                {message.sources.map((s) => (
                  <CitationChip
                    key={s.chunk_id}
                    source={s}
                    onClick={onCitationClick}
                  />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}
