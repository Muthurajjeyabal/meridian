-- Meridian School OS — multi-tenant PostgreSQL schema for Supabase
create extension if not exists "pgcrypto";

do $$ begin create type public.app_role as enum ('super_admin','school_admin','teacher','parent','student'); exception when duplicate_object then null; end $$;
do $$ begin create type public.attendance_status as enum ('present','absent','late','excused'); exception when duplicate_object then null; end $$;
do $$ begin create type public.gender as enum ('male','female','other','undisclosed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.fee_category as enum ('admission','tuition','term','transport','activity','exam','other'); exception when duplicate_object then null; end $$;
do $$ begin create type public.fee_schedule as enum ('one_time','monthly','term_1','term_2','term_3','annual','custom'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_status as enum ('initiated','pending','processing','success','failed','refunded'); exception when duplicate_object then null; end $$;
do $$ begin create type public.payment_method as enum ('razorpay','cashfree','card','upi','netbanking','cash','cheque','wallet'); exception when duplicate_object then null; end $$;
do $$ begin create type public.homework_status as enum ('assigned','submitted','reviewed','late'); exception when duplicate_object then null; end $$;
do $$ begin create type public.subscription_status as enum ('trial','active','past_due','paused','cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.message_channel as enum ('direct','broadcast','class'); exception when duplicate_object then null; end $$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  legal_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  country text default 'IN',
  logo_path text,
  primary_color text default '#0891b2',
  timezone text default 'Asia/Kolkata',
  currency text default 'INR',
  subscription_status public.subscription_status default 'trial',
  subscription_plan text default 'standard',
  seats_students int default 500,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  email text unique,
  phone text,
  full_name text not null,
  avatar_path text,
  is_active boolean default true,
  last_login_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  school_id uuid references public.schools(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz default now(),
  unique (profile_id, school_id, role)
);

create or replace function public.current_profile_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.profile_id
    where p.auth_user_id = auth.uid() and ur.role = 'super_admin'
  )
$$;

create or replace function public.user_school_ids()
returns setof uuid language sql stable security definer set search_path = public as $$
  select ur.school_id from public.user_roles ur
  join public.profiles p on p.id = ur.profile_id
  where p.auth_user_id = auth.uid() and ur.school_id is not null
$$;

create or replace function public.has_school_role(p_school uuid, p_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_roles ur
    join public.profiles p on p.id = ur.profile_id
    where p.auth_user_id = auth.uid() and ur.school_id = p_school and ur.role = any (p_roles)
  )
$$;

create table if not exists public.academic_years (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  starts_on date not null,
  ends_on date not null,
  is_current boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, name)
);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  display_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, name)
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  name text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (class_id, name)
);

create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  code text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, name)
);

create table if not exists public.class_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  unique (class_id, subject_id)
);

create table if not exists public.teachers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  employee_code text,
  department text,
  qualification text,
  joined_on date,
  photo_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, profile_id)
);

create table if not exists public.teacher_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  teacher_id uuid not null references public.teachers(id) on delete cascade,
  subject_id uuid not null references public.subjects(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  section_id uuid references public.sections(id) on delete set null
);

create table if not exists public.parents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  relation text,
  occupation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, profile_id)
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  academic_year_id uuid not null references public.academic_years(id),
  class_id uuid not null references public.classes(id),
  section_id uuid not null references public.sections(id),
  first_name text not null,
  last_name text not null,
  admission_no text not null,
  roll_no text,
  date_of_birth date,
  gender public.gender default 'undisclosed',
  blood_group text,
  photo_path text,
  email text,
  phone text,
  address text,
  city text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (school_id, admission_no)
);

create table if not exists public.student_parents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  parent_id uuid not null references public.parents(id) on delete cascade,
  relationship text not null default 'guardian',
  is_primary boolean default false,
  unique (student_id, parent_id)
);

