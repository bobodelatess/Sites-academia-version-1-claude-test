# AcademIA — Rapport d'audit & pistes d'amélioration

Audit réalisé sur la branche `claude/ai-learning-platform-8DZR9` après livraison
des 8 phases du MVP. Issu d'une revue ligne à ligne des fichiers critiques.

**Bilan :** le MVP atteint le périmètre du brief, mais il n'est **pas prêt pour
des utilisateurs réels**. Les blocages les plus urgents tournent autour de la
sécurité (endpoint d'ingestion ouvert), du coût (aucun rate-limit ni
interruption serveur), et de la qualité RAG (chunking qui peut couper le
LaTeX, prompt caching inopérant).

---

## TL;DR — les 10 à régler en priorité

| # | Sujet | Sévérité | Fichier |
|---|---|---|---|
| 1 | `/api/ingest` ouvert : n'importe qui peut uploader/supprimer | **Critique** | `app/api/ingest/route.ts` |
| 2 | Aucun rate-limit sur `/api/chat` ni `/api/ingest` (coût Anthropic/Voyage) | **Critique** | les 2 routes |
| 3 | `maxDuration = 60` incompatible Vercel Free (10 s) — déploiement cassé | **Critique** | `app/api/{chat,ingest}/route.ts` |
| 4 | Auth magic-link + check domaine universitaire jamais implémentés (brief) | **Critique** | absent |
| 5 | Pas d'idempotence ingest (mêmes chunks dupliqués si re-upload) → biais RAG | **Majeur** | `app/api/ingest/route.ts` |
| 6 | Chunking ne préserve pas les blocs LaTeX malgré le commentaire | **Majeur** | `lib/rag/chunking.ts` |
| 7 | Reranker `voyage-rerank-2.5` absent (qualité top-K médiocre) | **Majeur** | `lib/embeddings/voyage.ts` |
| 8 | Stream Anthropic non interruptible côté serveur (coût + tokens gaspillés) | **Majeur** | `app/api/chat/route.ts` |
| 9 | Conversation perdue au reload (rien en localStorage, pas de fetch historique) | **Majeur** | `components/chat/use-chat-stream.ts` |
| 10 | `userScalable: false` + textarea < 16 px = zoom forcé iOS + violation WCAG | **Majeur** | `app/layout.tsx`, `chat-input.tsx` |

---

## 1. Sécurité

### Critique

- **`/api/ingest` totalement ouvert** — `app/api/ingest/route.ts` : `POST` et `DELETE` n'ont aucun check d'auth. Exploitable pour DoS (embeddings facturés) ou pour supprimer des docs.
  → *Fix : middleware avec cookie/JWT signé ou rôle Supabase admin.*

### Majeur

- **Pas de limite de taille PDF** — `app/api/ingest/route.ts:68` lit `arrayBuffer()` sans plafond → OOM en serverless.
  → *Fix : rejeter si `file.size > 25 MB`.*
- **Bucket privé sans signed URLs** — Le README annonce des liens de citation vers PDF mais `createSignedUrl` n'est appelé nulle part. Le `CitationPanel` ne propose pas le lien.
  → *Fix : générer une signed URL (15 min) côté `/api/chat` et la passer dans `sources`.*
- **XSS potentiel via KaTeX** — `react-markdown` + `rehype-katex` sans `rehype-sanitize`. KaTeX a eu des CVE via `\href{javascript:...}`. Risque si un PDF contient du LaTeX malicieux.
  → *Fix : `KaTeXOptions { trust: false, strict: 'ignore' }` + ajouter `rehype-sanitize`.*
- **Injection de prompt via `document_title`** — `lib/anthropic/prompts.ts:50` interpole le titre tel quel. Un PDF avec titre malicieux peut détourner les instructions.
  → *Fix : entourer chaque source de balises XML reconnaissables et sanitiser le titre.*
- **`userScalable: false` + `maximumScale: 1`** — `app/layout.tsx:23-26` : empêche le zoom utilisateur (violation **WCAG 1.4.4**).
  → *Fix : retirer ces deux propriétés.*

### Mineur

- Validation par `file.type` (client-fournie) au lieu des magic bytes `%PDF`. *Fix : check des 4 premiers octets.*
- `storage_path` non préfixé par UUID document → collision possible en uploads concurrents. *Fix : `crypto.randomUUID()` dans le chemin.*
- RLS activé sur `conversations`/`messages` mais aucune policy → comportement implicite "deny all" via service-role uniquement. *Fix : policy explicite documentée.*
- Pas de commentaire de scope sur `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local.example`.
- Pas de CORS configuré explicitement dans `next.config.ts`.

