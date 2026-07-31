#!/usr/bin/env node
/**
 * Report what's actually configured on the Supabase project, so a failing
 * login can be traced to a setting rather than guessed at.
 *
 *   node scripts/check-auth-setup.mjs
 *
 * Uses only the anon key from .env.local — safe to run any time. The sign-in
 * probe deliberately sends a wrong password: the error code it comes back with
 * is what distinguishes "provider is off" from "account doesn't exist".
 */

import { readFileSync } from "node:fs";

function loadEnvLocal() {
  try {
    const out = {};
    for (const line of readFileSync(".env.local", "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
    return out;
  } catch {
    return {};
  }
}

const env = { ...loadEnvLocal(), ...process.env };
const url = env.SUPABASE_URL ?? env.VITE_SUPABASE_URL;
const anon = env.SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY;
const email = env.SUPER_ADMIN_EMAIL ?? "prabinrb77@gmail.com";
const phone = env.SUPER_ADMIN_PHONE ?? null;

if (!url || !anon) {
  console.error("\n✖ No Supabase URL/anon key found in .env.local or the environment.\n");
  process.exit(1);
}

const tick = (ok) => (ok ? "✔" : "✖");

const settings = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: anon },
}).then((r) => r.json());

console.log(`\nAuth setup — ${url}\n`);
console.log(`  ${tick(settings.external.email)} email provider     ${settings.external.email}`);
console.log(`  ${tick(settings.external.phone)} phone provider     ${settings.external.phone}`);
console.log(
  `  ${tick(!settings.mailer_autoconfirm)} email confirmation ${
    settings.mailer_autoconfirm ? "OFF — no confirmation code is sent" : "ON"
  }`,
);

async function probe(label, credentials, hints) {
  const res = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: anon, "Content-Type": "application/json" },
    body: JSON.stringify({ ...credentials, password: "probe-not-a-real-password" }),
  }).then((r) => r.json());

  console.log(`\n${label}`);
  const hint = hints[res.error_code];
  if (hint) hint();
  else console.log(`  ? ${res.error_code ?? res.msg ?? JSON.stringify(res)}`);
}

await probe(`Email sign-in probe (${email})`, { email }, {
  // Supabase returns the same error whether or not the account exists, to avoid
  // leaking which addresses are registered — so this confirms the endpoint is
  // reachable, not that the super admin has been created.
  invalid_credentials: () => {
    console.log("  ✔ Email sign-in is live.");
    console.log("    → Can't tell from outside whether the account exists;");
    console.log("      run scripts/create-super-admin.mjs — it's safe to re-run.");
  },
  email_provider_disabled: () => {
    console.log("  ✖ Email logins are disabled.");
    console.log("    → Authentication → Sign In / Providers → Email.");
  },
});

if (phone) {
  await probe(`Phone sign-in probe (${phone})`, { phone }, {
    phone_provider_disabled: () => {
      console.log("  ✖ Phone logins are disabled.");
      console.log("    → Needs the Phone provider plus Twilio credentials.");
    },
    invalid_credentials: () => console.log("  ✔ Phone auth is live."),
  });
}
console.log("");
