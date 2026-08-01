import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;

/**
 * Accept both Supabase's newer publishable key and the legacy anon key.
 */
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/* The single hardcoded educator login this file used to carry has been replaced
   by the per-role presentation accounts in ./demoAccounts.ts. */

/**
 * Null until VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are set (in .env.local
 * for dev, repo secrets for the Pages deploy). Auth forms fall back to a
 * "not open yet" notice while unconfigured, so the site works either way.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

/** Where OAuth and email links should land after Supabase redirects back. */
export function authRedirectUrl(path = "") {
  return window.location.origin + import.meta.env.BASE_URL + path;
}

export const NOT_CONFIGURED_NOTICE =
  "Accounts aren't open yet — logins will work once the MiZanova app launches.";
