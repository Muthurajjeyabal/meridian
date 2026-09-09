-- Optional SQL seed. The running demo uses src/lib/seed.ts so the UI works
-- before a live Supabase project exists. When you attach Supabase, recreate
-- two schools (Northridge Academy, Harborview Public School), the 2026-2027
-- year, classes LKG–XII with sections A–D, and the demo users listed in README.
--
-- Auth users must be created with supabase.auth.admin.createUser, then linked
-- through public.profiles.auth_user_id. Do not insert into auth.users by hand
-- unless you know the hashing format.
select 'Run schema.sql and rls.sql first. Application demo data lives in src/lib/seed.ts.' as note;
