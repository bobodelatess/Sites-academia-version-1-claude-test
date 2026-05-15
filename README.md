# AcademIA — tuteur de révision RAG pour Analyse 2

Plateforme d'aide à la révision pour une UE de l'université Paul Sabatier
(Toulouse). L'IA répond **uniquement** à partir des supports ingérés (polys,
TD, annales, corrigés) et **cite** chaque affirmation. Pas d'invention.

UE cible du MVP : **Analyse 2** (configurable via env).

## Stack

- **Next.js 16** (App Router) + **TypeScript strict**
- **Tailwind v4** + **shadcn/ui** (style new-york)
- **Supabase** : Postgres + `pgvector` (HNSW cosine) + Storage + Auth
- **Anthropic** `claude-sonnet-4-6` (chat, prompt caching activé)
- **Voyage AI** `voyage-3` (embeddings, 1024 dims)
- Mobile-first, streaming SSE

## Démarrage rapide

### 1. Dépendances

```bash
pnpm install
```

### 2. Provisionner Supabase

Crée un projet sur [supabase.com](https://supabase.com), puis dans le SQL Editor
applique dans l'ordre :

1. `supabase/migrations/0001_init.sql` — schéma + RPC + RLS
2. `supabase/migrations/0002_storage.sql` — bucket `documents`

### 3. Variables d'environnement

```bash
cp .env.local.example .env.local
```

Remplis :

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service-role (serveur uniquement) |
| `ANTHROPIC_API_KEY` | Clé Anthropic |
| `VOYAGE_API_KEY` | Clé Voyage AI |
| `NEXT_PUBLIC_UE_NAME` | Nom affiché de l'UE (def. "Analyse 2") |
| `NEXT_PUBLIC_UE_CODE` | Code interne de l'UE (def. "analyse-2") |
| `RAG_SIMILARITY_THRESHOLD` | Seuil cosine pour le refus (def. 0.55) |
| `RAG_TOP_K` | Nombre de chunks retrieve (def. 8) |
| `RAG_MAX_CONTEXT_CHUNKS` | Budget chunks dans le prompt (def. 6) |

### 4. Lancer

```bash
pnpm dev
```

Ouvre `http://localhost:3000` (redirige vers `/chat`).

## Usage

### Ingérer des supports — `/admin`

Upload de PDFs (cours, TD, TD corrigés, annales, corrigés). Le pipeline :

1. **Parse** PDF → texte par page (`unpdf`, conserve les notations math)
2. **Chunk** ~500 tokens / overlap ~80, page-aware (pas de citation à
   cheval entre pages), respect des paragraphes/phrases
3. **Embed** batch-128 via Voyage `voyage-3` (`input_type=document`)
4. **Upload** PDF dans Supabase Storage (bucket privé)
5. **Insert** atomique : doc + chunks (rollback Storage si DB échoue)

> ⚠️ L'endpoint `/api/ingest` est **ouvert** pour le prototype. À locker
> derrière un check admin avant prod (TODO marqué dans le code).

### Discuter — `/chat`

- Streaming SSE token par token (`event: meta` puis `delta` puis `done`)
- Mémoire de conversation (6 derniers tours) persistée dans Supabase
- Citations cliquables sous chaque réponse → drawer mobile / panneau
  desktop avec l'extrait complet, score, page
- **Garde-fou anti-hallucination** : si aucun chunk au-dessus du seuil,
  l'IA ne se prononce pas (« Je n'ai pas trouvé cette information dans
  tes supports »)
- **Sentinelle citations** : si la réponse ne contient pas `[N]` malgré
  des sources fournies, un bandeau ambre prévient l'utilisateur

## Scripts

```bash
pnpm dev               # serveur de dev (Turbopack)
pnpm build             # build production
pnpm start             # serveur production
pnpm lint              # ESLint
pnpm typecheck         # tsc --noEmit
pnpm retrieve "<q>"    # CLI : top-K chunks pour une question
pnpm test:rag          # 10 tests qualité retrieval (TAF, Rolle, etc.)
```

`pnpm retrieve` et `pnpm test:rag` lisent `.env.local` automatiquement.

## Architecture

```
app/
  api/
    chat/route.ts       streaming SSE + retrieval + Anthropic
    ingest/route.ts     POST upload, GET list, DELETE
  admin/page.tsx        UI ingestion
  chat/page.tsx         UI chat (server component → ChatView)
  page.tsx              redirect → /chat

lib/
  anthropic/
    client.ts           SDK singleton
    prompts.ts          system prompt strict + augmented user msg
  db/
    client.ts           server / service / browser clients
    env.ts              chargeur Zod-validé
    queries.ts          CRUD typés
    schemas.ts          Zod payloads
    types.ts            Database type miroir
  embeddings/
    voyage.ts           client Voyage (batch 128)
  rag/
    pdf.ts              parsing page-aware
    chunking.ts         500 tokens / overlap 80 / page-bounded
    retrieve.ts         embed → match_chunks → enrichi documents

components/
  chat/                 ChatView, ChatMessage, ChatInput,
                        CitationChip, CitationPanel, useChatStream
  admin/                AdminPanel, DocumentUploader, DocumentList
  ui/                   shadcn (Button)

supabase/migrations/    0001_init.sql, 0002_storage.sql
scripts/retrieve.ts     CLI debug retrieval
tests/rag-quality.ts    suite de tests RAG (10 cas)
```

## Tuning RAG

Si trop de refus → baisse `RAG_SIMILARITY_THRESHOLD` (par ex. 0.45).
Si réponses bruitées / hors-sujet → monte le seuil (0.6+).

`pnpm test:rag` calibre vite : observe le score top-1 des questions
`should_find` et règle le seuil entre celui-là et le top-1 des
questions `should_refuse`.

## Hors périmètre du MVP

Volontairement non implémenté à ce stade :

- Plusieurs UE (une seule, hardcodée par env)
- Auth université / SSO Paul Sabatier
- Mode quiz / interrogation
- Vérification de démonstration
- Partage social
- Paiement

## Déploiement Vercel

`pnpm build` est compatible Vercel. Configurer les env vars dans le
dashboard. `/api/chat` et `/api/ingest` tournent en **runtime nodejs**
(pas Edge — voyage SDK + streams Anthropic).

`maxDuration` : 60 s. À monter selon la taille des PDFs ingérés (sur
Vercel Pro ; gratuit limite à 10 s).

---

License : privé / prototype interne.
