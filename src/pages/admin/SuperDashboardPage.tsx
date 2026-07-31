import { useState } from "react";
import { PageHeading } from "../../components/SuperAdminLayout";
import {
  Badge,
  IconChip,
  Panel,
  StatCard,
  StatusPill,
} from "../../components/adminBits";

/** Figma: node 1:7565 "SU1-Global Command Center" */

const RANGES = ["30D", "90D", "1Y"] as const;
type Range = (typeof RANGES)[number];

/**
 * Placeholder series until the platform metrics endpoint exists. Shaped like
 * what the chart will eventually receive (one point per day) so swapping in
 * real data is a fetch, not a rewrite.
 */
const ADOPTION: Record<Range, number[]> = {
  "30D": [
    12.1, 12.0, 12.3, 12.2, 12.4, 12.6, 12.5, 13.1, 13.4, 13.3, 13.2, 13.5,
    13.6, 13.5, 13.8, 14.0, 14.2, 14.1, 14.0, 14.3, 14.6, 15.0, 15.4, 15.3,
    15.7, 16.1, 16.5, 16.9, 17.4, 17.9,
  ],
  "90D": [
    9.2, 9.8, 10.1, 10.6, 11.0, 11.4, 11.2, 11.8, 12.3, 12.1, 12.6, 13.0, 13.4,
    13.1, 13.9, 14.4, 14.2, 15.0, 15.6, 16.2, 16.0, 16.8, 17.3, 17.9,
  ],
  "1Y": [
    4.1, 5.0, 5.8, 6.4, 7.2, 8.1, 9.0, 10.2, 11.4, 12.9, 14.6, 17.9,
  ],
};

const AXIS_LABELS: Record<Range, string[]> = {
  "30D": ["OCT 1", "OCT 5", "OCT 10", "OCT 15", "OCT 20"],
  "90D": ["AUG", "SEP", "OCT", "NOV"],
  "1Y": ["Q1", "Q2", "Q3", "Q4"],
};

const ALERTS = [
  {
    title: "API Latency Spike",
    when: "4m ago",
    body: "Elevated response times detected in US-East region.",
    level: "CRITICAL" as const,
    tag: "US-East",
    tone: "red" as const,
  },
  {
    title: "Payment Failed",
    when: "1h ago",
    body: "Automated billing failed for District 12 renewal.",
    level: "WARNING" as const,
    tag: "Billing",
    tone: "amber" as const,
  },
  {
    title: "Scheduled Maintenance",
    when: "in 48 hrs",
    body: "Database optimization for EU cluster.",
    level: "INFO" as const,
    tag: "EU-West",
    tone: "slate" as const,
  },
];

