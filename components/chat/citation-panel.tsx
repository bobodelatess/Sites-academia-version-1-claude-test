"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import type { ChatSource } from "./types";

const TYPE_LABEL: Record<ChatSource["document_type"], string> = {
  cours: "Cours",
  td: "TD",
  "td-corrige": "TD corrigé",
  annale: "Annale",
  corrige: "Corrigé d'annale",
  autre: "Document",
};

type Props = {
  source: ChatSource | null;
  onClose: () => void;
};

export function CitationPanel({ source, onClose }: Props) {
  return (
    <Dialog.Root
      open={!!source}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in data-[state=closed]:fade-out" />
        <Dialog.Content
          className="fixed z-50 flex flex-col bg-card text-card-foreground shadow-2xl
            inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl border-t border-border
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom
            sm:inset-y-0 sm:right-0 sm:left-auto sm:top-0 sm:bottom-0 sm:max-h-none sm:w-[440px]
            sm:rounded-none sm:border-l sm:border-t-0
            sm:data-[state=open]:slide-in-from-right sm:data-[state=closed]:slide-out-to-right"
        >
          <header className="flex items-start justify-between gap-3 border-b border-border p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-mono text-primary">
                  [{source?.label}]
                </span>
                {source ? (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {TYPE_LABEL[source.document_type]}
                  </span>
                ) : null}
              </div>
              <Dialog.Title className="mt-2 text-sm font-semibold leading-tight">
                {source?.document_title ?? "—"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-muted-foreground">
                Page {source?.page} · similarité{" "}
                {source ? source.score.toFixed(3) : "—"}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                aria-label="Fermer"
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </header>
          <div className="flex-1 overflow-y-auto whitespace-pre-wrap p-4 text-sm leading-relaxed">
            {source?.text ?? ""}
          </div>
          <footer className="border-t border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
            Extrait utilisé tel quel par le tuteur pour formuler sa réponse.
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
