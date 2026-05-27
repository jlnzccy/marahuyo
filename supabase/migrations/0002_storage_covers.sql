-- =================================================================
-- marahuyo — storage bucket for cover images
-- Adds a public `covers` bucket used by the Studio upload action.
-- Writes go through the service-role client (RLS bypass);
-- reads are allowed to anyone (covers are shown on the public site).
-- =================================================================

-- ----- Bucket -------------------------------------------------------
insert into storage.buckets (id, name, public)
  values ('covers', 'covers', true)
on conflict (id) do update set public = excluded.public;

-- ----- Read policy -------------------------------------------------
-- The default storage RLS denies everything; explicitly allow anon read
-- so <img src="..."> from the public site can fetch the asset.
drop policy if exists "covers public read" on storage.objects;
create policy "covers public read"
  on storage.objects for select
  to public
  using (bucket_id = 'covers');
