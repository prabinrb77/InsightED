-- Multi-school operations, private media, and mandatory AAL2 access.
alter table students add column if not exists archived_at timestamptz;
alter table students drop constraint if exists students_student_code_key;
create unique index if not exists students_school_code_unique
  on students (school_id, student_code) where archived_at is null;

create table if not exists schedule_events (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  created_by uuid not null references profiles on delete cascade,
  student_id uuid references students on delete set null,
  title text not null,
  category text not null check (category in ('Class','Support','Meeting','Personal')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table if not exists planned_activities (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references schools on delete cascade,
  created_by uuid not null references profiles on delete cascade,
  student_id uuid references students on delete set null,
  title text not null,
  activity_date date not null default current_date,
  period text not null default 'Any time',
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table messages add column if not exists attachment_name text;
alter table messages add column if not exists attachment_mime text;
alter table messages add column if not exists attachment_size bigint;
alter table messages alter column body drop not null;

create or replace function session_is_aal2()
returns boolean language sql stable as $$
  select coalesce(auth.jwt()->>'aal', 'aal1') = 'aal2';
$$;

create or replace function can_access_conversation(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select session_is_aal2() and exists (
    select 1 from conversation_participants
    where conversation_id = target and profile_id = auth.uid()
  );
$$;

alter table schedule_events enable row level security;
alter table planned_activities enable row level security;

create policy schedule_school_aal2_select on schedule_events for select to authenticated
  using (session_is_aal2() and is_member_of_school(school_id));
create policy schedule_school_aal2_insert on schedule_events for insert to authenticated
  with check (session_is_aal2() and created_by = auth.uid() and is_member_of_school(school_id));
create policy schedule_school_aal2_update on schedule_events for update to authenticated
  using (session_is_aal2() and is_member_of_school(school_id))
  with check (session_is_aal2() and is_member_of_school(school_id));
create policy schedule_school_aal2_delete on schedule_events for delete to authenticated
  using (session_is_aal2() and created_by = auth.uid() and is_member_of_school(school_id));

create policy activities_school_aal2_select on planned_activities for select to authenticated
  using (session_is_aal2() and is_member_of_school(school_id));
create policy activities_school_aal2_insert on planned_activities for insert to authenticated
  with check (session_is_aal2() and created_by = auth.uid() and is_member_of_school(school_id));
create policy activities_school_aal2_update on planned_activities for update to authenticated
  using (session_is_aal2() and is_member_of_school(school_id))
  with check (session_is_aal2() and is_member_of_school(school_id));
create policy activities_school_aal2_delete on planned_activities for delete to authenticated
  using (session_is_aal2() and created_by = auth.uid() and is_member_of_school(school_id));

-- Make student writes school-scoped, soft-delete only, and MFA protected.
drop policy if exists students_insert on students;
drop policy if exists students_update on students;
create policy students_insert_school_aal2 on students for insert to authenticated
  with check (session_is_aal2() and school_id is not null and is_member_of_school(school_id)
    and current_role_is(array['teacher','school_admin']::user_role[]));
create policy students_update_school_aal2 on students for update to authenticated
  using (session_is_aal2() and school_id is not null and is_member_of_school(school_id))
  with check (session_is_aal2() and school_id is not null and is_member_of_school(school_id));

-- Replace permissive attachment policies. Object names must begin with the
-- conversation UUID, which is checked against participant membership.
drop policy if exists "Authenticated users can upload message attachments" on storage.objects;
drop policy if exists "Message attachments are readable" on storage.objects;
create policy message_media_participant_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'message-attachments' and can_access_conversation(((storage.foldername(name))[1])::uuid));
create policy message_media_participant_select on storage.objects for select to authenticated
  using (bucket_id = 'message-attachments' and can_access_conversation(((storage.foldername(name))[1])::uuid));
create policy message_media_owner_delete on storage.objects for delete to authenticated
  using (bucket_id = 'message-attachments' and owner_id = auth.uid()::text
    and can_access_conversation(((storage.foldername(name))[1])::uuid));

update storage.buckets set public = false, file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif','audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav']
where id = 'message-attachments';

-- Messaging is sensitive: these restrictive policies are ANDed with existing
-- participant policies and cannot accidentally broaden access.
create policy conversations_require_aal2 on conversations as restrictive for all to authenticated
  using (session_is_aal2()) with check (session_is_aal2());
create policy participants_require_aal2 on conversation_participants as restrictive for all to authenticated
  using (session_is_aal2()) with check (session_is_aal2());
create policy messages_require_aal2 on messages as restrictive for all to authenticated
  using (session_is_aal2()) with check (session_is_aal2());

create index if not exists schedule_events_school_start on schedule_events(school_id, starts_at);
create index if not exists planned_activities_school_date on planned_activities(school_id, activity_date);
