import { AdminPanel } from "@/components/admin/admin-panel";

export const metadata = {
  title: "Admin — AcademIA",
};

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col">
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-4xl px-6 py-6">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Administration
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Ingestion des supports
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload de PDFs : parsing, chunking, embedding voyage-3, et stockage
            dans Supabase.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <AdminPanel />
      </div>
    </main>
  );
}
