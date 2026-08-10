import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import useProfile, { UserRole, heldRoles } from "../hooks/useProfile";
import { supabase } from "../lib/supabase";
import { getDemoSession } from "../lib/demoAccounts";
import TotpMfa from "./TotpMfa";

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
  return <Aal2Gate>{children}</Aal2Gate>;
}

function Aal2Gate({children}:{children:ReactNode}) {
  const [aal2,setAal2]=useState<boolean|null>(null);
  useEffect(()=>{supabase?.auth.mfa.getAuthenticatorAssuranceLevel().then(({data})=>setAal2(data?.currentLevel==="aal2"))},[]);
  if(aal2===null)return <GuardSplash/>;
  if(!aal2)return <div className="flex min-h-screen items-center justify-center bg-page p-4"><div className="w-full max-w-md rounded-xl border border-line bg-white p-8"><h1 className="mb-2 text-2xl font-bold text-ink">Authenticator verification required</h1><p className="mb-6 text-sm text-muted">School records are protected until this session reaches AAL2.</p><TotpMfa onVerified={()=>setAal2(true)}/></div></div>;
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