---

## 2. Robustesse / fiabilité

### Majeur

- **Pas de transaction DB sur l'ingest** — `app/api/ingest/route.ts:118-153` : si `insertChunks` échoue à mi-parcours, le document existe avec des chunks partiels. Le rollback ne nettoie que Storage.
  → *Fix : RPC PL/pgSQL atomique `ingest_document(doc, chunks[])`, ou cleanup `deleteDocument` dans le `catch`.*
- **Pas de retry sur Voyage** — `lib/embeddings/voyage.ts` : un 429/503 fait échouer toute l'ingestion.
  → *Fix : retry exponentiel (3 essais, 500 ms / 2 s / 5 s) sur 429 ou ≥500.*
- **Pas d'idempotence ingest** — Re-upload du même PDF crée un doublon → biais RAG (double-poids).
  → *Fix : `content_hash` SHA-256 sur le buffer + colonne `unique`.*
- **Stream Anthropic non interruptible** — `app/api/chat/route.ts:190-198` ne lit pas `request.signal`. Si le client `abort`, le serveur continue de consommer tokens et persiste le message à la fin.
  → *Fix : `request.signal.addEventListener('abort', () => anthropicStream.controller.abort())`.*
- **Anthropic error post-stream-start** — le SDK retry sur 429 mais une `overloaded_error` après le début du stream coupe sans `event: error`.
  → *Fix : try/catch dans la boucle `for await` qui réémet un event SSE propre.*

### Mineur

- `page_count: result.totalPages` retourné par `lib/rag/pdf.ts:31` ≠ `pages.length` filtré → décompte affiché incorrect.
- Race condition possible sur `appendMessage` user vs assistant (timing `created_at`).
- Fallback `Math.random()` pour `cryptoRandomId` (`use-chat-stream.ts:166`) — pas un UUID valide.
- `getServerEnv()` mis en cache → impossible de hot-reload les env vars en dev.

---

## 3. Qualité RAG

### Majeur

- **Chunking ne préserve PAS le LaTeX** — `lib/rag/chunking.ts` annonce dans son commentaire « préserve les blocs LaTeX » mais aucune logique ne vérifie la parité des `$$`, `\begin{...}\end{...}`. Un chunk peut couper en plein milieu d'une équation, ruinant les citations.
  → *Fix : avant flush, vérifier `$$` équilibrés et reculer à la frontière sûre.*
- **Tokens estimés en `chars/4`** — Sous-estime systématiquement les passages math-dense (LaTeX dense). Budget RAG faux.
  → *Fix : `@anthropic-ai/tokenizer` ou `tiktoken` pour le comptage.*
- **Pas de reranking** — `lib/rag/retrieve.ts` retourne le top-K cosine brut. Voyage propose `rerank-2.5` qui améliore largement la précision top-1. Mentionné comme reco dans mon plan initial, jamais implémenté.
  → *Fix : appel `voyage-rerank` sur top-20 → garder top-6.*
- **Pas de query rewriting / multi-query** — Une question courte (« Rolle ? ») embed mal.
  → *Fix : étape pré-retrieval qui génère 3 reformulations via Claude haiku puis fusionne (RRF).*
- **Threshold dur 0.55** — Pas adaptatif. `tests/rag-quality.ts` montre déjà des cas à 0.45.
  → *Fix : seuil relatif (`top_score - δ`) ou plus permissif + reranker pour compenser le bruit.*
- **PDF parsing sans OCR fallback** — Pages scannées (annales) retournent texte vide, silencieusement ignorées.
  → *Fix : log warning par page vide ; plan d'OCR (Tesseract, Mistral OCR API).*
- **Historique brut réinjecté avec ses `[N]` obsolètes** — `app/api/chat/route.ts:167-173` : les anciens `[1]`, `[2]` du tour précédent ne correspondent plus aux extraits du tour courant. Confusion modèle.
  → *Fix : retirer les `[N]` des messages historiques avant injection, ou stocker la version sans citations.*

### Mineur

- `splitSentences` casse sur abréviations (« M. Dupont », « f. continue »).
- Filtre seulement par `ue_code` — pas de filtre par `type` au retrieve (cours vs annale).
- Pas de déduplication intra-doc (MMR).
- System prompt ne précise pas le format de sortie (markdown, listes).

---

## 4. UX / accessibilité

### Majeur

