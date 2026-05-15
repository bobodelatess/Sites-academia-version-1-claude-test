"use client";

import type { ChatSource } from "./types";

const TYPE_LABEL: Record<ChatSource["document_type"], string> = {
  cours: "Cours",
  td: "TD",
  "td-corrige": "TD corrigé",
  annale: "Annale",
  corrige: "Corrigé",
  autre: "Doc",
};

type Props = {
  source: ChatSource;
  onClick?: (source: ChatSource) => void;
};

export function CitationChip({ source, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(source)}
      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2 py-1 text-xs hover:border-primary hover:bg-muted transition-colors"
      title={`${source.document_title} — page ${source.page} · score ${source.score.toFixed(2)}`}
    >
      <span className="font-mono text-muted-foreground">[{source.label}]</span>
      <span className="max-w-[12rem] truncate">
        {TYPE_LABEL[source.document_type]} · {source.document_title}
      </span>
      <span className="text-muted-foreground">p.{source.page}</span>
    </button>
  );
}
