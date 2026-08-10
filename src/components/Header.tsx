import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "./Logo";
import useProfile, { activeRoleOf } from "../hooks/useProfile";
import { supabase } from "../lib/supabase";
import { clearDemoSession, homeForRole } from "../lib/demoAccounts";

/** Figma: node 264:1826 "Header" */

const NAV = [
  { label: "For Schools", to: "/for-schools" },
  { label: "For Parents", to: "/for-parents" },
  { label: "For Specialists", to: "/for-specialists" },
  { label: "Pricing", to: "/pricing" },
  { label: "Resources", to: "/resources" },
  { label: "About", to: "/about" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { profile, session } = useProfile();
  const signedIn = Boolean(session || profile);
  const workspaceHome = homeForRole(activeRoleOf(profile));

  function handleSignOut() {
    if (supabase) void supabase.auth.signOut();
    else clearDemoSession();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex h-16 max-w-shell items-center gap-6 px-6">
        <Logo size="sm" onClick={() => setOpen(false)} />

        {/* Desktop nav */}
        <nav className="ml-auto hidden items-center gap-6 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "text-base leading-6 transition-colors hover:text-brand",
                  isActive ? "font-medium text-brand" : "text-slate",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          {signedIn ? (
            <>
              <span
                className="hidden max-w-[200px] truncate text-sm leading-6 text-muted sm:inline-block"
                title={session?.user.email ?? profile?.email ?? undefined}
              >
                {session?.user.email ?? profile?.email}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="flex h-12 items-center justify-center rounded-lg border border-line px-6 text-base font-semibold text-ink transition-colors hover:bg-line-soft"
              >
                Log out
              </button>
              <Link
                to={workspaceHome}
                className="flex h-12 items-center justify-center rounded-lg bg-brand px-6 text-base font-semibold text-white shadow-btn transition-colors hover:bg-[#255d99]"
              >
                Open workspace
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden text-base font-semibold leading-6 text-brand sm:inline-block"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="flex h-12 items-center justify-center rounded-lg bg-brand px-6 text-base font-semibold text-white shadow-btn transition-colors hover:bg-[#255d99]"
              >
                Get Started
              </Link>
            </>
          )}

          <button
            type="button"
            className="lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block h-0.5 w-6 bg-ink" />
            <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
            <span className="mt-1.5 block h-0.5 w-6 bg-ink" />
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="border-t border-line bg-white px-6 py-4 lg:hidden"
        >
          <ul className="flex flex-col gap-4">
            {NAV.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className="block text-base text-slate"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="sm:hidden">
              <Link
                to="/login"
                className="block text-base font-semibold text-brand"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
