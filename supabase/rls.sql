-- Row Level Security — school isolation is enforced in Postgres, not only the UI.
alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.sections enable row level security;
alter table public.subjects enable row level security;
alter table public.class_subjects enable row level security;
alter table public.teachers enable row level security;
alter table public.teacher_subjects enable row level security;
alter table public.parents enable row level security;
alter table public.students enable row level security;
alter table public.student_parents enable row level security;
alter table public.student_profiles enable row level security;
alter table public.student_health_records enable row level security;
alter table public.attendance enable row level security;
alter table public.homework enable row level security;
alter table public.homework_submissions enable row level security;
alter table public.grading_systems enable row level security;
alter table public.exams enable row level security;
alter table public.exam_subjects enable row level security;
alter table public.marks enable row level security;
alter table public.fee_structures enable row level security;
alter table public.student_fees enable row level security;
alter table public.payments enable row level security;
alter table public.payment_allocations enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.circulars enable row level security;
alter table public.news enable row level security;
alter table public.messages enable row level security;
alter table public.message_recipients enable row level security;
alter table public.notifications enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.circular_reads enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: a user can see their own profile; school staff can see profiles in their schools
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles
  for select using (
    auth_user_id = auth.uid()
    or public.is_super_admin()
    or id in (
      select ur.profile_id from public.user_roles ur
      where ur.school_id in (select public.user_school_ids())
    )
  );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update using (auth_user_id = auth.uid() or public.is_super_admin());

drop policy if exists schools_access on public.schools;
create policy schools_access on public.schools
  for select using (public.is_super_admin() or id in (select public.user_school_ids()));

drop policy if exists schools_super_write on public.schools;
create policy schools_super_write on public.schools
  for all using (public.is_super_admin()) with check (public.is_super_admin());

drop policy if exists roles_read on public.user_roles;
create policy roles_read on public.user_roles
  for select using (
    public.is_super_admin()
    or profile_id = public.current_profile_id()
    or (school_id is not null and public.has_school_role(school_id, array['school_admin']::public.app_role[]))
  );

-- Generic tenant isolation for school-scoped tables
create or replace function public.attach_tenant_policies(p_table text)
returns void language plpgsql as $$
begin
  execute format('drop policy if exists %I_tenant_select on public.%I', p_table, p_table);
  execute format(
    'create policy %I_tenant_select on public.%I for select using (
       public.is_super_admin() or school_id in (select public.user_school_ids())
     )', p_table, p_table);

  execute format('drop policy if exists %I_tenant_write on public.%I', p_table, p_table);
  execute format(
    'create policy %I_tenant_write on public.%I for all using (
       public.is_super_admin()
       or public.has_school_role(school_id, array[''school_admin'',''teacher'']::public.app_role[])
     ) with check (
       public.is_super_admin()
       or public.has_school_role(school_id, array[''school_admin'',''teacher'']::public.app_role[])
     )', p_table, p_table);
end $$;

select public.attach_tenant_policies(t) from unnest(array[
  'academic_years','classes','sections','subjects','class_subjects',
  'teachers','teacher_subjects','parents','students','student_parents',
  'student_profiles','attendance','homework','homework_submissions',
  'grading_systems','exams','exam_subjects','marks','fee_structures',
  'student_fees','payments','payment_allocations','payment_receipts',
  'circulars','news','messages','message_recipients','notifications',
  'circular_reads','audit_logs'
]) as t;

-- Parents can read their own children only
drop policy if exists students_parent_read on public.students;
create policy students_parent_read on public.students
  for select using (
    id in (
      select sp.student_id from public.student_parents sp
      join public.parents pr on pr.id = sp.parent_id
      where pr.profile_id = public.current_profile_id()
    )
  );

drop policy if exists health_parent_read on public.student_health_records;
create policy health_parent_read on public.student_health_records
  for select using (
    visible_to_parents = true
    and student_id in (
      select sp.student_id from public.student_parents sp
      join public.parents pr on pr.id = sp.parent_id
      where pr.profile_id = public.current_profile_id()
    )
  );

drop policy if exists health_staff on public.student_health_records;
create policy health_staff on public.student_health_records
  for all using (
    public.is_super_admin()
    or public.has_school_role(school_id, array['school_admin']::public.app_role[])
  );

-- Parents may insert payments for their children but cannot mark them successful
drop policy if exists payments_parent_insert on public.payments;
create policy payments_parent_insert on public.payments
  for insert with check (
    student_id in (
      select sp.student_id from public.student_parents sp
      join public.parents pr on pr.id = sp.parent_id
      where pr.profile_id = public.current_profile_id()
    )
    and status in ('initiated','pending')
  );

drop policy if exists payments_parent_read on public.payments;
create policy payments_parent_read on public.payments
  for select using (
    student_id in (
      select sp.student_id from public.student_parents sp
      join public.parents pr on pr.id = sp.parent_id
      where pr.profile_id = public.current_profile_id()
    )
  );

drop policy if exists homework_parent_update on public.homework_submissions;
create policy homework_parent_update on public.homework_submissions
  for update using (
    student_id in (
      select sp.student_id from public.student_parents sp
      join public.parents pr on pr.id = sp.parent_id
      where pr.profile_id = public.current_profile_id()
    )
  );

drop policy if exists notifications_self on public.notifications;
create policy notifications_self on public.notifications
  for select using (profile_id = public.current_profile_id() or public.is_super_admin());

drop policy if exists notifications_self_upd on public.notifications;
create policy notifications_self_upd on public.notifications
  for update using (profile_id = public.current_profile_id());

drop policy if exists prefs_self on public.notification_preferences;
create policy prefs_self on public.notification_preferences
  for all using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
