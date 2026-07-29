import { Link, Navigate, useParams } from "react-router-dom";
import Avatar from "../../components/Avatar";
import { getStudents } from "../../lib/educatorStore";

/** Figma: node 1:1006 "Student Profile Page" */

const TIMELINE = [
  {
    level: "High intensity",
    tone: "high" as const,
    title: "Emotional Dysregulation during Math",
    body: "Student became visibly frustrated with multi-step division problems. Threw pencil and refused to continue work. Required 10-minute cool-down in the quiet zone.",
    when: "Oct 24, 2023 • 10:15 AM",
  },
  {
    level: "Medium intensity",
    tone: "medium" as const,
    title: "Social Interaction Conflict",
    body: "Verbal disagreement during group project. Difficulty with turn-taking. Student was able to de-escalate with verbal prompting from educator.",
    when: "Oct 22, 2023 • 01:45 PM",
  },
];

const NOTES = [
  {
    author: "Sarah Jenkins",
    role: "Lead Educator • Oct 25, 2023 at 04:30 PM",
    body: "Leo is showing improved resilience during visual arts but continues to struggle with abstract math concepts. We are implementing a visual timer strategy next week to help with task transitions.",
  },
  {
    author: "David Chen",
    role: "Special Education Coordinator • Oct 21, 2023 at 11:20 AM",
    body: "Observed Leo during lunch break. Social interactions are becoming more frequent. He initiated a game of tag with peers, which is a significant progress from last month.",
  },
];

const TONES = {
  high: {
    chip: "bg-[#FEE2E2] text-[#B91C1C]",
    icon: "bg-[#FEE2E2] text-[#DC2626]",
    glyph: "⚡",
  },
  medium: {
    chip: "bg-[#FEF3C7] text-[#B45309]",
    icon: "bg-[#FEF3C7] text-[#D97706]",
    glyph: "⚠",
  },
};

export default function StudentProfilePage() {
  const { id = "" } = useParams();
  const student = getStudents().find((item) => item.id === id);
  if (!student) return <Navigate to="/app/students" replace />;

  const strengths = ["Creative Problem Solving", "Visual Arts", "Math"];

  return (
    <div className="px-4 py-6 md:px-8">
      <nav aria-label="Breadcrumb" className="pb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <li>
            <Link to="/app" className="hover:text-brand">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link to="/app/students" className="hover:text-brand">
              Students
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="font-bold text-ink">{student.short}</li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        {/* ── Identity + attendance ──────────────────────────── */}
        <div className="flex flex-col gap-6">
          <section className="flex flex-col items-center rounded-xl border border-line bg-white p-6 text-center">
            <span className="relative">
              <Avatar name={student.full} className="size-[116px] text-3xl" />
              <span
                aria-hidden
                className="absolute bottom-1 right-1 size-6 rounded-full border-4 border-white bg-[#22C55E]"
              />
            </span>

            <h1 className="pt-4 text-2xl font-bold tracking-[-0.3px] text-ink">
              {student.short}
            </h1>
            <p className="text-[15px] text-muted">
              Student ID: {student.studentId}
            </p>

            <dl className="grid w-full grid-cols-2 gap-3 pt-5">
              <div className="rounded-lg bg-mist px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted">
                  Age
                </dt>
                <dd className="pt-1 text-lg font-bold text-ink">9 Years</dd>
              </div>
              <div className="rounded-lg bg-mist px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted">
                  Group
                </dt>
                <dd className="pt-1 text-lg font-bold text-ink">Class 3</dd>
              </div>
            </dl>

            <div className="w-full pt-6 text-left">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.6px] text-muted">
                Key strengths
              </h2>
              <ul className="flex flex-wrap gap-2 pt-3">
                {strengths.map((s) => (
                  <li
                    key={s}
                    className="rounded-md bg-[#EFF6FF] px-2.5 py-1 text-xs font-semibold text-brand"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/app/messages"
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand text-base font-bold text-white transition-colors hover:bg-[#255d99]"
            >
              <span aria-hidden>✉</span> Message Guardian
            </Link>
          </section>

          <section className="rounded-xl border border-line bg-white p-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.6px] text-ink">
              Attendance rate
            </h2>
            <AttendanceGauge value={student.attendance} />
          </section>
        </div>

        {/* ── Timeline + notes ───────────────────────────────── */}
        <div className="flex flex-col gap-6">
          <section className="rounded-xl border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
              <h2 className="text-lg font-bold tracking-[-0.2px] text-ink">
                Behavioral History Timeline
              </h2>
              <ul className="flex items-center gap-4 text-xs text-muted">
                <li className="flex items-center gap-1.5">
                  <span aria-hidden className="size-2 rounded-full bg-amber" />
                  Medium
                </li>
                <li className="flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="size-2 rounded-full bg-[#EF4444]"
                  />
                  High
                </li>
              </ul>
            </div>

            <ol className="flex flex-col gap-6 p-6">
              {TIMELINE.map((t) => {
                const tone = TONES[t.tone];
                return (
                  <li key={t.title} className="flex gap-4">
                    <span
                      aria-hidden
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${tone.icon}`}
                    >
                      {tone.glyph}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.5px] ${tone.chip}`}
                        >
                          {t.level}
                        </span>
                        <span className="text-xs text-muted">{t.when}</span>
                      </div>
                      <h3 className="pt-2 text-base font-bold leading-6 text-ink">
                        {t.title}
                      </h3>
                      <p className="pt-1 text-sm leading-6 text-body">
                        {t.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="px-6 pb-6">
              <button
                type="button"
                className="flex h-12 w-full items-center justify-center rounded-lg bg-mist text-sm font-semibold text-ink transition-colors hover:bg-line-soft"
              >
                View Full History
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
              <h2 className="text-lg font-bold tracking-[-0.2px] text-ink">
                Professional Observation Notes
              </h2>
              <button
                type="button"
                className="flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
              >
                <span aria-hidden>＋</span> Add Note
              </button>
            </div>

            <ul className="flex flex-col gap-4 p-6">
              {NOTES.map((n) => (
                <li key={n.author} className="rounded-lg bg-mist p-5">
                  <div className="flex items-center gap-3">
                    <Avatar name={n.author} className="size-9" />
                    <div>
                      <p className="text-sm font-bold leading-5 text-ink">
                        {n.author}
                      </p>
                      <p className="text-xs leading-4 text-muted">{n.role}</p>
                    </div>
                  </div>
                  <p className="pt-3 text-sm italic leading-6 text-body">
                    “{n.body}”
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

/** Semicircular attendance gauge from the frame. */
function AttendanceGauge({ value }: { value: number }) {
  const r = 92;
  const circumference = Math.PI * r;
  const filled = (value / 100) * circumference;

  return (
    <div className="relative mx-auto w-full max-w-[260px] pt-6">
      <svg viewBox="0 0 220 130" className="w-full" role="img" aria-label={`Attendance ${value}%`}>
        <path
          d="M18 118 A 92 92 0 0 1 202 118"
          fill="none"
          stroke="#F3F4F6"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M18 118 A 92 92 0 0 1 202 118"
          fill="none"
          stroke="#2B6CB0"
          strokeWidth="18"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
        />
        <text
          x="110"
          y="112"
          textAnchor="middle"
          className="fill-ink"
          style={{ fontSize: "46px", fontWeight: 400 }}
        >
          {value}
        </text>
      </svg>
      <div className="flex justify-between px-1 text-xs text-muted">
        <span>0</span>
        <span>100</span>
      </div>
    </div>
  );
}
