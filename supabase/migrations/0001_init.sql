-- =================================================================
-- marahuyo — initial schema
-- Single-author CMS: poems, essays, one-shots, and multi-chapter series.
-- =================================================================

-- Required extensions
create extension if not exists "pgcrypto";

-- ----- Enums --------------------------------------------------------
do $$ begin
  create type work_kind as enum ('poem', 'essay', 'oneshot', 'series');
exception when duplicate_object then null; end $$;

do $$ begin
  create type work_status as enum ('draft', 'published');
exception when duplicate_object then null; end $$;

-- ----- works --------------------------------------------------------
-- Standalone works (poem/essay/oneshot) AND the parent record for a series.
create table if not exists public.works (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  subtitle        text,
  kind            work_kind not null,
  status          work_status not null default 'draft',
  excerpt         text not null default '',
  body            text not null default '',        -- empty for series
  poetry_mode     boolean not null default false,
  tags            text[] not null default '{}',
  cover_image     text,                            -- public URL or storage path
  cover_color     text,                            -- decorative tint for cards
  word_count      integer not null default 0,
  reading_minutes integer not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists works_kind_status_idx on public.works (kind, status);
create index if not exists works_published_at_idx on public.works (published_at desc);

-- ----- chapters -----------------------------------------------------
-- One row per chapter inside a series (works.kind = 'series').
create table if not exists public.chapters (
  id              uuid primary key default gen_random_uuid(),
  series_id       uuid not null references public.works(id) on delete cascade,
  slug            text not null,
  number          integer not null,
  title           text not null,
  subtitle        text,
  status          work_status not null default 'draft',
  body            text not null default '',
  poetry_mode     boolean not null default false,
  cover_image     text,
  word_count      integer not null default 0,
  reading_minutes integer not null default 0,
  published_at    timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (series_id, slug),
  unique (series_id, number)
);

create index if not exists chapters_series_number_idx
  on public.chapters (series_id, number);

-- ----- updated_at trigger ------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists works_set_updated_at on public.works;
create trigger works_set_updated_at
  before update on public.works
  for each row execute function public.set_updated_at();

drop trigger if exists chapters_set_updated_at on public.chapters;
create trigger chapters_set_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

-- ----- Row Level Security ------------------------------------------
-- Public can ONLY read published rows. All writes go through the
-- server-side service role (Studio CMS); RLS therefore has no write
-- policy for the anon/authenticated roles.
alter table public.works    enable row level security;
alter table public.chapters enable row level security;

drop policy if exists works_public_read on public.works;
create policy works_public_read
  on public.works for select
  using (status = 'published');

drop policy if exists chapters_public_read on public.chapters;
create policy chapters_public_read
  on public.chapters for select
  using (
    status = 'published'
    and exists (
      select 1 from public.works w
      where w.id = chapters.series_id and w.status = 'published'
    )
  );

-- ----- helpful views (optional) -------------------------------------
create or replace view public.works_public as
  select * from public.works where status = 'published';

create or replace view public.chapters_public as
  select c.* from public.chapters c
  join public.works w on w.id = c.series_id
  where c.status = 'published' and w.status = 'published';
