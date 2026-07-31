import { FormEvent, useEffect, useState } from "react";
import { PageHeading } from "../../components/SuperAdminLayout";
import { Badge, IconChip, Panel } from "../../components/adminBits";
import Avatar from "../../components/Avatar";
import { supabase, NOT_CONFIGURED_NOTICE } from "../../lib/supabase";
import type { UserRole } from "../../hooks/useProfile";

/** Figma: node 1:9540 "Settings & RBAC Dashboard" */

/** The three admin tiers from spec Prompt 6, plus the specialist review role. */
type RoleKey = "super_admin" | "platform_admin" | "school_admin" | "specialist";

const ROLES: {
  key: RoleKey;
  name: string;
  blurb: string;
  glyph: JSX.Element;
}[] = [
  { key: "super_admin", name: "Super Admin", blurb: "Technical root control — internal only", glyph: <CrownGlyph /> },
  { key: "platform_admin", name: "Platform Admin", blurb: "Business operations — Special Miles team", glyph: <ReceiptGlyph /> },
  { key: "school_admin", name: "School Admin", blurb: "Institution-level oversight", glyph: <SchoolGlyph /> },
  { key: "specialist", name: "Specialist", blurb: "Clinical & caseload access", glyph: <FlaskGlyph /> },
];

const PERMISSIONS: Record<RoleKey, { scope: string; description: string; on: boolean }[]> = {
  super_admin: [
    { scope: "Delete Tenant Data", description: "Allows permanent removal of customer database records and backups.", on: true },
    { scope: "View Financials", description: "Access to Stripe logs, revenue dashboards, and ARR reporting.", on: true },
    { scope: "Push AI Model Updates", description: "Trigger production deployments for core LLM inference logic.", on: true },
    { scope: "Impersonate Users", description: "Login as any customer user for support and troubleshooting.", on: true },
  ],
  platform_admin: [
    { scope: "Manage Users", description: "Approve, suspend and deactivate teachers across all schools.", on: true },
    { scope: "Manage Schools", description: "Create and edit schools, assign school admins, set subscription tier.", on: true },
    { scope: "View Financials", description: "Read-only Stripe: subscriptions, revenue, refunds, GST reporting.", on: true },
    { scope: "Feature Flags", description: "System-wide toggles are super admin only — platform admin cannot reach infrastructure.", on: false },
  ],
  school_admin: [
    { scope: "Manage Staff", description: "Invite, suspend and remove teachers within their own school.", on: true },
    { scope: "View Safeguarding Log", description: "Read break-glass audit entries recorded for their school.", on: true },
    { scope: "Export Student Data", description: "Download anonymised rosters and behaviour trends for their school.", on: true },
    { scope: "View Financials", description: "Access to Stripe logs, revenue dashboards, and ARR reporting.", on: false },
  ],
  specialist: [
    { scope: "Clinical Notes", description: "Read and write high-clearance notes on linked students.", on: true },
    { scope: "Endorse Strategies", description: "Approve or reject AI-suggested strategies before use.", on: true },
    { scope: "Manage Staff", description: "Invite, suspend and remove teachers within their own school.", on: false },
  ],
};

type Person = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
};

type School = { id: string; name: string };

type Notice = { kind: "ok" | "error" | "info"; text: string };

