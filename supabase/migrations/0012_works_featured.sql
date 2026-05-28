-- =================================================================
-- marahuyo — explicit "featured" flag on works
-- One row at a time, but the schema doesn't enforce uniqueness — the
-- homepage's getFeaturedWork() picks the most recently published among
-- featured=true rows, then falls back to the most recent published row.
-- A partial index keeps the lookup cheap as the archive grows.
-- =================================================================

alter table public.works
  add column if not exists featured boolean not null default false;

create index if not exists works_featured_idx
  on public.works (featured)
  where featured = true;
