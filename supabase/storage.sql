-- Storage buckets and policies. Files live in Storage, never as large blobs in Postgres.
insert into storage.buckets (id, name, public)
values
  ('school-logos', 'school-logos', true),
  ('student-photos', 'student-photos', false),
  ('teacher-photos', 'teacher-photos', false),
  ('homework', 'homework', false),
  ('circulars', 'circulars', false),
  ('receipts', 'receipts', false),
  ('student-documents', 'student-documents', false)
on conflict (id) do nothing;

-- Path convention: {school_id}/{entity_id}/{filename}
create or replace function public.storage_school_id(name text)
returns uuid language sql immutable as $$
  select nullif(split_part(name, '/', 1), '')::uuid
$$;

drop policy if exists storage_public_logos on storage.objects;
create policy storage_public_logos on storage.objects
  for select using (bucket_id = 'school-logos');

drop policy if exists storage_tenant_read on storage.objects;
create policy storage_tenant_read on storage.objects
  for select using (
    bucket_id in ('student-photos','teacher-photos','homework','circulars','receipts','student-documents')
    and (
      public.is_super_admin()
      or public.storage_school_id(name) in (select public.user_school_ids())
    )
  );

drop policy if exists storage_staff_write on storage.objects;
create policy storage_staff_write on storage.objects
  for insert with check (
    public.is_super_admin()
    or public.has_school_role(
      public.storage_school_id(name),
      array['school_admin','teacher']::public.app_role[]
    )
  );

drop policy if exists storage_staff_update on storage.objects;
create policy storage_staff_update on storage.objects
  for update using (
    public.is_super_admin()
    or public.has_school_role(
      public.storage_school_id(name),
      array['school_admin','teacher']::public.app_role[]
    )
  );

drop policy if exists storage_parent_homework on storage.objects;
create policy storage_parent_homework on storage.objects
  for insert with check (
    bucket_id = 'homework'
    and public.storage_school_id(name) in (select public.user_school_ids())
  );