export default function AdminAccessPage() {
  const [selected, setSelected] = useState<RoleKey>("super_admin");
  const [people, setPeople] = useState<Person[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);

  const role = ROLES.find((r) => r.key === selected)!;
  // Every tier here maps to a real user_role value, so each has a roster.
  const dbRole: UserRole = selected;

  async function loadPeople() {
    if (!supabase) {
      setPeople([]);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", dbRole)
      .order("full_name");
    setPeople((data as Person[]) ?? []);
  }

  useEffect(() => {
    loadPeople();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dbRole]);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from("schools")
      .select("id, name")
      .order("name")
      .then(({ data }) => setSchools((data as School[]) ?? []));
  }, []);

  return (
    <>
      <PageHeading
        title="Platform Settings &amp; Access"
        subtitle="Manage MiZanova employee permissions and system configuration."
        action={
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#245A94]"
          >
            <PlusIcon />
            Grant School Admin
          </button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        {/* ── role list ─────────────────────────────────────── */}
        <Panel className="overflow-hidden p-0">
          <h2 className="px-6 py-5 text-[11px] font-bold uppercase tracking-[0.6px] text-muted">
            User Roles
          </h2>
          <ul>
            {ROLES.map((r) => {
              const active = r.key === selected;
              return (
                <li key={r.key}>
                  <button
                    type="button"
                    onClick={() => setSelected(r.key)}
                    aria-current={active ? "true" : undefined}
                    className={[
                      "flex w-full items-center gap-3 px-6 py-4 text-left transition-colors",
                      active
                        ? "border-r-[3px] border-brand bg-[#EFF6FF]"
                        : "hover:bg-mist",
                    ].join(" ")}
                  >
                    <IconChip tone={active ? "blue" : "slate"}>{r.glyph}</IconChip>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-bold leading-6 text-ink">
                        {r.name}
                      </span>
                      <span className="block text-xs leading-4 text-muted">
                        {r.blurb}
                      </span>
                    </span>
                    <ChevronIcon />
                  </button>
                </li>
              );
            })}
          </ul>
        </Panel>

        {/* ── permission matrix ─────────────────────────────── */}
        <Panel className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-6">
            <div className="flex items-center gap-3">
              <IconChip tone="blue">
                <LockGlyph />
              </IconChip>
              <div>
                <h2 className="text-lg font-bold leading-7 text-ink">
                  {role.name} Permissions
                </h2>
                <p className="text-sm leading-5 text-muted">
                  Configure core access levels for this role.
                </p>
              </div>
            </div>
            <Badge tone="slate">Read only view</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left">
              <thead>
                <tr className="border-y border-line-edge bg-mist">
                  {["Permission Scope", "Description", "Status"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.5px] text-muted"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS[selected].map((p) => (
                  <tr key={p.scope} className="border-b border-line-edge last:border-0">
                    <td className="px-6 py-4 align-top text-[15px] font-bold leading-6 text-ink">
                      {p.scope}
                    </td>
                    <td className="px-6 py-4 align-top text-sm leading-5 text-body">
                      {p.description}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <Toggle on={p.on} label={p.scope} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="flex items-center gap-2 border-t border-line-edge bg-[#F8FAFF] px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.4px] text-brand">
            <InfoIcon />
            Role permissions are managed via infrastructure as code
          </p>
        </Panel>
      </div>

      {/* ── roster ──────────────────────────────────────────── */}
      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6">
          <div className="flex items-center gap-3">
            <IconChip tone="purple">
              <PeopleGlyph />
            </IconChip>
            <div>
              <h2 className="text-lg font-bold leading-7 text-ink">
                Users with {role.name} Role
              </h2>
              <p className="text-sm leading-5 text-muted">
                Accounts currently authorised at this level.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg border border-line px-3 py-2 text-sm font-medium text-subtle hover:bg-mist"
          >
            Export List
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-y border-line-edge bg-mist">
                {["Team Member", "Email Address", "Status", "Actions"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-6 py-3 text-[11px] font-bold uppercase tracking-[0.5px] text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {people.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-sm text-muted">
                    {!supabase
                      ? NOT_CONFIGURED_NOTICE
                      : `No accounts hold the ${role.name} role yet.`}
                  </td>
                </tr>
              ) : (
                people.map((p) => (
                  <tr key={p.id} className="border-b border-line-edge last:border-0">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={p.full_name || p.email || "?"} className="size-9" />
                        <span className="text-[15px] font-bold leading-6 text-ink">
                          {p.full_name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-body">{p.email || "—"}</td>
                    <td className="px-6 py-4">
                      <Badge tone="green">Active</Badge>
                    </td>
                    <td className="px-6 py-4">
                      {p.role === "school_admin" ? (
                        <RevokeButton id={p.id} onDone={loadPeople} />
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="border-t border-line-edge px-6 py-4 text-sm text-muted">
          Showing {people.length} authorised {role.name.toLowerCase()}
          {people.length === 1 ? "" : "s"}
        </p>
      </Panel>

      {inviteOpen && (
        <GrantSchoolAdminDialog
          schools={schools}
          onClose={() => setInviteOpen(false)}
          onGranted={() => {
            setInviteOpen(false);
            setSelected("school_admin");
            loadPeople();
          }}
        />
      )}
    </>
  );
}

/* ── grant dialog ──────────────────────────────────────────── */

function GrantSchoolAdminDialog({
  schools,
  onClose,
  onGranted,
}: {
  schools: School[];
  onClose: () => void;
  onGranted: () => void;
}) {
  const [email, setEmail] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setNotice({ kind: "info", text: NOT_CONFIGURED_NOTICE });
      return;
    }
    setBusy(true);
    setNotice(null);

    const { error } = await supabase.rpc("grant_school_admin", {
      target_email: email.trim(),
      target_school: schoolId || null,
    });

    setBusy(false);
    if (error) {
      setNotice({ kind: "error", text: error.message });
      return;
    }
    onGranted();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="grant-title"
    >
      <div className="w-full max-w-[480px] rounded-xl bg-white p-6 shadow-card">
        <h2 id="grant-title" className="text-xl font-bold leading-7 text-ink">
          Grant school admin access
        </h2>
        <p className="mt-1 text-sm leading-5 text-body">
          The person needs a MiZanova account already. Ask them to sign up, then
          promote them here.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-subtle">Email address</span>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@school.edu.au"
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-subtle">
              School <span className="font-normal text-muted">(optional)</span>
            </span>
            <select
              value={schoolId}
              onChange={(e) => setSchoolId(e.target.value)}
              className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="">Don't attach to a school yet</option>
              {schools.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          {notice && (
            <p
              role="alert"
              className={[
                "rounded-lg px-3 py-2 text-sm",
                notice.kind === "error"
                  ? "bg-[#FEE2E2] text-[#B91C1C]"
                  : "bg-[#EFF6FF] text-brand",
              ].join(" ")}
            >
              {notice.text}
            </p>
          )}

          <div className="mt-1 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-subtle hover:bg-mist"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#245A94] disabled:opacity-60"
            >
              {busy ? "Granting…" : "Grant access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RevokeButton({ id, onDone }: { id: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        if (!supabase) return;
        setBusy(true);
        await supabase.rpc("revoke_school_admin", { target_id: id });
        setBusy(false);
        onDone();
      }}
      className="text-sm font-semibold text-[#B91C1C] hover:underline disabled:opacity-60"
    >
      {busy ? "Revoking…" : "Revoke"}
    </button>
  );
}

function Toggle({ on, label }: { on: boolean; label: string }) {
  return (
    <span
      role="img"
      aria-label={`${label}: ${on ? "enabled" : "disabled"}`}
      className={[
        "flex h-6 w-11 items-center rounded-full p-0.5 transition-colors",
        on ? "justify-end bg-brand" : "justify-start bg-line-strong",
      ].join(" ")}
    >
      <span className="size-5 rounded-full bg-white shadow-btn" />
    </span>
  );
}

/* ── glyphs ────────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-4">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CrownGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-5">
      <path d="M3 7.5 6.6 11 12 4.5 17.4 11 21 7.5V18H3V7.5Z" />
    </svg>
  );
}

function SchoolGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <path d="M3 9.5 12 4.5l9 5" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M5.5 11.5V19h13v-7.5M3 19h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FlaskGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <path d="M9.5 3.5v6L5 18.2A1.6 1.6 0 0 0 6.4 20.5h11.2A1.6 1.6 0 0 0 19 18.2l-4.5-8.7v-6" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 3.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ReceiptGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <path d="M5 3.5h14v17l-2.3-1.5-2.4 1.5-2.3-1.5-2.3 1.5L7.3 19 5 20.5v-17Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 8h7M8.5 12h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect x="4.5" y="10" width="15" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PeopleGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <circle cx="9" cy="8.5" r="3.4" />
      <circle cx="16.6" cy="9.6" r="2.5" />
      <path d="M2.5 19c0-3.2 2.9-5.2 6.5-5.2s6.5 2 6.5 5.2H2.5Z" />
      <path d="M17 13.9c2.6 0 4.5 1.4 4.5 3.7V19H17v-5.1Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-4 shrink-0 text-muted">
      <path d="m6 3.5 5 4.5-5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-4 shrink-0">
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7.2v4M8 5.1h.01" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
