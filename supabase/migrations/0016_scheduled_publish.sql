-- =================================================================
-- marahuyo — scheduled publishing
-- Adds a nullable scheduled_at column to works. A Vercel cron route
-- (/api/cron/publish) sweeps rows where status='draft' and
-- scheduled_at <= now() and flips them to published.
--
-- Chapter-level scheduling is intentionally deferred. The series editor
-- already publishes chapters in any order; if a writer needs timed
-- chapter drops it's a separate UX problem.
-- =================================================================

alter table public.works
  add column if not exists scheduled_at timestamptz;

create index if not exists works_scheduled_at_idx
  on public.works (scheduled_at)
  where status = 'draft' and scheduled_at is not null;
