import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useProfile, { UserRole, heldRoles } from "../hooks/useProfile";
import { supabase } from "../lib/supabase";
import { getDemoSession } from "../lib/demoAccounts";

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

  // No backend: enforce against the presentation account if one is signed in,
  // so role separation is demonstrable. With nobody signed in, stay open —
  // the screens still need to be reviewable by URL.
  if (!supabase) {
    const demo = getDemoSession();
    if (demo && !allow.includes(demo.role)) {
      return <Navigate to={demo.home} replace />;
    }
    return <>{children}</>;
  }
  if (loading) return <GuardSplash />;
  if (!session) return <Navigate to="/login" replace />;
  // Checked against every role held, not just the primary one, so a teacher
  // who is also a parent isn't locked out of either area.
  if (!heldRoles(profile).some((r) => allow.includes(r))) {
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
