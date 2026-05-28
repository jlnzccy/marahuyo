-- =================================================================
-- marahuyo — anonymous reader state sync
-- localStorage gives the writer's audience zero durability across
-- devices (or a single device clearing cache). This table backs the
-- /api/reader/state route which the client posts to whenever a
-- visit / scroll / like changes. There is no user auth — a random
-- UUID generated client-side keys each device.
--
-- All access is via the service-role admin client (the API route
-- proxies). RLS is enabled but no anon policies are defined, so the
-- public key cannot touch this table.
-- =================================================================

create table if not exists public.reader_state (
  device_id      text not null,
  -- Stable id matching `read/<slug>` for standalones and
  -- `series/<slug>/<chapter>` for chapters — same shape as the
  -- localStorage keys lib/bookmarks.ts already writes.
  key            text not null,
  kind           text,
  title          text,
  href           text,
  subtitle       text,
  scroll_percent integer not null default 0
    check (scroll_percent between 0 and 100),
  liked          boolean not null default false,
  visited_at     timestamptz not null default now(),
  primary key (device_id, key)
);

create index if not exists reader_state_device_idx
  on public.reader_state (device_id, visited_at desc);

alter table public.reader_state enable row level security;
