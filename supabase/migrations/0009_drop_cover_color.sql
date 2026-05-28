-- =================================================================
-- marahuyo — drop unused works.cover_color column
-- It was added in 0001_init as a decorative tint for cards, but never
-- surfaced through any picker or read API. Removing it ahead of any
-- future schema reads against the generated types so they stay lean.
--
-- The works_public view (0001_init) selects *, so it pins every column
-- as a dependency. Drop + recreate around the column drop.
-- =================================================================

drop view if exists public.works_public;

alter table public.works drop column if exists cover_color;

create or replace view public.works_public as
  select * from public.works where status = 'published';
