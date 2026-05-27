-- =================================================================
-- marahuyo — extend settings with editable author/about fields
-- Adds the columns the public About + Home pages need so they can stop
-- reading from the static AUTHOR constant in mock-content.ts.
-- =================================================================

alter table public.settings
  add column if not exists author_name      text,
  add column if not exists author_handle    text,
  add column if not exists author_tagline   text,
  add column if not exists author_short_bio text,
  add column if not exists author_bio       text,
  add column if not exists author_bio_long  text,
  add column if not exists author_location  text;