create table if not exists public.student_profiles (
  student_id uuid primary key references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  father_name text,
  father_mobile text,
  father_email text,
  mother_name text,
  mother_mobile text,
  mother_email text,
  guardian_name text,
  guardian_mobile text,
  communication_mobile text,
  communication_email text,
  residential_address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.student_health_records (
  student_id uuid primary key references public.students(id) on delete cascade,
  school_id uuid not null references public.schools(id) on delete cascade,
  height_cm numeric(6,2),
  weight_kg numeric(6,2),
  bmi numeric(5,2),
  medical_notes text,
  allergies text,
  emergency_contact_name text,
  emergency_contact_phone text,
  visible_to_parents boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  class_id uuid not null references public.classes(id),
  section_id uuid not null references public.sections(id),
  subject_id uuid references public.subjects(id),
  marked_by uuid references public.teachers(id),
  attendance_date date not null,
  status public.attendance_status not null,
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists attendance_daily_unique
  on public.attendance (student_id, attendance_date) where subject_id is null;
create unique index if not exists attendance_subject_unique
  on public.attendance (student_id, attendance_date, subject_id) where subject_id is not null;

create table if not exists public.homework (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid not null references public.classes(id),
  section_id uuid references public.sections(id),
  subject_id uuid not null references public.subjects(id),
  teacher_id uuid references public.teachers(id),
  title text not null,
  description text,
  due_on date not null,
  attachment_paths text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.homework_submissions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  homework_id uuid not null references public.homework(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status public.homework_status default 'assigned',
  completed boolean default false,
  submission_note text,
  attachment_paths text[] default '{}',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (homework_id, student_id)
);

create table if not exists public.grading_systems (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  bands jsonb not null default '[]',
  show_rank boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id),
  name text not null,
  exam_type text,
  starts_on date,
  ends_on date,
  published boolean default false,
  grading_system_id uuid references public.grading_systems(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.exam_subjects (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete cascade,
  subject_id uuid not null references public.subjects(id),
  class_id uuid references public.classes(id),
  max_marks numeric(6,2) default 100,
  scheduled_on date,
  start_time time
);

create table if not exists public.marks (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  exam_subject_id uuid not null references public.exam_subjects(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  marks_obtained numeric(6,2),
  grade text,
  remarks text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (exam_subject_id, student_id)
);

create table if not exists public.fee_structures (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  academic_year_id uuid not null references public.academic_years(id),
  class_id uuid references public.classes(id),
  name text not null,
  category public.fee_category not null,
  schedule public.fee_schedule not null default 'term_1',
  amount numeric(12,2) not null,
  due_on date,
  is_optional boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.student_fees (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  fee_structure_id uuid not null references public.fee_structures(id),
  amount numeric(12,2) not null,
  concession numeric(12,2) default 0,
  due_on date,
  created_at timestamptz default now(),
  unique (student_id, fee_structure_id)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  student_id uuid not null references public.students(id),
  initiated_by uuid references public.profiles(id),
  amount numeric(12,2) not null,
  currency text default 'INR',
  method public.payment_method,
  status public.payment_status not null default 'initiated',
  gateway text,
  gateway_order_id text,
  gateway_payment_id text,
  gateway_signature text,
  failure_reason text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  verified_at timestamptz
);

create table if not exists public.payment_allocations (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  payment_id uuid not null references public.payments(id) on delete cascade,
  student_fee_id uuid not null references public.student_fees(id),
  amount numeric(12,2) not null
);

create table if not exists public.payment_receipts (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  payment_id uuid not null unique references public.payments(id) on delete cascade,
  receipt_no text not null,
  file_path text,
  issued_at timestamptz default now()
);

create or replace function public.mark_payment_success(
  p_payment_id uuid,
  p_gateway_payment_id text,
  p_signature text
) returns public.payments
language plpgsql security definer set search_path = public as $$
declare rec public.payments;
begin
  if not public.is_super_admin() and not exists (
    select 1 from public.payments pay
    where pay.id = p_payment_id and pay.school_id in (select public.user_school_ids())
  ) then raise exception 'not authorized'; end if;

  update public.payments
     set status = 'success',
         gateway_payment_id = p_gateway_payment_id,
         gateway_signature = p_signature,
         verified_at = now()
   where id = p_payment_id and status in ('initiated','pending','processing')
  returning * into rec;
  if rec.id is null then raise exception 'payment cannot be marked success'; end if;

  insert into public.payment_receipts (school_id, payment_id, receipt_no)
  values (rec.school_id, rec.id, 'RCT-' || to_char(now(), 'YYYYMMDD') || '-' || substr(rec.id::text,1,8))
  on conflict (payment_id) do nothing;
  return rec;
end $$;

create table if not exists public.circulars (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  body text,
  audience text default 'parents',
  class_id uuid references public.classes(id),
  published_at timestamptz default now(),
  attachment_paths text[] default '{}',
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  title text not null,
  body text,
  cover_path text,
  published_at timestamptz default now(),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  channel public.message_channel default 'direct',
  sender_id uuid not null references public.profiles(id),
  subject text,
  body text not null,
  attachment_paths text[] default '{}',
  created_at timestamptz default now()
);

create table if not exists public.message_recipients (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id),
  read_at timestamptz,
  unique (message_id, recipient_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.students(id),
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.notification_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  homework boolean default true,
  attendance boolean default true,
  circulars boolean default true,
  messages boolean default true,
  fees boolean default true,
  exams boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.circular_reads (
  circular_id uuid references public.circulars(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  read_at timestamptz default now(),
  primary key (circular_id, profile_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete set null,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id uuid,
  meta jsonb default '{}',
  created_at timestamptz default now()
);

create index if not exists idx_students_school on public.students (school_id);
create index if not exists idx_students_class_section on public.students (school_id, class_id, section_id);
create index if not exists idx_students_year on public.students (academic_year_id);
create index if not exists idx_attendance_school_date on public.attendance (school_id, attendance_date);
create index if not exists idx_attendance_student_date on public.attendance (student_id, attendance_date);
create index if not exists idx_homework_class on public.homework (school_id, class_id, due_on);
create index if not exists idx_marks_student on public.marks (student_id);
create index if not exists idx_student_fees_student on public.student_fees (student_id);
create index if not exists idx_payments_student on public.payments (student_id, status);
create index if not exists idx_messages_school on public.messages (school_id, created_at desc);
create index if not exists idx_notifications_profile on public.notifications (profile_id, created_at desc);
create index if not exists idx_user_roles_profile on public.user_roles (profile_id);
create index if not exists idx_user_roles_school on public.user_roles (school_id, role);
create index if not exists idx_parents_profile on public.parents (profile_id);
