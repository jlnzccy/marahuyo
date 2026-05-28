-- =================================================================
-- marahuyo — soft delete on works + chapters
-- Adds a nullable `deleted_at` column to both tables. All public read
-- APIs filter `deleted_at is null`; the studio has a Trash view that
-- shows the inverse and exposes restore. There is no auto-purge cron
-- yet — anything in trash stays there until manually removed.
-- =================================================================

alter table public.works
  add column if not exists deleted_at timestamptz;

alter table public.chapters
  add column if not exists deleted_at timestamptz;

create index if not exists works_deleted_at_idx
  on public.works (deleted_at);

create index if not exists chapters_deleted_at_idx
  on public.chapters (deleted_at);

-- RLS: published+not-deleted only via the anon key. Defense-in-depth so a
-- raw query bypassing lib/works.ts can't surface trashed rows.
drop policy if exists works_public_read on public.works;
create policy works_public_read
  on public.works for select
  using (status = 'published' and deleted_at is null);

drop policy if exists chapters_public_read on public.chapters;
create policy chapters_public_read
  on public.chapters for select
  using (
    status = 'published'
    and deleted_at is null
    and exists (
      select 1 from public.works w
      where w.id = chapters.series_id
        and w.status = 'published'
        and w.deleted_at is null
    )
  );
