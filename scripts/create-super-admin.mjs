#!/usr/bin/env node
/**
 * Create (or repair) the platform super admin.
 *
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/create-super-admin.mjs
 *
 * Run it from a terminal only. The service_role key bypasses every RLS policy
 * in the database — it must never be committed, pasted into a browser, or
 * given a VITE_ prefix, which would inline it into the client bundle.
 *
 * Safe to run more than once: an existing account is updated in place rather
 * than duplicated, so this doubles as a password reset.
 *
 * Why a script and not SQL: auth.users has invariants Supabase owns, so the
 * account is created through the Admin API. Promoting to super_admin then has
 * to happen outside the app, because handle_new_user() deliberately refuses
 * admin roles claimed in signup metadata.
 *
 * Override any of these with env vars:
 *   SUPER_ADMIN_EMAIL     default prabinrb77@gmail.com
 *   SUPER_ADMIN_PASSWORD  default P@ssw0rd123
 *   SUPER_ADMIN_PHONE     optional, only if phone sign-in is enabled
 *   SUPER_ADMIN_NAME      default "Super Admin"
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = (process.env.SUPER_ADMIN_EMAIL ?? "prabinrb77@gmail.com").toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD ?? "P@ssw0rd123";
const phone = process.env.SUPER_ADMIN_PHONE ?? null;
const fullName = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

function die(message) {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (!url || !serviceKey) {
  die(
    "Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.\n" +
      "  Both are in Supabase → Project Settings → API.\n" +
      "  Use the service_role key, not the anon key.",
  );
}
if (serviceKey.length < 100) {
  die("That doesn't look like a service_role key — it should be a long JWT.");
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log(`\nSuper admin setup for ${email}`);
console.log(`  project: ${url}\n`);

// ── 1 · find or create the auth user ────────────────────────────────────────
// email_confirm skips the confirmation email — the account is provisioned by an
// operator who already controls the address, not self-registered.
let userId;

const { data: created, error: createError } = await db.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  ...(phone ? { phone, phone_confirm: true } : {}),
  user_metadata: { full_name: fullName },
});

if (!createError) {
  userId = created.user.id;
  console.log("✔ created auth user", userId);
} else if (/already|registered|exists/i.test(createError.message)) {
  const { data: list, error: listError } = await db.auth.admin.listUsers({
    perPage: 1000,
  });
  if (listError) die(`Could not list users: ${listError.message}`);

  const found = list.users.find((u) => (u.email ?? "").toLowerCase() === email);
  if (!found) {
    die(
      `Supabase says ${email} is taken, but no user carries that address.\n` +
        "  Check Authentication → Users in the dashboard.",
    );
  }

  userId = found.id;
  console.log("• auth user already existed", userId);

  const { error: updateError } = await db.auth.admin.updateUserById(userId, {
    password,
    email_confirm: true,
  });
  if (updateError) die(`Could not reset the password: ${updateError.message}`);
  console.log("✔ password reset and email marked confirmed");
} else {
  die(`Could not create the account: ${createError.message}`);
}

// ── 2 · make sure the profile row says super_admin ──────────────────────────
// handle_new_user() creates the row but always as 'teacher'; it refuses admin
// claims by design, so the promotion happens here with the service_role key.
const { error: upsertError } = await db.from("profiles").upsert(
  {
    id: userId,
    role: "super_admin",
    full_name: fullName,
    email,
    ...(phone ? { phone } : {}),
  },
  { onConflict: "id" },
);
if (upsertError) {
  die(
    `Could not write the profile row: ${upsertError.message}\n` +
      "  Have you run the migrations in supabase/migrations/?",
  );
}

// ── 3 · confirm ─────────────────────────────────────────────────────────────
const { data: profile, error: readError } = await db
  .from("profiles")
  .select("id, role, full_name, email")
  .eq("id", userId)
  .single();

if (readError) die(`Could not read the profile back: ${readError.message}`);
if (profile.role !== "super_admin") {
  die(`Role is "${profile.role}", expected "super_admin".`);
}

console.log("✔ profile role is super_admin\n");
console.log("Done. Sign in at /login with:");
console.log(`  email     ${email}`);
console.log("  password  the one you set\n");
console.log("You'll land on /admin — the console is gated to super_admin.\n");
