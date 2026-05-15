/**
 * Test de qualité RAG — AcademIA / Analyse 2.
 *
 * Lance : pnpm test:rag
 * Pré-requis : .env.local rempli + au moins quelques PDFs Exo7 ingérés.
 *
 * Stratégie :
 *   - 7 questions devant trouver une réponse (assert : ≥1 chunk au-dessus
 *     du seuil, score top-1 décent, doc/page « plausible »)
 *   - 2 questions hors-périmètre (assert : belowThreshold = true)
 *   - 1 question paraphrasée (assert : on retrouve quand même un chunk)
 *
 * Sortie : tableau pass/fail + résumé. Code sortie non-zéro si un test échoue.
 *
 * Note : ces tests dépendent du corpus ingéré. Ajuste les expected* au
 * besoin une fois que tu connais ce qui est dans la DB.
 */

import { retrieve, type RetrievedChunk } from "@/lib/rag/retrieve";

type SuccessExpect = {
  kind: "should_find";
  /** Score top-1 minimum attendu (cosine 0..1). */
  minTopScore: number;
  /** Substring (insensible à la casse) qui devrait apparaître dans le top-K. */
  textIncludes?: string;
  /** Type de doc attendu pour le top-1 (cours/td/...). */
  expectDocType?: string;
};

type RefuseExpect = {
  kind: "should_refuse";
};

type RagTest = {
  id: string;
  question: string;
  expect: SuccessExpect | RefuseExpect;
  category: "core" | "edge" | "paraphrase";
};

const TESTS: RagTest[] = [
  // ----- Doivent trouver une réponse (cours) -----
  {
    id: "TAF",
    question: "Énonce le théorème des accroissements finis avec ses hypothèses.",
    expect: {
      kind: "should_find",
      minTopScore: 0.55,
      textIncludes: "accroissements",
    },
    category: "core",
  },
  {
    id: "ROLLE",
    question: "Quelles sont les hypothèses du théorème de Rolle ?",
    expect: {
      kind: "should_find",
      minTopScore: 0.55,
      textIncludes: "Rolle",
    },
    category: "core",
  },
  {
    id: "TVI",
    question: "Énonce le théorème des valeurs intermédiaires.",
    expect: {
      kind: "should_find",
      minTopScore: 0.55,
      textIncludes: "intermédiaires",
    },
    category: "core",
  },
  {
    id: "SUITES_CONV",
    question: "Définition d'une suite convergente.",
    expect: {
      kind: "should_find",
      minTopScore: 0.55,
      textIncludes: "convergente",
    },
    category: "core",
  },
  {
    id: "SERIES_CV_ABSOLUE",
    question: "Différence entre convergence absolue et convergence simple d'une série.",
    expect: { kind: "should_find", minTopScore: 0.5 },
    category: "core",
  },
  {
    id: "INTEGRALE_RIEMANN",
    question: "Comment définit-on l'intégrale de Riemann d'une fonction continue ?",
    expect: {
      kind: "should_find",
      minTopScore: 0.5,
      textIncludes: "Riemann",
    },
    category: "core",
  },
  {
    id: "DEV_LIMITES",
    question: "Calcul d'un développement limité de cos(x) à l'ordre 4.",
    expect: { kind: "should_find", minTopScore: 0.5 },
    category: "core",
  },

  // ----- Hors-périmètre (doivent refuser) -----
  {
    id: "OFF_TOPIC_RECETTE",
    question: "Quelle est la recette de la tarte aux pommes ?",
    expect: { kind: "should_refuse" },
    category: "edge",
  },
  {
    id: "OFF_TOPIC_HISTOIRE",
    question: "En quelle année est mort Louis XIV ?",
    expect: { kind: "should_refuse" },
    category: "edge",
  },

  // ----- Paraphrase (le retrieval doit être robuste) -----
  {
    id: "PARAPHRASE_TAF",
    question:
      "Comment majorer |f(b) − f(a)| à l'aide de la dérivée de f sur [a, b] ?",
    expect: {
      kind: "should_find",
      minTopScore: 0.45,
      textIncludes: "accroissements",
    },
    category: "paraphrase",
  },
];

