import type { UserRole } from "../hooks/useProfile";

/**
 * Presentation accounts, one per role.
 *
 * These are only reachable when no Supabase project is configured — with a
 * backend live, sign-in goes to Supabase and these are ignored entirely. They
 * exist so the app can be demonstrated end to end without a database, and so
 * role separation is visible rather than just described.
 *
 * The same addresses can be created for real with
 * `node scripts/seed-demo-accounts.mjs`, which sets the matching roles.
 */

export const DEMO_PASSWORD = "P@ssw0rd";

export type DemoAccount = {
  email: string;
  role: UserRole;
  name: string;
  /** Where this role lands after sign-in. */
  home: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "superadmin@mizanova.com.au",
    role: "super_admin",
    name: "Super Admin",
    home: "/admin",
  },
  {
    email: "schooladmin@mizanova.com.au",
    role: "school_admin",
    name: "School Admin",
    home: "/app",
  },
  {
    email: "teacher@mizanova.com.au",
    role: "teacher",
    name: "Sarah Jenkins",
    home: "/app",
  },
  {
    email: "specialist@mizanova.com.au",
    role: "specialist",
    name: "Dr. Aris",
    home: "/",
  },
  {
    email: "parent@mizanova.com.au",
    role: "parent",
    name: "Parent",
    home: "/",
  },
];

export function findDemoAccount(email: string) {
  const wanted = email.trim().toLowerCase();
  return DEMO_ACCOUNTS.find((a) => a.email === wanted) ?? null;
}

/* ── demo session ──────────────────────────────────────────────
   Kept in localStorage so a refresh doesn't drop you, and so the
   role guards have something to enforce against without a backend. */

const KEY = "mizanova.demoAccount";

export function setDemoSession(account: DemoAccount) {
  try {
    localStorage.setItem(KEY, account.email);
  } catch {
    // Private browsing can refuse writes; the session just won't persist.
  }
  window.dispatchEvent(new Event("mizanova:demo-session"));
}

export function getDemoSession(): DemoAccount | null {
  try {
    const email = localStorage.getItem(KEY);
    return email ? findDemoAccount(email) : null;
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  window.dispatchEvent(new Event("mizanova:demo-session"));
}
