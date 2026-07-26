import { NavLink, Outlet } from "react-router-dom";
import Avatar from "./Avatar";

/** Figma: educator app shell — dark rail + search/profile top bar (1:495 and siblings). */

const NAV = [
  { to: "/app", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/app/students", label: "Students", icon: StudentsIcon },
  { to: "/app/messages", label: "Messages", icon: MessagesIcon },
  { to: "/app/schedule", label: "Schedule", icon: ScheduleIcon },
];

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-page">
      <a
        href="#appmain"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-brand"
      >
        Skip to content
      </a>

      {/* ── Rail ─────────────────────────────────────────────── */}
      <div className="sticky top-0 hidden h-screen w-[216px] shrink-0 flex-col bg-sidebar py-7 md:flex">
        <NavLink to="/app" className="px-6 text-xl font-bold text-white">
          InsightED
        </NavLink>

        <nav aria-label="Educator" className="flex flex-col gap-1 px-3 pt-10">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-base transition-colors",
                  isActive
                    ? "bg-brand font-semibold text-white"
                    : "text-sidebarmuted hover:bg-white/5 hover:text-white",
                ].join(" ")
              }
            >
              <item.icon />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            [
              "mt-auto flex items-center gap-3 px-7 py-3 text-base transition-colors",
              isActive ? "text-white" : "text-sidebarmuted hover:text-white",
            ].join(" ")
          }
        >
          <SettingsIcon />
          Settings
        </NavLink>
      </div>

      {/* ── Main column ──────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-[72px] shrink-0 items-center gap-4 border-b border-line bg-white px-4 md:px-6">
          <label className="relative w-full max-w-[350px]">
            <span className="sr-only">Search</span>
            <SearchIcon />
            <input
              placeholder="Search students, logs, or activities..."
              className="h-10 w-full rounded-lg border border-line bg-mist pl-10 pr-4 text-sm text-ink placeholder:text-footext focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <div className="ml-auto flex items-center gap-4">
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

            <span aria-hidden className="h-8 w-px bg-line" />

            <div className="flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-sm font-bold leading-5 text-ink">
                  Sarah Jenkins
                </span>
                <span className="block text-xs leading-4 text-muted">
                  Educator
                </span>
              </span>
              <Avatar name="Sarah Jenkins" className="size-9" />
            </div>
          </div>
        </header>

        <main id="appmain" className="flex-1 pb-16 md:pb-0">
          <Outlet />
        </main>

        {/* The Figma app frames are desktop-only; this keeps the app
            navigable on phones where the rail is hidden. */}
        <nav
          aria-label="Educator (mobile)"
          className="fixed inset-x-0 bottom-0 z-50 flex border-t border-line bg-white md:hidden"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px]",
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
  );
}

/* ── icons ─────────────────────────────────────────────────── */

function DashboardIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v14" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function StudentsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <circle cx="7" cy="7" r="3" />
      <circle cx="14" cy="8" r="2.2" />
      <path d="M1.5 16c0-2.8 2.5-4.5 5.5-4.5s5.5 1.7 5.5 4.5H1.5Z" />
      <path d="M14 11.5c2.3 0 4.5 1.2 4.5 3.4V16H14v-4.5Z" />
    </svg>
  );
}

function MessagesIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path d="M10 2.5c4.4 0 8 2.8 8 6.2 0 3.5-3.6 6.3-8 6.3-.9 0-1.7-.1-2.5-.3L3 16.5l1.2-2.9C2.8 12.4 2 10.9 2 8.7c0-3.4 3.6-6.2 8-6.2Z" />
    </svg>
  );
}

function ScheduleIcon() {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-5">
      <rect x="2.5" y="4" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.5 8h15M6.5 2.5v3M13.5 2.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
