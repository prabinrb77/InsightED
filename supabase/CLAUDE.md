# Backend guide (`supabase/`, `scripts/`)

Postgres on Supabase: schema, RLS policies, security-definer functions, storage
buckets, plus the Node scripts that do the things a browser must never do.
Read [the repo guide](../CLAUDE.md) first — its working rules apply here.

There is no Supabase CLI project in this repo (no `config.toml`, no local stack).
Migrations are applied by hand in the SQL editor, in filename order.

## The access model

**Every permission derives from `student_links`.** A profile can see a student
because a row links it to that student as teacher, parent or specialist.
Messaging inherits the same rule: a conversation exists only where a student is
shared. School-wide visibility comes from `school_members`. Nothing else grants
access.

Confidentiality between users is enforced in Postgres, not by client-held keys,
so safeguarding staff keep a lawful, audited path to content —
`safeguarding_read_conversation(target, why)` exists for exactly that and writes
to `audit_log`. Preserve that property: a design that makes content unreadable to
the platform is not a drop-in change here.

**RLS is the security boundary.** The frontend's `RequireRole` guard is a
usability gate that keeps honest users off screens that would show them empty
tables. Assume any authenticated user can call any query with any arguments, and
write the policy so the answer is still correct.

## Tables

`0001_core_schema.sql` — `profiles`, `schools`, `school_members`, `students`,
`student_links`, `behaviour_logs`, `strategies`, `conversations`,
`conversation_participants`, `messages`, `audit_log`.
`0003_spec_alignment.sql` — `student_versions`, `behaviour_patterns`,
`strategy_feedback`, `invitations`, `child_collaborators`, plus `profiles.roles[]`
/ `active_role` and the student consent, ownership and soft-delete columns.

`profiles` mirrors `auth.users` via the `handle_new_user()` trigger, which reads
role and name out of the signup metadata. `profiles.role` is the single primary
role the RLS policies are written against; `profiles.roles[]` is every role held,
kept consistent by `sync_primary_role()`.

## Migrations

- **Never edit a migration that has been applied.** Add the next numbered file.
  The applied set is whatever is live in the Supabase project — assume all four
  are applied unless told otherwise.
- **Number sequentially, four digits, snake_case description:**
  `0004_short_description.sql`. Filename order is apply order.
  ⚠️ `0002_message_attachments.sql` and `0002_super_admin.sql` share a prefix, so
  their relative order is whatever a directory sort decides. Do not add a third
  `0002`; the pair should be renumbered when someone can confirm what has already
  run where.
- **Make every migration re-runnable.** `create table if not exists`,
  `add column if not exists`, `alter type … add value if not exists`,
  `create or replace function`, `insert … on conflict do update`, and
  `drop policy if exists` before `create policy`. `create policy` has no
  `if not exists` form — the storage policies in `0002_message_attachments.sql`
  omit the drop and will fail on a second run; don't copy that.
- **Header comment on each file** stating what it does and any non-obvious
  access consequence, in the style of `0001`. This is the one place a long
  comment is expected — the schema's *why* has nowhere else to live.
- **Every new table gets `enable row level security` plus explicit policies in
  the same migration.** A table with RLS on and no policy is invisible; a table
  with RLS off is world-readable through the anon key. Neither is acceptable to
  leave for later.
- Reflect the change in `src/` types when the frontend reads it — the schema is
  not self-describing to TypeScript, and there is no generated types file.

## SQL style

Match `0001_core_schema.sql`:

- lowercase keywords; `-- ── section ─────` rules between sections
- enums declared up front; column definitions aligned in a block
- policy names `<table>_<scope>_<verb>`: `profiles_self_read`,
  `students_insert`, `schools_admin_insert`, `invitations_admin_read`,
  `schools_platform_all`. The two quoted sentence-case storage policies are the
  odd ones out; new policies use snake_case.
- predicates that appear in more than one policy become a helper function —
  `is_linked_to_student`, `shares_school_with_student`, `is_member_of_school`,
  `is_conversation_participant`, `current_role_is` — rather than being repeated
  inline. This is the modularity rule applied to SQL.

