-- ============================================================
-- AcademIA — bucket Supabase Storage pour les PDFs ingérés.
-- ============================================================
-- L'accès se fait toujours via service-role (côté serveur Next),
-- les liens de citation utilisent des signed URLs (bypass RLS).

insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
