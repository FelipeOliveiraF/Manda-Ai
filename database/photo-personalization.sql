-- Applied through Supabase migrations room_and_profile_photos and
-- qualify_photo_storage_object_paths. Objects are private; access follows
-- profiles/rooms SELECT RLS, uploads and removal are owner-only.
alter table public.rooms add column if not exists avatar_url text;
grant update(avatar_url,name) on public.rooms to authenticated;
grant update(avatar_url,display_name) on public.profiles to authenticated;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('mostra-photos','mostra-photos',false,1048576,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy mostra_photos_read on storage.objects for select to authenticated using (
 bucket_id='mostra-photos' and (
 ((storage.foldername(objects.name))[1]='profiles' and exists(select 1 from public.profiles p where p.id::text=(storage.foldername(objects.name))[2]))
 or ((storage.foldername(objects.name))[1]='rooms' and exists(select 1 from public.rooms r where r.id::text=(storage.foldername(objects.name))[2]))
 ));
create policy mostra_photos_insert on storage.objects for insert to authenticated with check (
 bucket_id='mostra-photos' and (
 ((storage.foldername(objects.name))[1]='profiles' and (storage.foldername(objects.name))[2]=(select auth.uid())::text)
 or ((storage.foldername(objects.name))[1]='rooms' and exists(select 1 from public.rooms r where r.id::text=(storage.foldername(objects.name))[2] and r.owner_id=(select auth.uid())))
 ));
create policy mostra_photos_delete on storage.objects for delete to authenticated using (
 bucket_id='mostra-photos' and (
 ((storage.foldername(objects.name))[1]='profiles' and (storage.foldername(objects.name))[2]=(select auth.uid())::text)
 or ((storage.foldername(objects.name))[1]='rooms' and exists(select 1 from public.rooms r where r.id::text=(storage.foldername(objects.name))[2] and r.owner_id=(select auth.uid())))
 ));
