-- ============================================================================
-- Promote the platform super admin — manual SQL fallback.
--
-- Prefer scripts/create-super-admin.mjs, which does the whole job in one
-- command (creates the account through the Admin API, then promotes it).
-- This file is here for when you'd rather do the promotion by hand, or the
-- account already exists and only the role is wrong.
--
-- ⚠️  DEV / DEMO ONLY. super_admin has unrestricted platform access. Rotate the
--     password before this project is public.
--
-- Roles cannot be self-assigned: handle_new_user() refuses admin claims from
-- signup metadata by design, which is why the first super admin is made here.
-- ============================================================================

-- ── Step 1 · the account must already exist ─────────────────────────────────
-- auth.users rows should never be hand-inserted — Supabase owns that table's
-- invariants. Either sign up normally at /signup with the address below, or
-- run the script:
--
--   SUPABASE_URL=https://xxxx.supabase.co \
--   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
--   node scripts/create-super-admin.mjs

-- ── Step 2 · grant the role ─────────────────────────────────────────────────

update profiles p
   set role       = 'super_admin',
       full_name  = coalesce(p.full_name, 'Super Admin'),
       email      = coalesce(p.email, u.email),
       updated_at = now()
  from auth.users u
 where u.id = p.id
   and lower(u.email) = lower('prabinrb77@gmail.com');

-- ── Step 3 · confirm it took ────────────────────────────────────────────────
-- Expect exactly one row.

select p.id, p.role, p.full_name, p.email, u.email_confirmed_at
  from profiles p
  join auth.users u on u.id = p.id
 where p.role = 'super_admin';

-- If step 3 returns nothing, the account doesn't exist yet. Check with:
--   select id, email, phone, created_at from auth.users order by created_at desc limit 5;
