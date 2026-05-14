"use client";

import { Button } from "@/components/ui/button";
import type { DocumentRow } from "@/lib/db/types";

export type AdminDocument = DocumentRow;

const TYPE_LABEL: Record<AdminDocument["type"], string> = {
  cours: "Cours",
  td: "TD",
  "td-corrige": "TD corrigé",
  annale: "Annale",
  corrige: "Corrigé",
  autre: "Autre",
};

type Props = {
  documents: AdminDocument[];
  onDelete: (id: string) => void | Promise<void>;
};

export function DocumentList({ documents, onDelete }: Props) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Aucun document ingéré pour l&apos;instant.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
      {documents.map((doc) => (
        <li key={doc.id} className="flex items-start gap-4 px-4 py-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {TYPE_LABEL[doc.type]}
              </span>
              <span className="text-xs text-muted-foreground">
                {doc.page_count ? `${doc.page_count} p.` : ""}
                {doc.source ? ` · ${doc.source}` : ""}
              </span>
            </div>
            <p className="mt-1 truncate text-sm font-medium">{doc.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {new Date(doc.created_at).toLocaleString("fr-FR")} ·{" "}
              <span className="font-mono">{doc.id.slice(0, 8)}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(doc.id)}
            className="shrink-0 text-red-500 hover:text-red-600"
          >
            Supprimer
          </Button>
        </li>
      ))}
    </ul>
  );
}
