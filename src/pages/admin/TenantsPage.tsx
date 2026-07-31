import { FormEvent, useEffect, useState } from "react";
import { PageHeading, useTopbarAction } from "../../components/SuperAdminLayout";
import {
  Badge,
  Monogram,
  Panel,
  StatCard,
  StatusPill,
  UsageBar,
} from "../../components/adminBits";
import { supabase, NOT_CONFIGURED_NOTICE } from "../../lib/supabase";

/** Figma: node 1:7857 "SU2-Tenant Management" */

type Tier = "ENTERPRISE" | "PRO" | "BASIC";

type District = {
  id: string;
  name: string;
  code: string;
  tier: Tier;
  used: number;
  seats: number;
  renewal: string;
  renewalNote: string;
  health: "Optimal" | "At Risk";
  expiring?: boolean;
};

/**
 * The commercial columns — tier, seat count, renewal date, health — have no
 * home in the schema yet; `schools` carries only identity and residency. Until
 * a subscriptions table exists these rows stand in for the Figma content, and
 * real schools are appended below them so the page reflects the actual tenant
 * list as it grows.
 */
const SEED: District[] = [
  {
    id: "seed-1",
    name: "Lincoln County Schools",
    code: "DIST-90210",
    tier: "ENTERPRISE",
    used: 8400,
    seats: 10000,
    renewal: "Dec 01, 2024",
    renewalNote: "Net 30",
    health: "Optimal",
  },
  {
    id: "seed-2",
    name: "District 4 Regional",
    code: "DIST-48821",
    tier: "PRO",
    used: 412,
    seats: 500,
    renewal: "Nov 15, 2024",
    renewalNote: "Auto-Renew",
    health: "Optimal",
  },
  {
    id: "seed-3",
    name: "Westside Unified",
    code: "DIST-11029",
    tier: "BASIC",
    used: 2000,
    seats: 2000,
    renewal: "Oct 30, 2024",
    renewalNote: "Expires in 12 days",
    health: "At Risk",
    expiring: true,
  },
];

const TIER_TONE: Record<Tier, "purple" | "blue" | "slate"> = {
  ENTERPRISE: "purple",
  PRO: "blue",
  BASIC: "slate",
};

const MONO_TONE = ["blue", "purple", "orange", "green", "amber"] as const;

