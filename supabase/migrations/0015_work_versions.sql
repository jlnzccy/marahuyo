-- =================================================================
-- marahuyo — version history snapshots for works
-- A version row is written every time a work is published (or restored
-- from one). Body + title + excerpt are captured pre-write so the
-- writer can roll back without losing intermediate states.
--
-- Chapter version history is intentionally deferred — chapters tend to
-- evolve as part of a series whose schema we may yet change.
-- =================================================================

create table if not exists public.work_versions (
  id        uuid primary key default gen_random_uuid(),
  work_id   uuid not null references public.works(id) on delete cascade,
  title     text not null,
  subtitle  text,
  excerpt   text not null default '',
  body      text not null default '',
  saved_at  timestamptz not null default now()
);

create index if not exists work_versions_work_id_idx
  on public.work_versions (work_id, saved_at desc);

-- No RLS policies — versions are studio-only via the admin client.
-- (Public reads are barred by default once RLS is enabled.)
alter table public.work_versions enable row level security;
