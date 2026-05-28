-- =================================================================
-- marahuyo — chapter excerpt parity with works
-- Works expose a short hand-written excerpt used on archive cards;
-- chapters had no equivalent which made the series TOC look flat.
-- This adds an excerpt column with the same shape (empty string default).
-- =================================================================

alter table public.chapters
  add column if not exists excerpt text not null default '';
