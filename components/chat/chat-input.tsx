"use client";

import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  onStop?: () => void;
};

export function ChatInput({
  value,
  onChange,
  onSubmit,
  disabled,
  isStreaming,
  onStop,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-grow vertical
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, 160);
    el.style.height = `${next}px`;
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim().length > 0) {
        onSubmit();
      }
    }
  };

  const submitDisabled = disabled || value.trim().length === 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!submitDisabled) onSubmit();
      }}
      className="flex items-end gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-primary"
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        placeholder="Pose une question sur ton cours…"
        className="flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
        disabled={disabled && !isStreaming}
        autoFocus
      />
      {isStreaming ? (
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={onStop}
          aria-label="Arrêter"
        >
          <Square className="h-4 w-4 fill-current" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={submitDisabled}
          aria-label="Envoyer"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}
