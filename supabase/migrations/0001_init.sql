-- ============================================================
-- AcademIA — initial schema
-- Phase 2 : documents, chunks (pgvector), conversations, messages
-- ============================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "vector";

-- ------------------------------------------------------------
-- documents : un PDF ingéré (poly, TD, annale, corrigé, ...)
-- ------------------------------------------------------------
create table if not exists public.documents (
  id            uuid primary key default uuid_generate_v4(),
  ue_code       text not null,
  title         text not null,
  source        text,                          -- ex: "Exo7"
  type          text not null check (
                  type in ('cours', 'td', 'td-corrige', 'annale', 'corrige', 'autre')
                ),
  storage_path  text not null,                 -- chemin dans le bucket Storage
  page_count    int,
  uploaded_by   uuid references auth.users(id) on delete set null,
  created_at    timestamptz not null default now()
);

create index if not exists documents_ue_code_idx on public.documents(ue_code);
create index if not exists documents_type_idx     on public.documents(type);

-- ------------------------------------------------------------
-- chunks : segments de texte avec embedding voyage-3 (1024 dims)
-- ------------------------------------------------------------
create table if not exists public.chunks (
  id           uuid primary key default uuid_generate_v4(),
  document_id  uuid not null references public.documents(id) on delete cascade,
  ue_code      text not null,                  -- dénormalisé pour filtrer vite
  page         int not null,
  position     int not null,                   -- ordre dans le doc
  text         text not null,
  token_count  int not null,
  embedding    vector(1024) not null,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- HNSW : meilleure latence/rappel que ivfflat pour < quelques millions de chunks.
-- m=16, ef_construction=64 = défaut raisonnable pour pédagogique.
create index if not exists chunks_embedding_hnsw_idx
  on public.chunks
  using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create index if not exists chunks_document_id_idx on public.chunks(document_id);
create index if not exists chunks_ue_code_idx     on public.chunks(ue_code);

-- ------------------------------------------------------------
-- conversations : un thread de chat (anon ou authentifié)
-- ------------------------------------------------------------
create table if not exists public.conversations (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references auth.users(id) on delete set null,
  session_id  text,                            -- cookie pour mode anon (prototype)
  ue_code     text not null,
  title       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists conversations_user_id_idx    on public.conversations(user_id);
create index if not exists conversations_session_id_idx on public.conversations(session_id);

-- ------------------------------------------------------------
-- messages : tour de conversation, avec citations pointant les chunks
-- ------------------------------------------------------------
create table if not exists public.messages (
  id              uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  citations       jsonb not null default '[]'::jsonb,
  -- forme citation : [{ chunk_id, document_id, page, score, label }, ...]
  created_at      timestamptz not null default now()
);

create index if not exists messages_conversation_id_idx on public.messages(conversation_id);

-- updated_at trigger pour conversations
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists conversations_touch on public.conversations;
create trigger conversations_touch
  before update on public.conversations
  for each row execute function public.touch_updated_at();

-- ------------------------------------------------------------
-- RPC : recherche kNN cosine sur les chunks
-- ------------------------------------------------------------
-- Renvoie les top_k chunks dont la similarité cosine >= match_threshold,
-- filtrés par ue_code. Utilisé par lib/rag/retrieve.ts.
create or replace function public.match_chunks(
  query_embedding  vector(1024),
  match_ue_code    text,
  match_threshold  float,
  match_count      int
)
returns table (
  id          uuid,
  document_id uuid,
  page        int,
  position    int,
  text        text,
  token_count int,
  metadata    jsonb,
  similarity  float
)
language sql stable
as $$
  select
    c.id,
    c.document_id,
    c.page,
    c.position,
    c.text,
    c.token_count,
    c.metadata,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.chunks c
  where c.ue_code = match_ue_code
    and 1 - (c.embedding <=> query_embedding) >= match_threshold
  order by c.embedding <=> query_embedding
  limit match_count;
$$;

-- ============================================================
-- Row Level Security
-- ------------------------------------------------------------
-- Stratégie MVP : tous les écrits passent par une route API Next.js
-- qui utilise la service_role key (bypass RLS). Le client navigateur
-- ne touche jamais directement la DB pour écrire.
-- En lecture publique, on autorise uniquement les chunks/documents
-- de l'UE active.
-- ============================================================

alter table public.documents     enable row level security;
alter table public.chunks        enable row level security;
alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

-- documents : lecture publique (anon + auth) sur tous les docs (mono-UE pour le MVP)
drop policy if exists "documents are readable" on public.documents;
create policy "documents are readable"
  on public.documents for select
  using (true);

-- chunks : pareil
drop policy if exists "chunks are readable" on public.chunks;
create policy "chunks are readable"
  on public.chunks for select
  using (true);

-- conversations / messages : pas d'accès direct depuis le client.
-- (Les politiques sont volontairement vides : seul service_role peut écrire/lire.)