- **Conversation perdue au reload** — `use-chat-stream.ts:13` stocke `conversationIdRef` en mémoire seulement. Pas de localStorage, pas de fetch initial.
  → *Fix : persister `conversation_id` en localStorage + `GET /api/chat/:id` au mount.*
- **`autoFocus` textarea sur mobile** — `chat-input.tsx:64` : ouvre le clavier iOS au load, viewport saute.
  → *Fix : `autoFocus` conditionnel desktop (`useEffect` + `matchMedia`).*
- **`scrollIntoView` sur chaque token** — `chat-view.tsx:27-29` casse la lecture si l'utilisateur a remonté.
  → *Fix : tracker `userScrolledUp` (`onScroll`) et désactiver l'autoscroll s'il a remonté.*
- **`onStop={reset}` vide TOUTE la conversation** — `chat-input.tsx:71` : confondre stop et reset.
  → *Fix : séparer `abort()` (fermer stream + sauver message partiel) de `reset()` (clear).*
- **Pas d'`aria-live` sur la zone messages** — les lecteurs d'écran ne suivent pas le streaming.
  → *Fix : `<div aria-live="polite" aria-atomic="false">` autour de la liste.*

### Mineur

- Pas de bouton « réessayer » sur erreur réseau.
- Pas de focus management : le focus ne revient pas sur le textarea après `done`.
- `CitationChip` : `title` seul, pas d'`aria-label` descriptif (texte tronqué).
- Bandeau d'erreur sans `role="alert"`.
- Bouton « Nouvelle conversation » : texte caché en mobile, pas d'`aria-label`.
- Drawer mobile sans gesture de fermeture (swipe down).

---

## 5. Architecture & dette technique

### Majeur

- **Types DB miroirs manuels jamais validés** — `lib/db/types.ts` documenté « à régénérer », aucune CI ne vérifie qu'ils correspondent à la DB réelle.
  → *Fix : `supabase gen types` dans `pnpm prebuild` + GitHub Action sur PR.*
- **Aucun workflow CI** — `pnpm lint` / `pnpm typecheck` / `pnpm test:rag` tournent localement, pas sur PR.
  → *Fix : `.github/workflows/ci.yml` minimal.*

### Mineur

- Constantes RAG dispersées : `RAG_MAX_CONTEXT_CHUNKS` (env), `CHUNK_TOKEN_BUDGET=3000` (route), `HISTORY_TURNS=6` (route). *Fix : `lib/rag/config.ts`.*
- `RAG_MAX_CONTEXT_CHUNKS` défini mais jamais utilisé. *Code mort ou à câbler dans `trimToBudget`.*
- `createBrowserClient` / `createServerClient` / `countChunks` jamais importés. *Code mort.*
- `<style>` inline dans `document-uploader.tsx:140-152` (anti-pattern). *Fix : Tailwind ou globals.css.*
- `HISTORY_TURNS * 2` : convention obscure. *Fix : `HISTORY_MESSAGES = 12` direct.*
- Pas d'abstraction `Logger` (`console.error` éparpillé).

---

## 6. Observabilité & coût

### Critique

- **Aucun rate-limit** — `/api/chat` et `/api/ingest` exposés sans limite. Un bot peut spammer et faire exploser la facture Anthropic.
  → *Fix : `@upstash/ratelimit` keyed par IP (anon) ou user (auth).*

### Majeur

- **Tokens Anthropic non capturés** — La boucle `for await` du chat lit `content_block_delta` uniquement, ignore `message_delta.usage` (input, output, cache_read, cache_create). Aucune visibilité coût.
  → *Fix : lire les events `message_delta` / `message_stop`, logger en JSON structuré.*
- **Tokens Voyage non capturés** — `data.usage.total_tokens` ignoré.
- **Pas de log structuré** — `console.error("[chat]")` sans JSON, pas de request_id, pas de corrélation.
- **Pas de Sentry / APM** — Erreurs serveur invisibles en prod.
- **Pas de timeout interne sur le chat** — Si Anthropic met 65 s, Vercel coupe brutalement, message non persisté.
  → *Fix : `AbortController` avec `setTimeout(50_000)` + finalize propre.*

---

## 7. Tests

### Majeur

- **Aucun test unitaire** — `chunkPages`, `splitSentences`, `parseSseBlock` non testés malgré leur complexité.
  → *Fix : Vitest, fixtures markdown + LaTeX.*
- **Aucun test API** — `/api/chat`, `/api/ingest` non couverts.
  → *Fix : tests intégration avec un Supabase de test.*
- **`test:rag` dépend du corpus runtime** — Pas reproductible sans données. Aucun mini-corpus fixture committé.

