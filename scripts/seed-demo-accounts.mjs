#!/usr/bin/env node
/**
 * Create the five role demo accounts for real, in Supabase.
 *
 *   SUPABASE_URL=https://xxxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node scripts/seed-demo-accounts.mjs
 *
 * Mirrors src/lib/demoAccounts.ts, which covers the no-backend case. Run this
 * when you want the same logins working against the live project.
 *
 * Terminal only. The service_role key bypasses every RLS policy — never commit
 * it, never paste it into a browser, never give it a VITE_ prefix.
 *
 * Safe to re-run: existing accounts are repaired (password reset, role fixed)
 * rather than duplicated.
 *
 * Override the shared password with DEMO_PASSWORD.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const password = process.env.DEMO_PASSWORD ?? "P@ssw0rd";

// Keep in step with src/lib/demoAccounts.ts.
const ACCOUNTS = [
  { email: "superadmin@mizanova.com.au", role: "super_admin", name: "Super Admin" },
  { email: "schooladmin@mizanova.com.au", role: "school_admin", name: "School Admin" },
  { email: "teacher@mizanova.com.au", role: "teacher", name: "Sarah Jenkins" },
  { email: "specialist@mizanova.com.au", role: "specialist", name: "Dr. Aris" },
  { email: "parent@mizanova.com.au", role: "parent", name: "Parent" },
];

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

console.log(`\nSeeding ${ACCOUNTS.length} demo accounts`);
console.log(`  project: ${url}\n`);

// Listed once rather than per account, so repair is a lookup not five calls.
const { data: list, error: listError } = await db.auth.admin.listUsers({
  perPage: 1000,
});
if (listError) die(`Could not list users: ${listError.message}`);
const existing = new Map(
  list.users.map((u) => [(u.email ?? "").toLowerCase(), u]),
);

let failures = 0;

for (const account of ACCOUNTS) {
  const email = account.email.toLowerCase();
  let userId = existing.get(email)?.id ?? null;

  if (userId) {
    const { error } = await db.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
    });
    if (error) {
      console.log(`  ✖ ${email} — ${error.message}`);
      failures += 1;
      continue;
    }
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: account.name },
    });
    if (error) {
      console.log(`  ✖ ${email} — ${error.message}`);
      failures += 1;
      continue;
    }
    userId = data.user.id;
  }

  // handle_new_user() always lands accounts as 'teacher' and refuses admin
  // claims from metadata, so every role is set here with the service_role key.
  const { error: profileError } = await db.from("profiles").upsert(
    { id: userId, role: account.role, full_name: account.name, email },
    { onConflict: "id" },
  );
  if (profileError) {
    console.log(`  ✖ ${email} — profile: ${profileError.message}`);
    failures += 1;
    continue;
  }

  console.log(`  ✔ ${email.padEnd(30)} ${account.role}`);
}

if (failures) {
  die(
    `${failures} account(s) failed.\n` +
      "  A password rejected as too weak or breached means Supabase has leaked-password\n" +
      "  protection on — set DEMO_PASSWORD to something stronger and re-run.",
  );
}

console.log(`\nDone. All five sign in with: ${password}`);
console.log("superadmin@ lands on /admin; teacher@ and schooladmin@ on /app.\n");
