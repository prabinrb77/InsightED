import { useEffect, useState } from "react";
import { getDemoSession } from "../lib/demoAccounts";
import { supabase } from "../lib/supabase";
import useSession from "./useSession";

export type CurrentSchool = { id: string; name: string };

export default function useCurrentSchool() {
  const session = useSession();
  const demo = !supabase ? getDemoSession() : null;
  const [school, setSchool] = useState<CurrentSchool | null>(demo?.school ?? {
    id: "harbourview", name: "Harbourview Primary",
  });
  const [loading, setLoading] = useState(Boolean(supabase && session));

  useEffect(() => {
    if (!supabase || !session) return;
    let active = true;
    setLoading(true);
    supabase.from("school_members")
      .select("school_id,schools(name)")
      .eq("profile_id", session.user.id).eq("status", "active").limit(1).maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const nested = data?.schools as unknown as { name: string } | null;
        setSchool(data ? { id: data.school_id as string, name: nested?.name ?? "Current school" } : null);
        setLoading(false);
      });
    return () => { active = false; };
  }, [session?.user.id]);

  return { school, loading, isDemo: !supabase || !session };
}
