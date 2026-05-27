-- =================================================================
-- marahuyo — add editable "About this place" section to settings
-- =================================================================

alter table public.settings
  add column if not exists about_place_title text,
  add column if not exists about_place_body  text,
  add column if not exists about_place_quote text;
