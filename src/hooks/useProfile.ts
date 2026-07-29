import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import useSession from "./useSession";

export type UserRole =
  | "teacher"
  | "parent"
  | "specialist"
  | "school_admin"
  | "super_admin";

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

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
      .select("id, role, full_name, email, phone")
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