type TestResult = {
  id: string;
  category: string;
  pass: boolean;
  reason: string;
  details?: {
    topScore?: number;
    topDocTitle?: string;
    topPage?: number;
    chunkCount?: number;
  };
};

async function runTest(test: RagTest): Promise<TestResult> {
  const result = await retrieve(test.question);
  const top = result.chunks[0];
  const details = {
    topScore: top?.score,
    topDocTitle: top?.document_title,
    topPage: top?.page,
    chunkCount: result.chunks.length,
  };

  if (test.expect.kind === "should_refuse") {
    if (result.belowThreshold || result.chunks.length === 0) {
      return { id: test.id, category: test.category, pass: true, reason: "ok (refus)", details };
    }
    return {
      id: test.id,
      category: test.category,
      pass: false,
      reason: `attendu : refus, obtenu ${result.chunks.length} chunks (top score ${top?.score.toFixed(3)})`,
      details,
    };
  }

  // should_find
  if (result.belowThreshold || !top) {
    return {
      id: test.id,
      category: test.category,
      pass: false,
      reason: "aucun chunk au-dessus du seuil",
      details,
    };
  }

  if (top.score < test.expect.minTopScore) {
    return {
      id: test.id,
      category: test.category,
      pass: false,
      reason: `score top-1 ${top.score.toFixed(3)} < seuil attendu ${test.expect.minTopScore}`,
      details,
    };
  }

  if (test.expect.textIncludes) {
    const needle = test.expect.textIncludes.toLowerCase();
    const found = result.chunks.some((c) =>
      c.text.toLowerCase().includes(needle)
    );
    if (!found) {
      return {
        id: test.id,
        category: test.category,
        pass: false,
        reason: `aucun chunk top-${result.chunks.length} ne contient "${test.expect.textIncludes}"`,
        details,
      };
    }
  }

  if (test.expect.expectDocType && top.document_type !== test.expect.expectDocType) {
    return {
      id: test.id,
      category: test.category,
      pass: false,
      reason: `top-1 type=${top.document_type}, attendu ${test.expect.expectDocType}`,
      details,
    };
  }

  return { id: test.id, category: test.category, pass: true, reason: "ok", details };
}

async function main(): Promise<void> {
  console.log(`\nAcademIA — RAG quality tests (${TESTS.length} tests)\n`);
  console.log(
    `${pad("ID", 22)}${pad("CAT", 12)}${pad("PASS", 6)} TOP    DOC                              REASON`
  );
  console.log("─".repeat(110));

  const results: TestResult[] = [];
  for (const test of TESTS) {
    try {
      const r = await runTest(test);
      results.push(r);
      printRow(r);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      results.push({
        id: test.id,
        category: test.category,
        pass: false,
        reason: `crash: ${msg}`,
      });
      printRow(results[results.length - 1]!);
    }
  }

  const passed = results.filter((r) => r.pass).length;
  const total = results.length;
  console.log("─".repeat(110));
  console.log(
    `\n${passed}/${total} tests passés (${Math.round((passed / total) * 100)}%)\n`
  );

  if (passed !== total) process.exit(1);
}

function printRow(r: TestResult): void {
  const ok = r.pass ? "✓" : "✗";
  const score = r.details?.topScore?.toFixed(3) ?? "—";
  const doc = r.details?.topDocTitle
    ? `${r.details.topDocTitle.slice(0, 30)} p.${r.details.topPage}`
    : "—";
  console.log(
    `${pad(r.id, 22)}${pad(r.category, 12)}${pad(ok, 6)} ${pad(score, 7)}${pad(doc, 34)} ${r.reason}`
  );
}

function pad(s: string, n: number): string {
  if (s.length >= n) return s.slice(0, n - 1) + " ";
  return s + " ".repeat(n - s.length);
}

// Type re-export to avoid unused warning
export type _ = RetrievedChunk;

main().catch((err) => {
  console.error("\nTests RAG : erreur fatale\n", err);
  process.exit(1);
});
