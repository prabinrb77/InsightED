-- ============================================================================
-- Promote the platform super admin.
--
-- ⚠️  DEV / DEMO ONLY. This grants unrestricted platform access. Before this
--     project is public, rotate the password and consider creating the account
--     with a real address so password reset works.
--
-- Run this in the Supabase SQL editor AFTER 0002_super_admin.sql, and AFTER the
-- account itself exists — see step 1 below. Roles cannot be self-assigned:
-- handle_new_user() refuses admin claims from signup metadata by design, which
-- is why the first super admin has to be made here by hand.
-- ============================================================================

-- ── Step 1 · create the account (not SQL) ───────────────────────────────────
-- auth.users rows should never be hand-inserted — Supabase owns that table's
-- invariants. Create it with the Admin API, using the service_role key from
-- Project Settings → API. Run this from a terminal, never from the browser:
--
--   node -e "
--     const { createClient } = require('@supabase/supabase-js');
--     const db = createClient(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);
--     db.auth.admin.createUser({
--       phone: '+61400071139',
--       password: 'P@ssw0rd123',
--       phone_confirm: true,
--       user_metadata: { full_name: 'Super Admin' },
--     }).then(r => console.log(r.error ?? r.data.user.id));
--   "
--
-- phone_confirm: true marks the number verified without sending an SMS, so no
-- Twilio spend is needed to create the account. Signing in with it still needs
-- Authentication → Sign In / Providers → Phone switched on.

-- ── Step 2 · grant the role ─────────────────────────────────────────────────
-- Supabase stores phone numbers without the leading '+', so match on both.

update profiles p
   set role      = 'super_admin',
       full_name = coalesce(p.full_name, 'Super Admin'),
       phone     = coalesce(p.phone, u.phone),
       updated_at = now()
  from auth.users u
 where u.id = p.id
   and replace(coalesce(u.phone, ''), '+', '') = '61400071139';

-- ── Step 3 · confirm it took ────────────────────────────────────────────────
-- Expect exactly one row with role = 'super_admin'.

select p.id, p.role, p.full_name, p.phone, u.phone as auth_phone
  from profiles p
  join auth.users u on u.id = p.id
 where p.role = 'super_admin';

-- If step 3 returns nothing, the account from step 1 doesn't exist yet, or the
-- number was stored in a different format — check with:
--   select id, phone, email from auth.users order by created_at desc limit 5;
