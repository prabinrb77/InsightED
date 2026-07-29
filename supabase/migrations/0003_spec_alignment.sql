-- ============================================================================
-- MiZanova — data model alignment with the Lovable master build script
--
-- Covers the parts of the spec that CONFLICT with 0001/0002 or that have no
-- table at all. UI for these lands separately; this is the foundation so later
-- screens aren't built against a shape that has to change underneath them.
--
--   Prompt 6  three-tier admin — adds platform_admin
--   Prompt 7  student governance — consent, archive, correction, version history
--   Prompt 8  behaviour logging — type/trigger/location, sync state, escalation
--   Prompt 9  pattern detection — the patterns table
--   Prompt 10 strategy governance — confidence, versioning, judge result, feedback
--   Prompt 18 RBAC — roles as an array, active role per session
--   Prompt 19 B2C — ownership_type on every child record
--   Prompt 20 invitations — parent/teacher linking with tracked status
--   Prompt 23 paid collaboration seats — child_collaborators
--
-- NOT covered here (needs product decisions or external services): Stripe,
-- WhatsApp, evidence database, Judge-LLM, WWCC document storage, legal
-- document versioning, regional pricing.
-- ============================================================================

-- ── Prompt 6 · platform_admin ────────────────────────────────────────────────
-- Business operations for the Special Miles team: user and school management,
-- compliance and financial read-only. Distinct from super_admin, which is
-- technical root and stays internal.

-- ⚠️  Postgres will not let a newly added enum value be *used* in the same
--     transaction that adds it. The `commit` below ends the implicit
--     transaction so the policies further down can reference 'platform_admin'.
--     If your client wraps the whole file in one transaction and this errors
--     with "unsafe use of new value", run these two lines on their own first,
--     then run the rest of the file.

alter type user_role add value if not exists 'platform_admin' after 'school_admin';
alter type user_role add value if not exists 'external_teacher' after 'teacher';

commit;

-- ── Prompt 18 · roles as an array, with an active role ───────────────────────
-- The spec requires multiple roles per user with exactly one governing the
-- session. `role` is kept as the primary/default role so every policy written
-- in 0001 keeps working; `roles` is the authoritative set.

alter table profiles
  add column if not exists roles user_role[] not null default '{}',
  add column if not exists active_role user_role;

update profiles set roles = array[role] where roles = '{}';

-- Keep the array in sync when the single column is written by older code paths.
create or replace function sync_primary_role()
returns trigger language plpgsql as $$
begin
  if new.roles is null or new.roles = '{}' then
    new.roles := array[new.role];
  elsif not (new.role = any (new.roles)) then
    new.roles := array_append(new.roles, new.role);
  end if;
  return new;
end; $$;

drop trigger if exists profiles_sync_roles on profiles;
create trigger profiles_sync_roles
  before insert or update on profiles
  for each row execute function sync_primary_role();

-- current_role_is() now answers for any held role, not just the primary one,
-- so a teacher-who-is-also-a-parent stops being locked out of parent data.
create or replace function current_role_is(roles user_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from profiles p
    where p.id = auth.uid()
      and (p.role = any(roles) or p.roles && roles)
  );
$$;

-- ── Prompt 19 · ownership model ──────────────────────────────────────────────
-- Every child record is either school-owned (B2B) or parent-owned (B2C).
-- Linking grants access; it never transfers ownership.

do $$ begin
  create type ownership_type as enum ('school_owned', 'parent_owned');
exception when duplicate_object then null; end $$;

alter table students
  add column if not exists ownership ownership_type not null default 'school_owned',
  add column if not exists owner_profile_id uuid references profiles on delete set null;

-- A school-owned student needs a school; a parent-owned one needs an owner.
alter table students drop constraint if exists students_ownership_valid;
alter table students add constraint students_ownership_valid check (
  (ownership = 'school_owned' and school_id is not null)
  or (ownership = 'parent_owned' and owner_profile_id is not null)
);

-- ── Prompt 7 · student profile & governance ──────────────────────────────────

