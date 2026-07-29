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
 * than duplicated.
 *
 * Why a script and not SQL: auth.users has invariants Supabase owns, so the
 * account is created through the Admin API. Promoting to super_admin then has
 * to happen outside the app, because handle_new_user() deliberately refuses
 * admin roles claimed in signup metadata.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const phone = process.env.SUPER_ADMIN_PHONE ?? "+61400071139";
const password = process.env.SUPER_ADMIN_PASSWORD ?? "P@ssw0rd123";
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

/** Supabase stores numbers without the leading '+'. */
const bare = phone.replace(/\D/g, "");

console.log(`\nSuper admin setup for ${phone}`);
console.log(`  project: ${url}\n`);

// ── 1 · find or create the auth user ────────────────────────────────────────
let userId;

const { data: created, error: createError } = await db.auth.admin.createUser({
  phone,
  password,
  // Marks the number verified without sending an SMS, so no Twilio spend is
  // needed to create the account.
  phone_confirm: true,
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

  const found = list.users.find((u) => (u.phone ?? "").replace(/\D/g, "") === bare);
  if (!found) {
    die(
      `Supabase says ${phone} is taken, but no user carries that number.\n` +
        "  Check Authentication → Users in the dashboard.",
    );
  }

  userId = found.id;
  console.log("• auth user already existed", userId);

  const { error: updateError } = await db.auth.admin.updateUserById(userId, {
    password,
    phone_confirm: true,
  });
  if (updateError) die(`Could not reset the password: ${updateError.message}`);
  console.log("✔ password and phone confirmation reset");
} else {
  die(
    `Could not create the account: ${createError.message}\n` +
      "  If this mentions the phone provider, enable it first:\n" +
      "  Authentication → Sign In / Providers → Phone.",
  );
}

// ── 2 · make sure a profile row exists ──────────────────────────────────────
// handle_new_user() normally does this, but repair it if the trigger predates
// migration 0002 (which taught it to read auth.users.phone).
const { error: upsertError } = await db
  .from("profiles")
  .upsert(
    { id: userId, role: "super_admin", full_name: fullName, phone },
    { onConflict: "id" },
  );
if (upsertError) {
  die(
    `Could not write the profile row: ${upsertError.message}\n` +
      "  Have you run supabase/migrations/0001 and 0002?",
  );
}

// ── 3 · confirm ─────────────────────────────────────────────────────────────
const { data: profile, error: readError } = await db
  .from("profiles")
  .select("id, role, full_name, phone")
  .eq("id", userId)
  .single();

if (readError) die(`Could not read the profile back: ${readError.message}`);
if (profile.role !== "super_admin") {
  die(`Role is "${profile.role}", expected "super_admin".`);
}

console.log("✔ profile role is super_admin\n");
console.log("Done. Sign in at /login with:");
console.log(`  identifier  ${phone.replace("+61", "0")}  (or ${phone})`);
console.log("  password    the one you set\n");
console.log(
  "If sign-in returns \"Phone logins are disabled\", the account is fine —\n" +
    "enable Authentication → Sign In / Providers → Phone in Supabase.\n",
);
