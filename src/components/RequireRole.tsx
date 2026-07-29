import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useProfile, { UserRole } from "../hooks/useProfile";
import { supabase } from "../lib/supabase";

/**
 * Route guard for role-restricted areas.
 *
 * This is a *usability* gate, not a security boundary — the real enforcement is
 * the RLS policies in Postgres, which is what stops a determined user who edits
 * their local state from reading anything. Keep both: this one keeps honest
 * users out of screens that would only show them empty tables.
 *
 * With Supabase unconfigured there is no session to check, so the area opens in
 * demo mode. That matches how the rest of the app degrades (see
 * NOT_CONFIGURED_NOTICE) and keeps the screens reviewable without a backend.
 */
export default function RequireRole({
  allow,
  children,
}: {
  allow: UserRole[];
  children: ReactNode;
}) {
  const { profile, loading, session } = useProfile();

  if (!supabase) return <>{children}</>;
  if (loading) return <GuardSplash />;
  if (!session) return <Navigate to="/login" replace />;
  if (!profile || !allow.includes(profile.role)) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}

function GuardSplash() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <p className="text-sm text-muted" role="status">
        Checking your access…
      </p>
    </div>
  );
}
