/**
 * POST  /api/ingest  — upload PDF, chunk, embed, store
 * GET   /api/ingest  — list documents (UE active)
 * DELETE /api/ingest?id=<uuid>  — supprime un document (cascade chunks)
 *
 * TODO sécurité (post-prototype) : exiger auth admin + rôle.
 * Pour l'instant l'endpoint est ouvert puisque le prototype est privé.
 */

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createServiceClient } from "@/lib/db/client";
import { getServerEnv } from "@/lib/db/env";
import {
  deleteDocument,
  insertChunks,
  insertDocument,
  listDocuments,
} from "@/lib/db/queries";
import { IngestMetadataSchema } from "@/lib/db/schemas";
import { embed } from "@/lib/embeddings/voyage";
import { chunkPages } from "@/lib/rag/chunking";
import { parsePdf } from "@/lib/rag/pdf";

export const runtime = "nodejs";
export const maxDuration = 60;

const STORAGE_BUCKET = "documents";

export async function GET() {
  try {
    const env = getServerEnv();
    const client = createServiceClient();
    const documents = await listDocuments(client, env.NEXT_PUBLIC_UE_CODE);
    return NextResponse.json({ documents });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const env = getServerEnv();
    const form = await request.formData();

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Champ 'file' manquant ou invalide" },
        { status: 400 }
      );
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: `Type de fichier non supporté: ${file.type}` },
        { status: 400 }
      );
    }

    const metadata = IngestMetadataSchema.parse({
      title: form.get("title"),
      type: form.get("type"),
      source: form.get("source") ?? undefined,
      chapter: form.get("chapter") ?? undefined,
    });

    const buffer = await file.arrayBuffer();

    // 1) Parser le PDF
    const { pages, pageCount } = await parsePdf(buffer);
    if (pages.length === 0) {
      return NextResponse.json(
        { error: "Le PDF ne contient aucun texte extractible" },
        { status: 400 }
      );
    }

    // 2) Chunker
    const chunks = chunkPages(pages);
    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "Aucun chunk généré (PDF trop court ?)" },
        { status: 400 }
      );
    }

    // 3) Embedder
    const embeddings = await embed(
      chunks.map((c) => c.text),
      "document"
    );
    if (embeddings.length !== chunks.length) {
      throw new Error(
        `Embedding count mismatch: got ${embeddings.length}, expected ${chunks.length}`
      );
    }

    const client = createServiceClient();

    // 4) Upload du PDF vers Storage (avant insertion DB pour pouvoir rollback)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `${env.NEXT_PUBLIC_UE_CODE}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) {
      return NextResponse.json(
        { error: `Upload Storage: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // 5) Insertion document + chunks
    try {
      const document = await insertDocument(client, {
        ue_code: env.NEXT_PUBLIC_UE_CODE,
        title: metadata.title,
        type: metadata.type,
        source: metadata.source ?? null,
        storage_path: storagePath,
        page_count: pageCount,
      });

      const chunkRows = chunks.map((c, i) => {
        const embedding = embeddings[i];
        if (!embedding) throw new Error(`Missing embedding at index ${i}`);
        return {
          document_id: document.id,
          ue_code: env.NEXT_PUBLIC_UE_CODE,
          page: c.page,
          position: c.position,
          text: c.text,
          token_count: c.tokenCount,
          embedding,
          metadata: metadata.chapter ? { chapter: metadata.chapter } : {},
        };
      });
      await insertChunks(client, chunkRows);

      return NextResponse.json({
        document,
        chunk_count: chunks.length,
        page_count: pageCount,
      });
    } catch (err) {
      // Rollback storage
      await client.storage.from(STORAGE_BUCKET).remove([storagePath]);
      throw err;
    }
  } catch (err) {
    return errorResponse(err);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Paramètre ?id=<uuid> manquant" },
        { status: 400 }
      );
    }
    const client = createServiceClient();

    // Récupérer le storage_path pour cleanup
    const { data: doc } = await client
      .from("documents")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle();

    await deleteDocument(client, id);

    if (doc?.storage_path) {
      await client.storage.from(STORAGE_BUCKET).remove([doc.storage_path]);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}

function errorResponse(err: unknown) {
  if (err instanceof z.ZodError) {
    return NextResponse.json(
      { error: "ValidationError", issues: err.issues },
      { status: 400 }
    );
  }
  console.error("[ingest] error:", err);
  const msg = err instanceof Error ? err.message : "Unknown error";
  return NextResponse.json({ error: msg }, { status: 500 });
}
