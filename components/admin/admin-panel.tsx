"use client";

import { useCallback, useEffect, useState } from "react";

import { DocumentList, type AdminDocument } from "./document-list";
import { DocumentUploader, type UploadResult } from "./document-uploader";

export function AdminPanel() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { documents: AdminDocument[] };
      setDocuments(data.documents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const handleUploaded = useCallback(
    (_result: UploadResult) => {
      void refresh();
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Supprimer ce document et tous ses chunks ?")) return;
      const res = await fetch(`/api/ingest?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        alert(`Erreur: ${data.error ?? res.status}`);
        return;
      }
      void refresh();
    },
    [refresh]
  );

  return (
    <div className="space-y-8">
      <DocumentUploader onUploaded={handleUploaded} />
      <section>
        <h2 className="text-lg font-semibold">Documents ingérés</h2>
        <p className="text-sm text-muted-foreground">
          Documents disponibles pour le retrieval.
        </p>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Chargement…</p>
          ) : error ? (
            <p className="text-sm text-red-500">Erreur : {error}</p>
          ) : (
            <DocumentList documents={documents} onDelete={handleDelete} />
          )}
        </div>
      </section>
    </div>
  );
}
