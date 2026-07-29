import { ReactNode } from "react";

/** Shared card/badge primitives for the super admin console (SU1, SU2, RBAC). */

export function Panel({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border border-line-edge bg-white shadow-card ${className}`}
    >
      {children}
    </section>
  );
}

const CHIP_TONES = {
  green: "bg-[#E8F5E9] text-[#15803D]",
  blue: "bg-[#EFF6FF] text-brand",
  purple: "bg-[#FAF5FF] text-[#7C3AED]",
  orange: "bg-[#FFF7ED] text-[#C2410C]",
  amber: "bg-[#FEF9C3] text-[#A16207]",
  red: "bg-[#FEE2E2] text-[#B91C1C]",
  slate: "bg-line-soft text-subtle",
} as const;

export type ChipTone = keyof typeof CHIP_TONES;

/** The 48px rounded icon chip that fronts every stat card. */
export function IconChip({
  tone = "blue",
  children,
}: {
  tone?: ChipTone;
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden
      className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${CHIP_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  tone = "blue",
  icon,
  foot,
}: {
  label: string;
  value: string;
  tone?: ChipTone;
  icon: ReactNode;
  foot?: ReactNode;
}) {
  return (
    <Panel className="flex items-start gap-4 p-6">
      <IconChip tone={tone}>{icon}</IconChip>
      <div className="min-w-0">
        <p className="text-[15px] leading-6 text-body">{label}</p>
        <p className="mt-0.5 text-[26px] font-bold leading-9 text-ink">{value}</p>
        {foot ? <div className="mt-1">{foot}</div> : null}
      </div>
    </Panel>
  );
}

const BADGE_TONES = {
  green: "bg-[#DCFCE7] text-[#15803D]",
  blue: "bg-[#EFF6FF] text-brand",
  purple: "bg-[#F3E8FF] text-[#7C3AED]",
  amber: "bg-[#FEF9C3] text-[#A16207]",
  red: "bg-[#FEE2E2] text-[#B91C1C]",
  slate: "bg-line-soft text-subtle",
} as const;

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.4px] ${BADGE_TONES[tone]}`}
    >
      {children}
    </span>
  );
}

/** Status pill with a leading dot — "Operational", "Optimal", "At Risk". */
export function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "amber" | "red";
  children: ReactNode;
}) {
  const styles = {
    green: "bg-[#DCFCE7] text-[#15803D]",
    amber: "bg-[#FEF3C7] text-[#B45309]",
    red: "bg-[#FEE2E2] text-[#B91C1C]",
  }[tone];
  const dot = { green: "bg-[#16A34A]", amber: "bg-[#F59E0B]", red: "bg-[#DC2626]" }[
    tone
  ];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${dot}`} />
      {children}
    </span>
  );
}

/** Licence-usage meter used in the tenant table. */
export function UsageBar({ used, total }: { used: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
  const maxed = pct >= 100;
  return (
    <div className="min-w-[150px]">
      <div className="flex items-baseline justify-between gap-3">
        <span
          className={`text-sm ${maxed ? "font-semibold text-[#B91C1C]" : "text-subtle"}`}
        >
          {used.toLocaleString()} / {total.toLocaleString()}
        </span>
        <span
          className={`text-[11px] font-bold ${maxed ? "text-[#B91C1C]" : "text-muted"}`}
        >
          {maxed ? "MAXED" : `${pct}%`}
        </span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${used} of ${total} licences used`}
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-line"
      >
        <div
          className={`h-full rounded-full ${maxed ? "bg-[#DC2626]" : "bg-[#10B981]"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Square tenant/​district monogram, tinted like Avatar but not a person. */
export function Monogram({
  label,
  tone = "blue",
}: {
  label: string;
  tone?: ChipTone;
}) {
  return (
    <span
      aria-hidden
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${CHIP_TONES[tone]}`}
    >
      {label}
    </span>
  );
}
