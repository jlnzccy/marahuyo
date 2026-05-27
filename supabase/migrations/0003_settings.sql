-- =================================================================
-- marahuyo — settings (singleton row for site-wide config)
-- =================================================================

create table if not exists public.settings (
  id              text primary key default 'singleton',
  default_theme   text not null default 'light',
  instagram_url   text,
  twitter_url     text,
  substack_url    text,
  github_url      text,
  contact_email   text,
  portrait_url    text,
  author_subtitle text,
  updated_at      timestamptz not null default now(),
  -- Enforce a single row by constraining id to a fixed literal.
  constraint settings_singleton check (id = 'singleton')
);

-- Seed the singleton row if it doesn't exist yet.
insert into public.settings (id) values ('singleton')
on conflict (id) do nothing;

drop trigger if exists settings_set_updated_at on public.settings;
create trigger settings_set_updated_at
  before update on public.settings
  for each row execute function public.set_updated_at();

-- ----- Row Level Security ------------------------------------------
-- Public can read the row (so the public site can pick up theme / socials
-- without a service-role round-trip). Writes still go through the secret
-- key — no write policy is created.
alter table public.settings enable row level security;

drop policy if exists settings_public_read on public.settings;
create policy settings_public_read
  on public.settings for select
  using (true);
