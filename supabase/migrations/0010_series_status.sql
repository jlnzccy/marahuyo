-- =================================================================
-- marahuyo — series_status enum + column
-- Adds an editorial state to series rows so the public page can say
-- "ongoing / completed / hiatus" instead of hard-coding "ongoing".
-- The column lives on the parent works row (only used when kind='series')
-- and defaults to 'ongoing' so existing rows render unchanged.
-- =================================================================

do $$ begin
  create type series_status as enum ('ongoing', 'completed', 'hiatus');
exception when duplicate_object then null; end $$;

alter table public.works
  add column if not exists series_status series_status not null default 'ongoing';
