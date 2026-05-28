-- =================================================================
-- marahuyo — rename settings.substack_url -> medium_url
-- Platform swap: Substack out, Medium in. Existing value (if any) is
-- preserved through the rename — relabel by hand in /studio/settings.
-- Idempotent: tolerates re-runs against DBs already migrated or fresh.
-- =================================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'settings'
      and column_name  = 'substack_url'
  ) then
    alter table public.settings rename column substack_url to medium_url;
  elsif not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'settings'
      and column_name  = 'medium_url'
  ) then
    alter table public.settings add column medium_url text;
  end if;
end$$;
