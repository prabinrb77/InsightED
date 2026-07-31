-- ============================================================================
-- MiZanova — super admin console
--
-- 0001 scopes every read to membership, which is right for teachers, parents
-- and specialists but leaves a super_admin unable to see the platform they
-- administer. This adds the console's read access and the one write it needs:
-- promoting an existing account to school_admin.
--
-- Note on privilege escalation: handle_new_user() in 0001 deliberately refuses
-- to honour a 'school_admin' or 'super_admin' claim from signup metadata, so
-- these roles can only ever be granted by an existing super_admin (below) or
-- by hand in SQL. Do not relax that trigger.
-- ============================================================================

-- ── phone-only accounts ──────────────────────────────────────────────────────
-- 0001's trigger reads the phone out of signup metadata, which the wizards set.
-- An account created with the Admin API (as the platform super admin is) has
-- no such metadata — the number lives on auth.users.phone instead, and the
-- profile row was landing with phone null. Fall back to the column.

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  claimed text := new.raw_user_meta_data ->> 'role';
  resolved user_role := 'teacher';
begin
  -- Never let an unexpected metadata value abort the signup transaction, and
  -- never honour a claim to an admin role from client-supplied metadata.
  if claimed in ('teacher', 'parent', 'specialist') then
    resolved := claimed::user_role;
  end if;

  insert into profiles (id, role, full_name, email, phone)
  values (
    new.id,
    resolved,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'phone', new.phone)
  )
  on conflict (id) do nothing;
  return new;
end; $$;

-- ── console read access ──────────────────────────────────────────────────────
-- Postgres OR-combines multiple permissive SELECT policies, so each of these
-- widens access for super_admin only and leaves the 0001 rules untouched.

create policy profiles_admin_read on profiles for select
  using (current_role_is(array['super_admin']::user_role[]));

create policy schools_admin_read on schools for select
  using (current_role_is(array['super_admin']::user_role[]));

create policy school_members_admin_read on school_members for select
  using (current_role_is(array['super_admin']::user_role[]));

-- Provisioning a district is a super_admin action.
create policy schools_admin_insert on schools for insert
  with check (current_role_is(array['super_admin']::user_role[]));

-- ── grant school_admin ───────────────────────────────────────────────────────
-- Takes an address that has already signed up rather than creating the account:
-- creating a user requires the service_role key, which must never reach the
-- browser. The invitee signs up normally, then is promoted here.

create or replace function grant_school_admin(
  target_email  text,
  target_school uuid default null
)
returns table (id uuid, full_name text, email text, role user_role)
language plpgsql security definer set search_path = public as $$
declare
  target profiles%rowtype;
begin
  if not current_role_is(array['super_admin']::user_role[]) then
    raise exception 'not authorised';
  end if;

  if target_email is null or length(trim(target_email)) = 0 then
    raise exception 'an email address is required';
  end if;

  select * into target
  from profiles p
  where lower(p.email) = lower(trim(target_email));

  if not found then
    raise exception
      'No MiZanova account exists for %. Ask them to sign up first, then grant access.',
      trim(target_email);
  end if;

  update profiles p
     set role = 'school_admin', updated_at = now()
   where p.id = target.id;

  if target_school is not null then
    insert into school_members (school_id, profile_id, role, status)
    values (target_school, target.id, 'school_admin', 'active')
    on conflict (school_id, profile_id)
      do update set role = 'school_admin', status = 'active';
  end if;

  insert into audit_log (actor_id, action, entity, entity_id, reason)
  values (
    auth.uid(),
    'grant_school_admin',
    'profile',
    target.id,
    concat('Granted school_admin to ', trim(target_email))
  );

  return query
    select p.id, p.full_name, p.email, p.role
    from profiles p
    where p.id = target.id;
end; $$;

revoke execute on function grant_school_admin(text, uuid) from anon;
grant  execute on function grant_school_admin(text, uuid) to authenticated;

-- ── revoke it again ──────────────────────────────────────────────────────────
create or replace function revoke_school_admin(target_id uuid)
returns void
language plpgsql security definer set search_path = public as $$
begin
  if not current_role_is(array['super_admin']::user_role[]) then
    raise exception 'not authorised';
  end if;

  update profiles set role = 'teacher', updated_at = now()
   where id = target_id and role = 'school_admin';

  update school_members set status = 'revoked'
   where profile_id = target_id and role = 'school_admin';

  insert into audit_log (actor_id, action, entity, entity_id, reason)
  values (auth.uid(), 'revoke_school_admin', 'profile', target_id,
          'School admin access revoked from the super admin console');
end; $$;

revoke execute on function revoke_school_admin(uuid) from anon;
grant  execute on function revoke_school_admin(uuid) to authenticated;
