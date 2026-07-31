import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { NavLink, Outlet } from "react-router-dom";
import Avatar from "./Avatar";
import Logo from "./Logo";
import useProfile from "../hooks/useProfile";

/** Figma: super admin console shell — SU1 1:7565, SU2 1:7857, RBAC 1:9540. */

const NAV = [
  { to: "/admin", label: "Global Dashboard", icon: GridIcon, end: true },
  { to: "/admin/tenants", label: "Tenants", icon: TenantsIcon },
  { to: "/admin/mlops", label: "MLOps", icon: MlopsIcon },
  { to: "/admin/security", label: "Security", icon: ShieldIcon },
  { to: "/admin/infrastructure", label: "Infrastructure", icon: ServerIcon },
  { to: "/admin/billing", label: "Billing", icon: BillingIcon },
];

/**
 * SU2 puts "Provision New District" in the top bar rather than the page body,
 * so pages need a way to reach up into the shell. The action belongs to the
 * page (it owns the dialog it opens), which is why this is a slot and not a
 * prop on the layout.
 */
const TopbarActionContext = createContext<(node: ReactNode) => void>(() => {});

export function useTopbarAction(node: ReactNode, deps: unknown[] = []) {
  const setAction = useContext(TopbarActionContext);
  useEffect(() => {
    setAction(node);
    return () => setAction(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export default function SuperAdminLayout({
  searchPlaceholder = "Search districts, metrics, or alerts...",
}: {
  searchPlaceholder?: string;
}) {
  const [action, setAction] = useState<ReactNode>(null);
  const { profile } = useProfile();
  const name = profile?.full_name || "Super Admin";

  return (
    <TopbarActionContext.Provider value={setAction}>
      <div className="flex min-h-screen bg-adminpage">
        <a
          href="#adminmain"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
        >
          Skip to content
        </a>

        {/* ── Rail ───────────────────────────────────────────── */}
        <div className="sticky top-0 hidden h-screen w-[272px] shrink-0 flex-col bg-adminrail py-7 lg:flex">
          <Logo to="/admin" size="sm" tone="light" className="px-6" />

          <nav aria-label="Super admin" className="flex flex-col gap-1 px-4 pt-9">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors",
                    isActive
                      ? "bg-brand font-semibold text-white"
                      : "text-[#CBD5E1] hover:bg-white/5 hover:text-white",
                  ].join(" ")
                }
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              [
                "mx-4 mt-auto flex items-center gap-3 rounded-lg px-4 py-3 text-[15px] transition-colors",
                isActive
                  ? "bg-brand font-semibold text-white"
                  : "text-[#CBD5E1] hover:bg-white/5 hover:text-white",
              ].join(" ")
            }
          >
            <SettingsIcon />
            Settings
          </NavLink>
        </div>

        {/* ── Main column ────────────────────────────────────── */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-20 shrink-0 items-center gap-4 border-b border-line bg-white px-4 md:px-8">
            <label className="relative w-full max-w-[372px]">
              <span className="sr-only">Search</span>
              <SearchIcon />
              <input
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-lg border border-line bg-mist pl-10 pr-4 text-sm text-ink placeholder:text-footext focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>

            <div className="ml-auto flex items-center gap-4">
              {action}

              <span aria-hidden className="hidden h-8 w-px bg-line sm:block" />

              <button
                type="button"
                aria-label="Notifications"
                className="relative text-slate hover:text-ink"
              >
                <BellIcon />
                <span
                  aria-hidden
                  className="absolute right-0 top-0 size-1.5 rounded-full bg-red-500"
                />
              </button>

              <div className="flex items-center gap-3">
                <Avatar name={name} className="size-10" />
                <span className="hidden sm:block">
                  <span className="block text-sm font-bold leading-5 text-ink">
                    {name}
                  </span>
                  <span className="block text-xs leading-4 text-muted">
                    Global Access
                  </span>
                </span>
              </div>
            </div>
          </header>

          <main id="adminmain" className="flex-1 px-4 pb-16 pt-8 md:px-8 lg:pb-8">
            <Outlet />
          </main>

          {/* The Figma console frames are desktop-only; this keeps the area
              navigable where the rail is hidden. */}
          <nav
            aria-label="Super admin (mobile)"
            className="fixed inset-x-0 bottom-0 z-50 flex overflow-x-auto border-t border-line bg-white lg:hidden"
          >
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "flex min-w-[76px] flex-1 flex-col items-center gap-1 py-2.5 text-[10px]",
                    isActive ? "font-semibold text-brand" : "text-muted",
                  ].join(" ")
                }
              >
                <item.icon />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </TopbarActionContext.Provider>
  );
}

/* ── page header, shared by every console screen ───────────── */

export function PageHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[28px] font-bold leading-9 text-ink">{title}</h1>
        <p className="mt-1 text-[15px] leading-6 text-body">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

/* ── icons ─────────────────────────────────────────────────── */

function GridIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <rect x="2.5" y="2.5" width="15" height="15" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 8h15M8 8v9.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function TenantsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <rect x="4" y="2.5" width="12" height="15" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7.5 6h2M7.5 9.5h2M7.5 13h2M12 6h.5M12 9.5h.5M12 13h.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MlopsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <circle cx="10" cy="10" r="7.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 2.8a7.2 7.2 0 0 1 0 14.4V2.8Z" fill="currentColor" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M10 2.5 16 5v4.6c0 3.5-2.4 6.6-6 7.9-3.6-1.3-6-4.4-6-7.9V5l6-2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <rect x="2.5" y="3.5" width="15" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2.5" y="11.5" width="15" height="5" rx="1.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 6h.01M5.5 14h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BillingIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M4.5 2.5h11v15l-2.2-1.4-2.15 1.4L9 16.1l-2.15 1.4L4.5 16.1V2.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M7.5 6.5h5M7.5 9.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 2.5v2M10 15.5v2M17.5 10h-2M4.5 10h-2M15.3 4.7l-1.4 1.4M6.1 13.9l-1.4 1.4M15.3 15.3l-1.4-1.4M6.1 6.1 4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-footext"
    >
      <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m13.5 13.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <path
        d="M5 8a5 5 0 0 1 10 0c0 3.5 1.2 4.6 1.2 4.6H3.8S5 11.5 5 8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.3 15.3a1.9 1.9 0 0 0 3.4 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