export default function TenantsPage() {
  const [live, setLive] = useState<District[]>([]);
  const [provisionOpen, setProvisionOpen] = useState(false);

  useTopbarAction(
    <button
      type="button"
      onClick={() => setProvisionOpen(true)}
      className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#245A94] sm:px-4"
    >
      <PlusIcon />
      {/* The label is the first thing to go when the bar is tight, but the
          action itself must stay reachable — it's the only way to add a
          district. */}
      <span className="hidden sm:inline">Provision New District</span>
      <span className="sr-only sm:hidden">Provision New District</span>
    </button>,
  );

  async function loadSchools() {
    if (!supabase) return;
    const { data } = await supabase
      .from("schools")
      .select("id, name, created_at")
      .order("created_at", { ascending: false })
      .limit(25);
    if (data) {
      setLive(
        data.map((s) => ({
          id: s.id,
          name: s.name,
          code: `DIST-${s.id.slice(0, 5).toUpperCase()}`,
          tier: "PRO" as Tier,
          used: 0,
          seats: 500,
          renewal: "—",
          renewalNote: `Onboarded ${new Date(s.created_at).toLocaleDateString()}`,
          health: "Optimal" as const,
        })),
      );
    }
  }

  useEffect(() => {
    loadSchools();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = [...SEED, ...live];

  return (
    <>
      <PageHeading
        title="Tenant Management"
        subtitle="Manage school district subscriptions and platform access."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          label="Total Seats Allocated"
          value="850,000"
          tone="blue"
          icon={<SeatsGlyph />}
          foot={
            <p className="text-xs font-semibold leading-4 text-[#15803D]">
              ↑ 12% vs last month
            </p>
          }
        />
        <StatCard
          label="Enterprise Tier Districts"
          value="45"
          tone="green"
          icon={<AwardGlyph />}
          foot={<p className="text-xs leading-4 text-muted">Across 12 regions</p>}
        />
        <StatCard
          label="At-Risk Renewals"
          value="3"
          tone="amber"
          icon={<AlertGlyph />}
          foot={
            <p className="text-xs leading-4 text-muted">Expiring within 30 days</p>
          }
        />
      </div>

      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
          <h2 className="text-lg font-bold leading-7 text-ink">Active Districts</h2>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-subtle hover:bg-mist"
            >
              <FilterIcon />
              Filter
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-medium text-subtle hover:bg-mist"
            >
              <ExportIcon />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead>
              <tr className="border-y border-line-edge bg-mist">
                {[
                  "District Name",
                  "Tier",
                  "Licenses Used",
                  "Renewal Date",
                  "Health Score",
                  "Actions",
                ].map((h) => (
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
              {rows.map((d, i) => (
                <tr key={d.id} className="border-b border-line-edge last:border-0">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Monogram
                        label={initials(d.name)}
                        tone={MONO_TONE[i % MONO_TONE.length]}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-bold leading-6 text-ink">
                          {d.name}
                        </p>
                        <p className="text-xs leading-4 text-muted">ID: {d.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={TIER_TONE[d.tier]}>{d.tier}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <UsageBar used={d.used} total={d.seats} />
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={`text-sm font-semibold leading-5 ${
                        d.expiring ? "text-[#B45309]" : "text-ink"
                      }`}
                    >
                      {d.renewal}
                    </p>
                    <p
                      className={`text-xs leading-4 ${
                        d.expiring ? "text-[#B45309]" : "text-muted"
                      }`}
                    >
                      {d.renewalNote}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill tone={d.health === "Optimal" ? "green" : "amber"}>
                      {d.health}
                    </StatusPill>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      aria-label={`Actions for ${d.name}`}
                      className="rounded-md p-1.5 text-muted hover:bg-mist hover:text-ink"
                    >
                      <DotsIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-edge px-6 py-4">
          <p className="text-sm leading-5 text-muted">
            Showing 1 to {rows.length} of {rows.length} districts
          </p>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <PageBtn label="Previous">‹</PageBtn>
            <PageBtn current>1</PageBtn>
            <PageBtn>2</PageBtn>
            <PageBtn>3</PageBtn>
            <PageBtn label="Next">›</PageBtn>
          </nav>
        </div>
      </Panel>

      {provisionOpen && (
        <ProvisionDistrictDialog
          onClose={() => setProvisionOpen(false)}
          onCreated={() => {
            setProvisionOpen(false);
            loadSchools();
          }}
        />
      )}
    </>
  );
}

/* ── provision a district ──────────────────────────────────── */

/**
 * Writes a real `schools` row. Gated by the schools_admin_insert policy from
 * migration 0002, so a non-super_admin gets a permission error from Postgres
 * rather than a silent no-op.
 */
function ProvisionDistrictDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("Australia");
  const [residency, setResidency] = useState("AWS Sydney");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError(NOT_CONFIGURED_NOTICE);
      return;
    }
    setBusy(true);
    setError(null);

    const { error: insertError } = await supabase.from("schools").insert({
      name: name.trim(),
      country,
      data_residency: residency,
    });

    setBusy(false);
    if (insertError) {
      setError(
        /row-level security/i.test(insertError.message)
          ? "Your account isn't allowed to create districts. Super admin access is required."
          : insertError.message,
      );
      return;
    }
    onCreated();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="provision-title"
    >
      <div className="w-full max-w-[480px] rounded-xl bg-white p-6 shadow-card">
        <h2 id="provision-title" className="text-xl font-bold leading-7 text-ink">
          Provision a new district
        </h2>
        <p className="mt-1 text-sm leading-5 text-body">
          Creates the school record. You can attach a school admin to it from
          Settings once the person has an account.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-subtle">District name</span>
            <input
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Lincoln County Schools"
              className="h-11 rounded-lg border border-line px-3 text-sm text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-subtle">Country</span>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-11 rounded-lg border border-line px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-subtle">Data residency</span>
              <select
                value={residency}
                onChange={(e) => setResidency(e.target.value)}
                className="h-11 rounded-lg border border-line bg-white px-3 text-sm text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              >
                <option>AWS Sydney</option>
                <option>AWS Melbourne</option>
                <option>AWS Singapore</option>
              </select>
            </label>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]"
            >
              {error}
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
              {busy ? "Creating…" : "Create district"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function PageBtn({
  children,
  current,
  label,
}: {
  children: React.ReactNode;
  current?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-current={current ? "page" : undefined}
      className={[
        "flex size-8 items-center justify-center rounded-md border text-sm font-medium",
        current
          ? "border-brand bg-brand text-white"
          : "border-line text-subtle hover:bg-mist",
      ].join(" ")}
    >
      {children}
    </button>
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

function SeatsGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect x="5" y="3.5" width="14" height="17" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9 3.5h6v2.5H9z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m9 13 2 2 4-4" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AwardGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <circle cx="12" cy="9" r="5" stroke="currentColor" strokeWidth="1.7" />
      <path d="m8.6 13.4-1.3 7 4.7-2.6 4.7 2.6-1.3-7" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function AlertGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 7.5v5M12 15.6h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-4">
      <path d="M2 3.5h12L9.5 8.6v4.4l-3 1.5V8.6L2 3.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="none" className="size-4">
      <path d="M8 2v8m0 0L5 7m3 3 3-3M2.5 12.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DotsIcon() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" fill="currentColor" className="size-4">
      <circle cx="8" cy="3" r="1.4" />
      <circle cx="8" cy="8" r="1.4" />
      <circle cx="8" cy="13" r="1.4" />
    </svg>
  );
}
