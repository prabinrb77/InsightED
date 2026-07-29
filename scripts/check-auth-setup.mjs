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
const phone = env.SUPER_ADMIN_PHONE ?? "+61400071139";

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

const probe = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: anon, "Content-Type": "application/json" },
  body: JSON.stringify({ phone, password: "probe-not-a-real-password" }),
}).then((r) => r.json());

console.log(`\nPhone sign-in probe (${phone})`);
switch (probe.error_code) {
  case "phone_provider_disabled":
    console.log("  ✖ Phone logins are disabled.");
    console.log("    → Authentication → Sign In / Providers → Phone (needs Twilio credentials).");
    break;
  case "invalid_credentials":
    console.log("  ✔ Phone auth is live and the endpoint accepts this number.");
    console.log("    → If the real password also fails, run scripts/create-super-admin.mjs.");
    break;
  default:
    console.log(`  ? ${probe.error_code ?? probe.msg ?? JSON.stringify(probe)}`);
}
console.log("");
