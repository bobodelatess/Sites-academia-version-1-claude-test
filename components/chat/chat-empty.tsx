"use client";

import { BookOpen, Lightbulb, MessageCircleQuestion } from "lucide-react";

const EXAMPLES = [
  "Énonce le théorème des accroissements finis avec les hypothèses.",
  "Donne-moi un exemple de série numérique convergente avec son raisonnement.",
  "Quelle est la différence entre limite simple et limite uniforme ?",
];

type Props = {
  ueName: string;
  onPick: (text: string) => void;
};

export function ChatEmpty({ ueName, onPick }: Props) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 px-4 py-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <BookOpen className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Tuteur {ueName}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Pose une question, je réponds <strong>uniquement</strong> à partir des
          supports ingérés (cours, TD, annales). Chaque réponse cite ses
          sources, page par page.
        </p>
      </div>
      <div className="w-full space-y-2">
        <p className="flex items-center justify-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5" /> Exemples
        </p>
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onPick(ex)}
            className="flex w-full items-start gap-2 rounded-xl border border-border bg-card p-3 text-left text-sm transition-colors hover:border-primary"
          >
            <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <span>{ex}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
