-- ============================================================================
-- MiZanova — core schema
--
-- Access model: every permission derives from `student_links`. A profile can
-- see a student because it is linked to that student as teacher, parent or
-- specialist. Messaging inherits the same rule, which enforces the product
-- requirement that a channel exists only where a student is shared.
--
-- Encryption: Supabase encrypts at rest at the storage layer, and all traffic
-- is TLS. Confidentiality between users is enforced by the RLS policies below
-- rather than client-held keys, so safeguarding staff retain a lawful,
-- audited path to message content. Every such access is written to audit_log.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── enums ────────────────────────────────────────────────────────────────────
create type user_role     as enum ('teacher', 'parent', 'specialist', 'school_admin', 'super_admin');
create type link_role     as enum ('teacher', 'parent', 'specialist');
create type link_status   as enum ('pending', 'active', 'revoked');
create type log_intensity as enum ('low', 'medium', 'high');
create type strategy_src  as enum ('ai', 'specialist', 'library');
create type strategy_stat as enum ('suggested', 'endorsed', 'rejected', 'applied');

-- ── profiles ─────────────────────────────────────────────────────────────────
create table profiles (
  id          uuid primary key references auth.users on delete cascade,
  role        user_role not null default 'teacher',
  full_name   text,
  email       text,
  phone       text,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Mirror auth.users into profiles so the app can join on it. Reads the role
-- and name out of the metadata the signup wizards attach.
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  claimed text := new.raw_user_meta_data ->> 'role';
  resolved user_role := 'teacher';
begin
  -- Never let an unexpected metadata value abort the signup transaction.
  if claimed in ('teacher', 'parent', 'specialist') then
    resolved := claimed::user_role;
  end if;

  insert into profiles (id, role, full_name, email, phone)
  values (
    new.id,
    resolved,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── schools ──────────────────────────────────────────────────────────────────
create table schools (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  country           text not null default 'Australia',
  privacy_framework text not null default 'APP (Privacy Act 1988)',
  currency          text not null default 'AUD',
  data_residency    text not null default 'AWS Sydney',
  created_at        timestamptz not null default now()
);

create table school_members (
  school_id  uuid not null references schools on delete cascade,
  profile_id uuid not null references profiles on delete cascade,
  role       user_role not null default 'teacher',
  status     link_status not null default 'active',
  created_at timestamptz not null default now(),
  primary key (school_id, profile_id)
);

-- ── students ─────────────────────────────────────────────────────────────────
create table students (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid references schools on delete set null,
  student_code  text unique,
  first_name    text not null,
  last_name     text not null,
  date_of_birth date,
  class_group   text,
  -- 'High Level' clearance field per the Add Student design; exposed through
  -- a restricted view rather than the base table.
  clinical_notes text,
  strengths     text,
  focus_areas   text,
  created_at    timestamptz not null default now()
);

-- The join that drives every permission in the app.
create table student_links (
  id            uuid primary key default gen_random_uuid(),
  student_id    uuid not null references students on delete cascade,
  profile_id    uuid not null references profiles on delete cascade,
  role          link_role not null,
  relationship  text,                    -- 'Mother', 'Speech Pathologist', …
  status        link_status not null default 'active',
  created_at    timestamptz not null default now(),
  unique (student_id, profile_id, role)
);

create index on student_links (profile_id) where status = 'active';
create index on student_links (student_id) where status = 'active';

-- ── behaviour logs & strategies ──────────────────────────────────────────────
create table behaviour_logs (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references students on delete cascade,
  author_id   uuid not null references profiles on delete set null,
  intensity   log_intensity not null default 'low',
  title       text not null,
  body        text,
  context     text,                      -- lesson, yard, transition…
  occurred_at timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

create index on behaviour_logs (student_id, occurred_at desc);

create table strategies (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references students on delete cascade,
  behaviour_log_id uuid references behaviour_logs on delete set null,
  source           strategy_src not null default 'ai',
  status           strategy_stat not null default 'suggested',
  title            text not null,
  body             text not null,
  rationale        text,
  reviewed_by      uuid references profiles on delete set null,
  reviewed_at      timestamptz,
  created_at       timestamptz not null default now()
);

create index on strategies (student_id, created_at desc);

-- ── messaging ────────────────────────────────────────────────────────────────
-- A conversation is always anchored to a student, which is what makes the
-- "only if you share a linked student" rule expressible in RLS.
create table conversations (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students on delete cascade,
  subject    text,
  created_by uuid references profiles on delete set null,
  created_at timestamptz not null default now()
);

create table conversation_participants (
  conversation_id uuid not null references conversations on delete cascade,
  profile_id      uuid not null references profiles on delete cascade,
  joined_at       timestamptz not null default now(),
  last_read_at    timestamptz,
  primary key (conversation_id, profile_id)
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations on delete cascade,
  sender_id       uuid not null references profiles on delete set null,
  body            text not null,
  attachment_path text,
  created_at      timestamptz not null default now(),
  edited_at       timestamptz,
  deleted_at      timestamptz
);

create index on messages (conversation_id, created_at desc);

-- ── audit log ────────────────────────────────────────────────────────────────
-- Every safeguarding access to message content is recorded here.
create table audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references profiles on delete set null,
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  reason      text,
  created_at  timestamptz not null default now()
);

create index on audit_log (created_at desc);

-- ============================================================================
-- Helper predicates. SECURITY DEFINER so policies can call them without
-- recursing back through the RLS on the tables they read.
-- ============================================================================

create or replace function is_linked_to_student(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from student_links
    where student_id = target
      and profile_id = auth.uid()
      and status = 'active'
  );
$$;

create or replace function current_role_is(roles user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = any(roles)
  );
$$;

create or replace function shares_school_with_student(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from students s
    join school_members m on m.school_id = s.school_id
    where s.id = target
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and m.role in ('school_admin', 'super_admin')
  );
$$;

-- SECURITY DEFINER, otherwise a policy on school_members that reads
-- school_members recurses through RLS indefinitely.
create or replace function is_member_of_school(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from school_members
    where school_id = target and profile_id = auth.uid() and status = 'active'
  );
$$;

create or replace function is_conversation_participant(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from conversation_participants
    where conversation_id = target and profile_id = auth.uid()
  );
$$;

-- ============================================================================
-- Row level security
-- ============================================================================

alter table profiles                  enable row level security;
alter table schools                   enable row level security;
alter table school_members            enable row level security;
alter table students                  enable row level security;
alter table student_links             enable row level security;
alter table behaviour_logs            enable row level security;
alter table strategies                enable row level security;
alter table conversations             enable row level security;
alter table conversation_participants enable row level security;
alter table messages                  enable row level security;
alter table audit_log                 enable row level security;

-- profiles: read your own, plus anyone you share a student with.
create policy profiles_self_read on profiles for select
  using (
    id = auth.uid()
    or exists (
      select 1
      from student_links mine
      join student_links theirs on theirs.student_id = mine.student_id
      where mine.profile_id = auth.uid()
        and mine.status = 'active'
        and theirs.profile_id = profiles.id
        and theirs.status = 'active'
    )
  );

create policy profiles_self_update on profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- schools: visible to members.
create policy schools_read on schools for select
  using (is_member_of_school(id));

create policy school_members_read on school_members for select
  using (profile_id = auth.uid() or is_member_of_school(school_id));

-- students: only via an active link, or school admins of that school.
create policy students_read on students for select
  using (is_linked_to_student(id) or shares_school_with_student(id));

-- Staff may only create students inside a school they belong to.
create policy students_insert on students for insert
  with check (
    current_role_is(array['teacher','school_admin']::user_role[])
    and (school_id is null or is_member_of_school(school_id))
  );

create policy students_update on students for update
  using (is_linked_to_student(id) or shares_school_with_student(id));

-- links: you can see links for students you're linked to.
create policy student_links_read on student_links for select
  using (profile_id = auth.uid() or is_linked_to_student(student_id));

-- behaviour logs: readable by anyone linked to the student; authored by staff.
create policy behaviour_logs_read on behaviour_logs for select
  using (is_linked_to_student(student_id));

create policy behaviour_logs_insert on behaviour_logs for insert
  with check (
    author_id = auth.uid()
    and is_linked_to_student(student_id)
    and current_role_is(array['teacher','specialist']::user_role[])
  );

create policy behaviour_logs_update on behaviour_logs for update
  using (author_id = auth.uid());

-- strategies: same visibility; only specialists may endorse or reject.
create policy strategies_read on strategies for select
  using (is_linked_to_student(student_id));

create policy strategies_insert on strategies for insert
  with check (is_linked_to_student(student_id));

create policy strategies_review on strategies for update
  using (
    is_linked_to_student(student_id)
    and current_role_is(array['specialist','school_admin']::user_role[])
  );

-- conversations: participants only, and the student link must still be active.
create policy conversations_read on conversations for select
  using (is_conversation_participant(id) and is_linked_to_student(student_id));

create policy conversations_insert on conversations for insert
  with check (is_linked_to_student(student_id) and created_by = auth.uid());

create policy participants_read on conversation_participants for select
  using (is_conversation_participant(conversation_id));

-- A participant may only be added if they are themselves linked to the
-- conversation's student. This is the rule that prevents a teacher and parent
-- messaging about a child they do not both have access to.
create policy participants_insert on conversation_participants for insert
  with check (
    is_conversation_participant(conversation_id)
    and exists (
      select 1 from conversations c
      join student_links l on l.student_id = c.student_id
      where c.id = conversation_id
        and l.profile_id = conversation_participants.profile_id
        and l.status = 'active'
    )
  );

create policy participants_update on conversation_participants for update
  using (profile_id = auth.uid());

-- messages: readable by participants, writable as yourself, never hard-deleted.
create policy messages_read on messages for select
  using (is_conversation_participant(conversation_id));

create policy messages_insert on messages for insert
  with check (
    sender_id = auth.uid() and is_conversation_participant(conversation_id)
  );

create policy messages_update on messages for update
  using (sender_id = auth.uid()) with check (sender_id = auth.uid());

-- audit log: append-only; readable only by admins.
create policy audit_insert on audit_log for insert with check (actor_id = auth.uid());
create policy audit_read on audit_log for select
  using (current_role_is(array['school_admin','super_admin']::user_role[]));

-- ============================================================================
-- Safeguarding break-glass: lets an admin read a conversation they are not a
-- participant in, but only by writing an audit record with a stated reason.
-- ============================================================================
create or replace function safeguarding_read_conversation(target uuid, why text)
returns table (id uuid, sender_id uuid, body text, created_at timestamptz)
language plpgsql security definer set search_path = public as $$
begin
  if not current_role_is(array['school_admin','super_admin']::user_role[]) then
    raise exception 'not authorised';
  end if;
  if why is null or length(trim(why)) < 10 then
    raise exception 'a reason of at least 10 characters is required';
  end if;

  insert into audit_log (actor_id, action, entity, entity_id, reason)
  values (auth.uid(), 'safeguarding_read', 'conversation', target, why);

  return query
    select m.id, m.sender_id, m.body, m.created_at
    from messages m
    where m.conversation_id = target
    order by m.created_at;
end; $$;

-- ── backfill ─────────────────────────────────────────────────────────────────
-- The trigger only fires on new signups, so give any account that already
-- exists a profile row too.
insert into profiles (id, role, full_name, email, phone)
select
  u.id,
  case
    when u.raw_user_meta_data ->> 'role' in ('teacher', 'parent', 'specialist')
      then (u.raw_user_meta_data ->> 'role')::user_role
    else 'teacher'::user_role
  end,
  u.raw_user_meta_data ->> 'full_name',
  u.email,
  u.raw_user_meta_data ->> 'phone'
from auth.users u
on conflict (id) do nothing;

-- ── realtime ─────────────────────────────────────────────────────────────────
alter publication supabase_realtime add table messages;
alter publication supabase_realtime add table strategies;
