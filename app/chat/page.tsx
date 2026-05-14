export default function ChatPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          AcademIA · Phase 1
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Analyse 2 — assistant de révision
        </h1>
        <p className="text-sm text-muted-foreground">
          Le scaffold est en place. L&apos;interface de chat sera branchée en
          Phase 6, une fois l&apos;ingestion et le retrieval implémentés.
        </p>
      </div>
    </main>
  );
}