### Mineur

- Pas de tests E2E (Playwright sur les pages).
- Pas de tests du rendu markdown (cas math complexes).

---

## 8. Mobile

### Majeur

- **`userScalable: false`** (déjà cité §1) + **textarea `text-sm` (14 px)** déclenche le zoom auto iOS au focus.
  → *Fix : retirer `userScalable: false` ; `text-base` (16 px) sur l'input ; `font-size: 16px` au minimum.*

### Mineur

- Drawer citation ne respecte pas `safe-area-inset-bottom`.
- `100dvh` sans fallback pour iOS < 15.4.
- Bouton « Nouvelle conversation » avec texte caché en mobile (icône seule). *Ajouter `aria-label`.*
- Aucun screenshot 375 px committé comme preuve de test.

---

## 9. Déploiement Vercel

### Critique

- **`maxDuration = 60` vs Vercel Free = 10 s** — `app/api/{chat,ingest}/route.ts` : `chat` peut éventuellement tenir, mais `ingest` d'un poly de 100 pages dépassera **systématiquement**.
  → *Fix : Vercel Pro (60 s) **ou** sortir l'ingestion en background job (Inngest, Trigger.dev, Supabase Queue).*

### Majeur

- **`next.config.ts` vide** — pas de `serverExternalPackages: ['unpdf']`. Bundle Vercel potentiellement cassé (unpdf utilise des binaires natifs).
- **Env vars validées au runtime, pas au build** — `getServerEnv()` parse `process.env` au premier appel. Une var manquante = crash silencieux au premier user.
  → *Fix : script `prebuild` qui valide.*

### Mineur

- Pas de `vercel.json` (overrides memory, cron).
- Pas de plan documenté pour la région du bucket Supabase.

---

## 10. Manques vs brief original

### Critique

- **Auth magic-link absente** — Brief mentionne Supabase Auth. Zéro flow signin, `documents.uploaded_by` jamais peuplé.
  → *Fix : page `/login` avec `signInWithOtp` + middleware.*
- **Check domaine universitaire absent** — Pas de garde sur l'email (« @univ-tlse3.fr »).

### Majeur

- **Prompt caching inopérant** — System prompt ~600 caractères, sous le seuil de 1 024 tokens où le cache s'active. Le `cache_control` est envoyé mais sans effet.
  → *Fix : enrichir le prompt système (formats, exemples, glossaire de la matière) jusqu'à ~1 500 tokens, OU appliquer aussi le cache aux chunks fournis (gros levier).*
- **Reranker Voyage non câblé** (déjà cité §3).
- **`session_id` cookie jamais utilisé** — Colonne prévue, jamais lue/écrite. Plusieurs onglets/devices d'un même utilisateur anon sont orphelins.

### Mineur

- Lighthouse > 90 non vérifié (aucun rapport committé).
- Pas d'image OG, pas de PWA manifest.
- Réponse de refus très générique (`prompts.ts`).
- Pas de `robots.txt` ; le prototype est indexable.

---

## Sprint suggéré (1 semaine)

**Jour 1-2 — sécurité & coût (les 4 critiques + 2)**
1. Middleware d'auth admin sur `/api/ingest`
2. Rate-limit Upstash sur `/api/chat` et `/api/ingest`
3. Sortir l'ingestion en background job (Trigger.dev gratuit) → résout aussi `maxDuration`
4. Magic-link Supabase + check domaine
5. Limite taille PDF + magic bytes
6. Hash SHA-256 → idempotence

**Jour 3 — qualité RAG**
7. Ajouter Voyage rerank-2.5
8. Préserver `$$...$$` dans le chunking
9. Capturer `usage` tokens (Anthropic + Voyage) avec log JSON
10. Retry exponentiel sur Voyage

**Jour 4 — UX**
11. Persistance conversation_id en localStorage + fetch historique au mount
12. Séparer `abort` de `reset`
13. Désactiver autoscroll quand user a scrollé manuellement
14. Retirer `userScalable: false`, passer textarea en 16 px
15. `aria-live` + `role="alert"`

**Jour 5 — tests & CI**
16. Workflow GHA : `lint + typecheck + build` sur PR
17. Vitest sur `chunkPages` + `parseSseBlock`
18. Fixture corpus minimal pour `test:rag` reproductible
19. Signed URLs pour les PDFs dans le panneau de citation

Le reste (Sentry, query rewriting, OCR, Lighthouse, prompt caching effectif,
MMR) peut entrer dans un sprint 2 selon les retours utilisateur.
