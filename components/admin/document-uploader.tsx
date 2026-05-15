"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { DocumentTypeT } from "@/lib/db/schemas";
import type { DocumentRow } from "@/lib/db/types";

export type UploadResult = {
  document: DocumentRow;
  chunk_count: number;
  page_count: number;
};

const TYPE_OPTIONS: { value: DocumentTypeT; label: string }[] = [
  { value: "cours", label: "Cours" },
  { value: "td", label: "TD" },
  { value: "td-corrige", label: "TD corrigé" },
  { value: "annale", label: "Annale" },
  { value: "corrige", label: "Corrigé d'annale" },
  { value: "autre", label: "Autre" },
];

type Props = {
  onUploaded: () => void;
};

export function DocumentUploader({ onUploaded }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);
    setProgress("Upload + parsing + embedding en cours…");
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch("/api/ingest", {
        method: "POST",
        body: form,
      });
      const json = (await res.json()) as
        | { error: string; issues?: unknown }
        | UploadResult;
      if (!res.ok) {
        const message = "error" in json ? json.error : `HTTP ${res.status}`;
        throw new Error(message);
      }
      const result = json as UploadResult;
      setProgress(
        `OK : ${result.chunk_count} chunks sur ${result.page_count} pages.`
      );
      onUploaded();
      formRef.current?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
      setProgress(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">Nouveau document</h2>
      <p className="text-sm text-muted-foreground">
        PDF uniquement. Le texte est extrait, chunké en passages de ~500 tokens
        avec overlap, et embeddé avec voyage-3.
      </p>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <Field label="Titre" required>
          <input
            name="title"
            required
            placeholder="Cours d'Analyse 2 — Chap. 3"
            className="input"
          />
        </Field>

        <Field label="Type" required>
          <select name="type" required defaultValue="cours" className="input">
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Source (optionnel)">
          <input
            name="source"
            placeholder="Exo7, polycopié 2023, etc."
            className="input"
          />
        </Field>

        <Field label="Chapitre (optionnel)">
          <input
            name="chapter"
            placeholder="Suites numériques"
            className="input"
          />
        </Field>

        <div className="sm:col-span-2">
          <Field label="Fichier PDF" required>
            <input
              type="file"
              name="file"
              accept="application/pdf"
              required
              className="block w-full text-sm file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary/90"
            />
          </Field>
        </div>

        <div className="sm:col-span-2 flex items-center justify-between gap-4">
          <div className="text-sm">
            {progress && !error ? (
              <span className="text-muted-foreground">{progress}</span>
            ) : null}
            {error ? <span className="text-red-500">{error}</span> : null}
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Ingestion…" : "Ingérer"}
          </Button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          background: rgb(var(--card));
          border: 1px solid rgb(var(--border));
          color: rgb(var(--foreground));
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input:focus { border-color: rgb(var(--ring)); }
      `}</style>
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
