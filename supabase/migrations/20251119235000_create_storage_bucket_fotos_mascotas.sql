-- Create bucket 'fotos-mascotas' if it does not exist
insert into storage.buckets (id, name, public)
select 'fotos-mascotas', 'fotos-mascotas', true
where not exists (
  select 1 from storage.buckets where id = 'fotos-mascotas'
);

-- Policy: allow public read (for URL access) on this bucket
do $$
begin
  create policy "public_read_fotos_mascotas" on storage.objects
    for select
    using ( bucket_id = 'fotos-mascotas' );
exception when duplicate_object then
  null;
end $$;

-- Policy: allow authenticated users to insert into this bucket
do $$
begin
  create policy "authenticated_insert_fotos_mascotas" on storage.objects
    for insert to authenticated
    with check ( bucket_id = 'fotos-mascotas' );
exception when duplicate_object then
  null;
end $$;

-- Optional: allow authenticated users to update/delete their own objects
-- Uncomment if needed
-- do $$
-- begin
--   create policy "authenticated_update_fotos_mascotas" on storage.objects
--     for update to authenticated
--     using ( bucket_id = 'fotos-mascotas' )
--     with check ( bucket_id = 'fotos-mascotas' );
-- exception when duplicate_object then
--   null;
-- end $$;
-- do $$
-- begin
--   create policy "authenticated_delete_fotos_mascotas" on storage.objects
--     for delete to authenticated
--     using ( bucket_id = 'fotos-mascotas' );
-- exception when duplicate_object then
--   null;
-- end $$;