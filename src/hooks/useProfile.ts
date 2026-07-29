import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useSession from "./useSession";

export type UserRole =
  | "teacher"
  | "external_teacher"
  | "parent"
  | "specialist"
  | "school_admin"
  | "platform_admin"
  | "super_admin";

export type Profile = {
  id: string;
  /** Primary role. Kept for the RLS policies written against it. */
  role: UserRole;
  /** Every role the account holds (spec Prompt 18). */
  roles: UserRole[] | null;
  /** The single role governing this session, once chosen. */
  active_role: UserRole | null;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

/**
 * Prompt 18 requires exactly one role to govern a session, and no switching
 * without re-authenticating. Until the role-selector screen exists, fall back
 * to the primary role so nothing is left without an answer.
 */
export function activeRoleOf(profile: Profile | null): UserRole | null {
  if (!profile) return null;
  return profile.active_role ?? profile.role;
}

export function heldRoles(profile: Profile | null): UserRole[] {
  if (!profile) return [];
  const set = new Set<UserRole>(profile.roles ?? []);
  set.add(profile.role);
  return [...set];
}

/**
 * The signed-in user's profile row, which is where `role` lives — the JWT only
 * carries identity. `loading` starts true and is the reason route guards must
 * wait rather than redirect: without it, every admin route would bounce to
 * /login for the split second before the row arrives.
 */
export default function useProfile() {
  const session = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // No backend configured, or signed out: settle immediately so guards can
    // decide instead of spinning forever.
    if (!supabase || !session?.user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    supabase
      .from("profiles")
      .select("id, role, roles, active_role, full_name, email, phone")
      .eq("id", session.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setProfile((data as Profile) ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  return { profile, loading, session };
}