export default function SuperDashboardPage() {
  const [range, setRange] = useState<Range>("30D");

  return (
    <>
      <PageHeading
        title="Global Command Center"
        subtitle="Real-time SaaS platform health and revenue operations."
      />

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Global System Status"
          value="99.99%"
          tone="green"
          icon={<ServerGlyph />}
          foot={
            <>
              <p className="text-xs leading-4 text-muted">Uptime trailing 30 days</p>
              <div className="mt-2">
                <StatusPill tone="green">Operational</StatusPill>
              </div>
            </>
          }
        />
        <StatCard
          label="Total Active Districts"
          value="142"
          tone="blue"
          icon={<BankGlyph />}
          foot={
            <p className="text-xs leading-4 text-muted">
              <span className="font-semibold text-[#15803D]">+3</span> new this month
            </p>
          }
        />
        <StatCard
          label="Monthly Recurring Rev"
          value="$2.4M"
          tone="purple"
          icon={<DollarGlyph />}
          foot={<Sparkline />}
        />
        <StatCard
          label="Global User Load"
          value="18,402"
          tone="orange"
          icon={<UsersGlyph />}
          foot={
            <p className="flex items-center gap-1.5 text-xs leading-4 text-muted">
              <span aria-hidden className="size-1.5 rounded-full bg-brand" />
              Active users right now
            </p>
          }
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.85fr)_minmax(0,1fr)]">
        <Panel className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold leading-7 text-ink">
                Platform Adoption
              </h2>
              <p className="text-sm leading-5 text-muted">
                Daily active users (trailing 30 days)
              </p>
            </div>
            <div
              role="group"
              aria-label="Chart range"
              className="flex rounded-lg border border-line bg-mist p-1"
            >
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  aria-pressed={range === r}
                  className={[
                    "rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    range === r
                      ? "bg-white text-ink shadow-btn"
                      : "text-muted hover:text-ink",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <AdoptionChart series={ADOPTION[range]} labels={AXIS_LABELS[range]} />
        </Panel>

        <Panel className="p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold leading-7 text-ink">
              System Alerts &amp; Triage
            </h2>
            <button
              type="button"
              className="text-sm font-semibold text-brand hover:underline"
            >
              View All
            </button>
          </div>

          <ul className="mt-4 flex flex-col gap-3">
            {ALERTS.map((a) => (
              <li
                key={a.title}
                className={[
                  "rounded-xl border p-4",
                  a.tone === "red"
                    ? "border-[#FECACA] bg-[#FEF2F2]"
                    : a.tone === "amber"
                      ? "border-[#FDE68A] bg-[#FFFBEB]"
                      : "border-line-edge bg-mist",
                ].join(" ")}
              >
                <div className="flex gap-3">
                  <IconChip
                    tone={a.tone === "slate" ? "slate" : a.tone}
                  >
                    {a.tone === "red" ? (
                      <WarningGlyph />
                    ) : a.tone === "amber" ? (
                      <CardGlyph />
                    ) : (
                      <WrenchGlyph />
                    )}
                  </IconChip>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-bold leading-5 text-ink">
                        {a.title}
                      </h3>
                      <span className="shrink-0 text-xs leading-4 text-muted">
                        {a.when}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-body">{a.body}</p>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <Badge
                        tone={
                          a.level === "CRITICAL"
                            ? "red"
                            : a.level === "WARNING"
                              ? "amber"
                              : "slate"
                        }
                      >
                        {a.level}
                      </Badge>
                      <span className="rounded-md border border-line px-2 py-0.5 text-[11px] font-medium text-subtle">
                        {a.tag}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

/**
 * Area chart drawn from the series rather than pasted as a static export, so it
 * responds to the range toggle and will keep working once real data lands.
 */
function AdoptionChart({
  series,
  labels,
}: {
  series: number[];
  labels: string[];
}) {
  const W = 640;
  const H = 300;
  const PAD_L = 34;
  const PAD_B = 22;
  const max = 18;
  const stepX = (W - PAD_L) / (series.length - 1);
  const y = (v: number) => H - PAD_B - (v / max) * (H - PAD_B - 8);
  const points = series.map((v, i) => [PAD_L + i * stepX, y(v)] as const);
  const line = points.map(([px, py]) => `${px},${py}`).join(" ");
  const area = `${PAD_L},${H - PAD_B} ${line} ${PAD_L + (series.length - 1) * stepX},${H - PAD_B}`;
  const ticks = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18];

  return (
    <figure className="mt-6">
      <figcaption className="sr-only">
        Daily active users, peaking at {Math.max(...series).toFixed(1)} thousand.
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="Platform adoption over time"
        className="h-[300px] w-full"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PAD_L}
              x2={W}
              y1={y(t)}
              y2={y(t)}
              stroke="#F3F4F6"
              strokeWidth="1"
            />
            <text
              x={PAD_L - 8}
              y={y(t) + 4}
              textAnchor="end"
              className="fill-[#9CA3AF] text-[10px]"
            >
              {t === 0 ? "0" : `${t}k`}
            </text>
          </g>
        ))}
        <polygon points={area} fill="#2563EB" fillOpacity="0.08" />
        <polyline
          points={line}
          fill="none"
          stroke="#2563EB"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {labels.map((l, i) => (
          <text
            key={l}
            x={PAD_L + ((W - PAD_L) / labels.length) * (i + 0.5)}
            y={H - 4}
            textAnchor="middle"
            className="fill-[#9CA3AF] text-[10px] tracking-wide"
          >
            {l}
          </text>
        ))}
      </svg>
    </figure>
  );
}

function Sparkline() {
  const bars = [5, 7, 9, 11, 10, 13, 20];
  return (
    <span aria-hidden className="flex h-6 items-end gap-1">
      {bars.map((h, i) => (
        <span
          key={i}
          style={{ height: `${(h / 20) * 100}%` }}
          className={`w-2 rounded-sm ${
            i === bars.length - 1 ? "bg-[#7C3AED]" : "bg-[#E9D5FF]"
          }`}
        />
      ))}
    </span>
  );
}

/* ── glyphs ────────────────────────────────────────────────── */

function ServerGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect x="3.5" y="4" width="17" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <rect x="3.5" y="14" width="17" height="6" rx="1.6" stroke="currentColor" strokeWidth="1.7" />
      <path d="M7 7h.01M7 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BankGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <path d="M3 9.5 12 4l9 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M5.5 11v7M10 11v7M14 11v7M18.5 11v7M3 20h18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function DollarGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M14.5 9.3c-.5-.9-1.4-1.4-2.5-1.4-1.5 0-2.5.8-2.5 2s1 1.7 2.5 2 2.7.8 2.7 2.1-1.1 2.1-2.7 2.1c-1.2 0-2.2-.5-2.7-1.5M12 6.4v11.2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UsersGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-6">
      <circle cx="9" cy="8.5" r="3.4" />
      <circle cx="16.6" cy="9.6" r="2.5" />
      <path d="M2.5 19c0-3.2 2.9-5.2 6.5-5.2s6.5 2 6.5 5.2H2.5Z" />
      <path d="M17 13.9c2.6 0 4.5 1.4 4.5 3.7V19H17v-5.1Z" />
    </svg>
  );
}

function WarningGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <path
        d="M12 4.5 21 19.5H3L12 4.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M12 10v4M12 16.6h.01" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function CardGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <rect x="2.8" y="5.5" width="18.4" height="13" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2.8 10h18.4M6.5 14.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function WrenchGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-5">
      <path
        d="M15.6 4.4a4.6 4.6 0 0 0-5.9 5.6L4 15.7 8.3 20l5.7-5.7a4.6 4.6 0 0 0 5.6-5.9l-2.7 2.7-2.6-.5-.5-2.6 2.8-2.6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