## Functions

- Anything that reads privileged rows or crosses a policy is
  `language plpgsql security definer set search_path = public`. The
  `search_path` pin is not optional — without it a definer function is a
  privilege-escalation path.
- Read-only predicates used by policies are `stable`.
- **A privileged RPC checks the caller first and raises on failure:**
  `if not current_role_is(array['super_admin']::user_role[]) then raise
  exception 'not authorised'; end if;` — see `grant_school_admin`. The check
  lives in the function, never in the caller.
- Raise messages that reach the UI are written for the person reading them
  ("No MiZanova account exists for %. Ask them to sign up first…").
- **Any role change or privileged read writes an `audit_log` row** in the same
  transaction: actor, action, entity, entity_id, reason.
- A trigger must never abort a signup: `handle_new_user()` swallows an
  unexpected metadata value rather than failing the transaction.

## Roles are never self-assigned

`handle_new_user()` refuses `school_admin`, `platform_admin` and `super_admin`
claimed in signup metadata — a user who edits their own signup payload still
lands as a teacher. Elevation happens only through:

- `grant_school_admin(target_email, target_school)` / `revoke_school_admin(id)`,
  callable by a super_admin, from `/admin/settings`
- `scripts/create-super-admin.mjs`, run from a terminal with the service-role key

Keep it that way. A new privileged role needs both a grant path guarded by
`current_role_is` and an `audit_log` write; do not add one that a client can
reach with the anon key.

## `scripts/`

Node ESM (`.mjs`), run from a terminal, reading `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` from the environment. They exist because their work
needs the Admin API or bypasses RLS.

| Script | Purpose |
| --- | --- |
| `create-super-admin.mjs` | creates/repairs the platform super admin, `email_confirm: true` |
| `seed-demo-accounts.mjs` | creates the per-role demo logins for real; mirrors `src/lib/demoAccounts.ts` |
| `check-auth-setup.mjs` | reports which auth providers are live and probes sign-in |

Rules for anything added here:

- **The service-role key never leaves the shell.** No `VITE_` prefix, no import
  into `src/`, no committing, no default value in the file.
- **Safe to re-run.** Repair an existing account in place; never duplicate.
- Fail with an actionable message naming the missing env var or setting.
- A header comment explaining *why it is a script and not SQL* (see
  `create-super-admin.mjs` — `auth.users` has invariants Supabase owns).
- Keep them dependency-free beyond `@supabase/supabase-js`.

`seed_super_admin.sql` is the manual SQL equivalent of the super-admin script.

## Required Supabase dashboard configuration

The signup wizards block without these, and the failure surfaces in the UI:

| Setting | Where | Value |
| --- | --- | --- |
| Confirm email | Auth → Providers → Email | on |
| Confirm-signup template | Auth → Email Templates | must contain `{{ .Token }}` |
| Phone provider | Auth → Providers → Phone | enabled + Twilio credentials |

The built-in mailer is capped at a few messages per hour — wire up SMTP (Resend,
SendGrid, SES) before any real volume. Phone sign-in additionally needs Twilio,
which the project does not have, so email is the supported path.

## Known gaps

- `/admin/tenants` shows tier, seats, renewal and health per school; **those
  columns do not exist on `schools`.** Real rows render with the fields blank.
  Adding them is a migration plus a frontend change.
- Educator students and behaviour logs still live in browser localStorage
  (`src/lib/educatorStore.ts`) even though `students` and `behaviour_logs` exist
  with policies. Moving them to the server is the largest outstanding piece.
- `student_versions`, `behaviour_patterns`, `strategy_feedback`, `invitations`
  and `child_collaborators` have schema and policies but no frontend reads them.

## Before reporting done

- New tables have RLS enabled and explicit policies in the same migration.
- Definer functions pin `search_path`; privileged ones check `current_role_is`.
- Role and privilege changes write `audit_log`.
- The migration re-runs cleanly against an already-migrated database.
- No service-role key anywhere but a shell environment variable.
