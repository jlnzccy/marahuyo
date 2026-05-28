-- =================================================================
-- marahuyo — full-text search across works + chapters
-- Adds a generated tsvector column on each content table covering
-- title + subtitle + excerpt + body, plus a GIN index. The /search
-- route queries these with ts_rank and renders ts_headline snippets.
--
-- 'english' is the analyzer — fine for the archive's actual content.
-- Switch to 'simple' if multilingual support becomes a need.
-- =================================================================

alter table public.works
  add column if not exists search_tsv tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'C')
  ) stored;

create index if not exists works_search_idx
  on public.works using gin (search_tsv);

alter table public.chapters
  add column if not exists search_tsv tsvector
  generated always as (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(subtitle, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'C')
  ) stored;

create index if not exists chapters_search_idx
  on public.chapters using gin (search_tsv);