alter table students
  add column if not exists emergency_contact_name  text,
  add column if not exists emergency_contact_phone text,
  -- Contextual only. The spec is explicit that this must never drive strategy
  -- generation, must be encrypted at rest, and must not appear in any
  -- SMS/WhatsApp preview.
  add column if not exists diagnosis text,
  add column if not exists photo_path text,
  add column if not exists additional_notes text,
  add column if not exists research_opt_in boolean not null default false,
  add column if not exists parent_consent_status link_status not null default 'pending',
  add column if not exists parent_consent_at timestamptz,
  -- Soft delete only — archive, never hard-delete.
  add column if not exists archived_at timestamptz,
  add column if not exists entered_in_error boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

-- Identity enforcement (Prompt 7): names are separate, non-null and non-blank
-- at the database level, not just in the form.
alter table students drop constraint if exists students_names_present;
alter table students add constraint students_names_present check (
  length(trim(first_name)) > 0 and length(trim(last_name)) > 0
);

create index if not exists students_active_idx
  on students (school_id) where archived_at is null;

-- Version history for profile edits.
create table if not exists student_versions (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references students on delete cascade,
  edited_by  uuid references profiles on delete set null,
  snapshot   jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists student_versions_idx
  on student_versions (student_id, created_at desc);

create or replace function record_student_version()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into student_versions (student_id, edited_by, snapshot)
  values (old.id, auth.uid(), to_jsonb(old));
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists students_version on students;
create trigger students_version
  before update on students
  for each row execute function record_student_version();

-- ── Prompt 8 · behaviour logging engine ──────────────────────────────────────

do $$ begin
  create type sync_state as enum ('pending', 'synced', 'conflict');
exception when duplicate_object then null; end $$;

alter table behaviour_logs
  add column if not exists behaviour_type text,
  add column if not exists trigger_note   text,
  add column if not exists location       text,
  add column if not exists private_note   text,
  add column if not exists attachment_path text,
  -- Offline-first: the client mints the id and the row syncs later. `version`
  -- supports last-edit-wins while retaining history.
  add column if not exists sync_status sync_state not null default 'synced',
  add column if not exists version integer not null default 1,
  add column if not exists escalated boolean not null default false,
  add column if not exists escalated_at timestamptz,
  -- Set by risk keyword screening. While true, strategy generation must not
  -- run — safety gating comes before AI.
  add column if not exists risk_flagged boolean not null default false,
  add column if not exists risk_reason text;

create index if not exists behaviour_logs_escalated_idx
  on behaviour_logs (occurred_at desc) where escalated;

-- ── Prompt 9 · pattern detection ─────────────────────────────────────────────

do $$ begin
  create type trend_direction as enum ('improving', 'steady', 'worsening');
exception when duplicate_object then null; end $$;

create table if not exists behaviour_patterns (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references students on delete cascade,
  tag          text not null,
  frequency    integer not null default 0,
  window_start timestamptz not null,
  window_end   timestamptz not null,
  trend        trend_direction not null default 'steady',
  created_at   timestamptz not null default now()
);
create index if not exists behaviour_patterns_idx
  on behaviour_patterns (student_id, window_end desc);

-- ── Prompt 10 · strategy governance ──────────────────────────────────────────

do $$ begin
  create type judge_result as enum ('approved', 'under_review', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type delivery_scope as enum ('teacher_only', 'shared_with_parent');
exception when duplicate_object then null; end $$;

alter table strategies
  add column if not exists audience text not null default 'teacher',
  add column if not exists confidence numeric(4,3),
  add column if not exists version_id integer not null default 1,
  add column if not exists pattern_id uuid references behaviour_patterns on delete set null,
  add column if not exists judge_decision judge_result,
  add column if not exists scope delivery_scope not null default 'teacher_only',
  add column if not exists context_tag text,
  add column if not exists skill_domain text,
  add column if not exists age_suitability text,
  add column if not exists evidence_ref text;

alter table strategies drop constraint if exists strategies_audience_valid;
alter table strategies add constraint strategies_audience_valid
  check (audience in ('teacher', 'parent'));

alter table strategies drop constraint if exists strategies_confidence_range;
alter table strategies add constraint strategies_confidence_range
  check (confidence is null or (confidence >= 0 and confidence <= 1));

-- Parent effectiveness feedback. Deliberately never feeds retraining directly —
-- the spec requires super admin approval for that.
create table if not exists strategy_feedback (
  id          uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references strategies on delete cascade,
  version_id  integer not null,
  pattern_id  uuid references behaviour_patterns on delete set null,
  author_id   uuid references profiles on delete set null,
  rating      text not null check (rating in ('effective', 'partial', 'not_effective')),
  comment     text,
  created_at  timestamptz not null default now(),
  unique (strategy_id, author_id, version_id)
);

-- ── Prompt 20 · invitations ──────────────────────────────────────────────────

do $$ begin
  create type invite_status as enum ('pending', 'accepted', 'declined', 'expired', 'revoked');
exception when duplicate_object then null; end $$;

create table if not exists invitations (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  role        user_role not null,
  student_id  uuid references students on delete cascade,
  school_id   uuid references schools on delete cascade,
  invited_by  uuid references profiles on delete set null,
  status      invite_status not null default 'pending',
  expires_at  timestamptz not null default now() + interval '14 days',
  accepted_at timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists invitations_email_idx on invitations (lower(email), status);
create index if not exists invitations_student_idx on invitations (student_id);

-- ── Prompt 23 · paid collaboration seats ─────────────────────────────────────
-- Parent-owned profiles only. A seat counts only once the invitation is
-- accepted, the account exists and the link is live — pending never bills.

do $$ begin
  create type collaborator_role as enum ('external_teacher', 'specialist');
exception when duplicate_object then null; end $$;

do $$ begin
  create type collaborator_status as enum ('pending', 'active', 'revoked');
exception when duplicate_object then null; end $$;

create table if not exists child_collaborators (
  id         uuid primary key default gen_random_uuid(),
  child_id   uuid not null references students on delete cascade,
  user_id    uuid references profiles on delete cascade,
  role       collaborator_role not null,
  invited_by uuid references profiles on delete set null,
  status     collaborator_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (child_id, user_id, role)
);
create index if not exists child_collaborators_active_idx
  on child_collaborators (child_id) where status = 'active';

-- ── Prompt 2 · country inheritance ───────────────────────────────────────────
-- Country comes from the school and is never chosen by an individual user.
-- State/Region is the one field the spec explicitly recommends, so it's here.

alter table schools
  add column if not exists region text,
  add column if not exists tax_structure text not null default 'GST',
  add column if not exists legal_doc_version text not null default 'AU-v1';

-- ── RLS for the new tables ───────────────────────────────────────────────────
-- Default-deny: enabling RLS without a policy blocks everything, which is the
-- safe state until each feature's access rules are written alongside its UI.

alter table student_versions    enable row level security;
alter table behaviour_patterns  enable row level security;
alter table strategy_feedback   enable row level security;
alter table invitations         enable row level security;
alter table child_collaborators enable row level security;

create policy student_versions_read on student_versions for select
  using (is_linked_to_student(student_id) or shares_school_with_student(student_id));

create policy behaviour_patterns_read on behaviour_patterns for select
  using (is_linked_to_student(student_id) or shares_school_with_student(student_id));

create policy strategy_feedback_read on strategy_feedback for select
  using (
    author_id = auth.uid()
    or exists (
      select 1 from strategies s
      where s.id = strategy_feedback.strategy_id
        and (is_linked_to_student(s.student_id) or shares_school_with_student(s.student_id))
    )
  );

create policy strategy_feedback_insert on strategy_feedback for insert
  with check (author_id = auth.uid());

-- You can see invitations you sent, or ones addressed to your own address.
create policy invitations_read on invitations for select
  using (
    invited_by = auth.uid()
    or lower(email) = lower(coalesce((select p.email from profiles p where p.id = auth.uid()), ''))
    or current_role_is(array['school_admin','platform_admin','super_admin']::user_role[])
  );

create policy invitations_insert on invitations for insert
  with check (
    invited_by = auth.uid()
    and current_role_is(
      array['teacher','parent','school_admin','platform_admin','super_admin']::user_role[]
    )
  );

create policy child_collaborators_read on child_collaborators for select
  using (user_id = auth.uid() or is_linked_to_student(child_id));

-- ── console read access for the new tables ───────────────────────────────────

create policy invitations_admin_read on invitations for select
  using (current_role_is(array['platform_admin','super_admin']::user_role[]));

create policy profiles_platform_read on profiles for select
  using (current_role_is(array['platform_admin']::user_role[]));

create policy schools_platform_all on schools for all
  using (current_role_is(array['platform_admin']::user_role[]))
  with check (current_role_is(array['platform_admin']::user_role[]));
