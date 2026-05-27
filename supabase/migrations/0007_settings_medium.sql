-- =================================================================
-- marahuyo — rename settings.substack_url -> medium_url
-- Platform swap: Substack out, Medium in. Existing value (if any) is
-- preserved through the rename — relabel by hand in /studio/settings.
-- =================================================================

alter table public.settings
  rename column substack_url to medium_url;
