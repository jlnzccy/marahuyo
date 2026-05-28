-- =================================================================
-- marahuyo — restrict settings public-read RLS
--
-- Replaces the blanket SELECT policy with a view that exposes only
-- safe columns.  contact_email is INCLUDED because it's shown on
-- the /contact page.
-- =================================================================

-- 1. Create a public-safe view (excludes nothing sensitive for now,
--    but gives us a controlled surface we can trim later).
create or replace view public.settings_public as
  select
    id,
    default_theme,
    instagram_url,
    twitter_url,
    medium_url,
    github_url,
    contact_email,          -- kept: used on /contact page
    portrait_url,
    author_subtitle,
    author_name,
    author_handle,
    author_tagline,
    author_short_bio,
    author_bio,
    author_bio_long,
    author_location,
    about_place_title,
    about_place_body,
    about_place_quote,
    updated_at
  from public.settings;

-- 2. Drop the blanket "anyone can SELECT the whole table" policy.
--    Service-role key bypasses RLS, so studio writes are unaffected.
drop policy if exists settings_public_read on public.settings;
create policy settings_admin_read
  on public.settings for select
  using (false);            -- anon can no longer hit the table directly

-- 3. Let anon read via the view instead.
grant select on public.settings_public to anon;
grant select on public.settings_public to authenticated;
