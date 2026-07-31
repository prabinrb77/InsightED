import { useState } from "react";
import { Link } from "react-router-dom";
import BehaviourLogModal from "../../components/BehaviourLogModal";
import type { Student } from "../../data/students";
import { downloadStudentsCsv, getBehaviourLogs, getStudents } from "../../lib/educatorStore";

/** Figma: node 1:495 "Classroom Overview Dashboard" */

const STATS = [
  {
    label: "Total Students",
    value: "24",
    chip: "bg-[#DBEAFE] text-brand",
    icon: "👥",
    note: null,
    to: "/app/students",
  },
  {
    label: "Recent Logs",
    value: "05",
    chip: "bg-[#FEF3C7] text-amber",
    icon: "📋",
    note: "In the last 24 hours",
    to: "/app/activity",
  },
  {
    label: "Critical Alerts",
    value: "00",
    chip: "bg-[#FEE2E2] text-red-500",
    icon: "⚠️",
    note: "clear",
    to: "/app/activity",
  },
];

/** Sparkline path + palette per behaviour trend direction. */
const TRENDS: Record<string, { stroke: string; fill: string; d: string }> = {
  steady: {
    stroke: "#2B6CB0",
    fill: "rgba(43,108,176,0.08)",
    d: "M0 34 C 20 30, 34 16, 52 20 S 84 34, 104 22 S 140 8, 168 14 L 168 56 L 0 56 Z",
  },
  improving: {
    stroke: "#16A34A",
    fill: "rgba(22,163,74,0.08)",
    d: "M0 40 C 24 36, 40 28, 60 30 S 96 24, 120 14 S 150 8, 168 6 L 168 56 L 0 56 Z",
  },
  declining: {
    stroke: "#F59E0B",
    fill: "rgba(245,158,11,0.08)",
    d: "M0 12 C 28 14, 48 20, 72 24 S 116 32, 140 38 S 158 42, 168 46 L 168 56 L 0 56 Z",
  },
};

function Sparkline({ trend }: { trend: keyof typeof TRENDS }) {
  const t = TRENDS[trend];
  return (
    <svg
      aria-hidden
      viewBox="0 0 168 56"
      preserveAspectRatio="none"
      className="h-14 w-full"
    >
      <path d={t.d} fill={t.fill} />
      <path
        d={t.d.replace(/ L 168 56 L 0 56 Z$/, "")}
        fill="none"
        stroke={t.stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const [logging, setLogging] = useState<Student | null>(null);
  const [studentPage, setStudentPage] = useState(1);
  const students = getStudents();
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(students.length / pageSize));
  const activePage = Math.min(studentPage, pageCount);
  const pageStart = (activePage - 1) * pageSize;
  const visible = students.slice(pageStart, pageStart + pageSize);
  const recentLogs = getBehaviourLogs().filter(
    (log) => Date.now() - new Date(log.createdAt).getTime() < 86_400_000,
  ).length;
  const stats = STATS.map((stat) =>
    stat.label === "Total Students"
      ? { ...stat, value: String(students.length) }
      : stat.label === "Recent Logs"
        ? { ...stat, value: String(recentLogs).padStart(2, "0") }
        : stat,
  );

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.5px] text-ink">
            Classroom Overview
          </h1>
          <p className="pt-1 text-[15px] leading-6 text-muted">
            Grade 4 • Room 204 • Morning Session
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadStudentsCsv(students)}
          className="flex h-11 items-center gap-2 rounded-lg border border-line bg-white px-5 text-[15px] font-semibold text-ink transition-colors hover:bg-mist"
        >
          <span aria-hidden>⭳</span>
          Export Report
        </button>
      </div>

      <div className="grid gap-6 pt-6 md:grid-cols-3">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="flex items-start justify-between gap-4 rounded-xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-card"
          >
            <div>
              <p className="text-[11px] font-bold uppercase leading-4 tracking-[0.6px] text-muted">
                {s.label}
              </p>
              <p className="pt-2 text-4xl font-bold leading-10 text-ink">
                {s.value}
              </p>
              {s.note === "clear" ? (
                <p className="pt-2 text-xs font-medium text-[#16A34A]">
                  ✓ Clear
                </p>
              ) : (
                s.note && (
                  <p className="pt-2 text-xs text-muted">{s.note}</p>
                )
              )}
            </div>
            <span
              aria-hidden
              className={`flex size-11 items-center justify-center rounded-lg text-lg ${s.chip}`}
            >
              {s.icon}
            </span>
          </Link>
        ))}
      </div>

      <section className="pt-6" aria-labelledby="quick-actions-title">
        <h2 id="quick-actions-title" className="sr-only">Quick actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { to: "/app/students/new", title: "Add student", body: "Create a student profile", icon: "＋" },
            { to: "/app/messages", title: "Message family", body: "Continue a secure conversation", icon: "✉" },
            { to: "/app/schedule", title: "View today", body: "Open your classroom agenda", icon: "◷" },
            { to: "/app/activity", title: "Review logs", body: "See recent behaviour activity", icon: "↗" },
          ].map((action) => (
            <Link
              key={action.to}
              to={action.to}
              className="flex items-center gap-3 rounded-xl border border-line bg-white px-4 py-3 hover:border-brand/40 hover:bg-mist"
            >
              <span aria-hidden className="flex size-9 items-center justify-center rounded-lg bg-[#EFF6FF] font-bold text-brand">
                {action.icon}
              </span>
              <span>
                <span className="block text-sm font-bold text-ink">{action.title}</span>
                <span className="block text-xs text-muted">{action.body}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-10">
        <h2 className="text-xl font-bold tracking-[-0.3px] text-ink">
          Active Students
        </h2>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sort by:
          <select className="rounded-md border-0 bg-transparent font-semibold text-brand focus:outline-none">
            <option>First Name</option>
            <option>Last Name</option>
            <option>Recent activity</option>
          </select>
        </label>
      </div>

      <div className="grid gap-6 pt-5 sm:grid-cols-2 xl:grid-cols-4">
        {visible.map((s) => (
          <article
            key={s.id}
            className="flex flex-col rounded-xl border border-line bg-white p-5"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 text-center">
                <h3 className="text-base font-bold leading-6 text-ink">
                  <Link to={`/app/students/${s.id}`} className="hover:text-brand">
                    {s.short}
                  </Link>
                </h3>
                <p className="text-xs leading-4 text-muted">ID: #{s.code}</p>
              </div>
              <button
                type="button"
                aria-label={`More options for ${s.short}`}
                className="text-muted hover:text-ink"
              >
                ⋮
              </button>
            </div>

            <p className="pt-5 text-[10px] font-bold uppercase leading-4 tracking-[0.6px] text-muted">
              Behavior trend
            </p>
            <Sparkline trend={s.trend} />

            <button
              type="button"
              onClick={() => setLogging(s)}
              className="mt-4 flex h-10 items-center justify-center rounded-lg border border-line bg-white text-sm font-semibold text-ink transition-colors hover:bg-mist"
            >
              Log Behavior
            </button>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
        <p className="text-sm text-muted">
          Showing{" "}
          <strong className="font-bold text-ink">
            {students.length ? pageStart + 1 : 0}–{pageStart + visible.length}
          </strong>{" "}
          of{" "}
          <strong className="font-bold text-ink">{students.length}</strong> students
        </p>
        <nav aria-label="Student pages" className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous page"
            disabled={activePage === 1}
            onClick={() => setStudentPage((page) => Math.max(1, page - 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-white text-muted hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setStudentPage(page)}
              aria-current={page === activePage ? "page" : undefined}
              aria-label={`Student page ${page}`}
              className={[
                "flex size-9 items-center justify-center rounded-lg text-sm font-semibold",
                page === activePage
                  ? "bg-brand text-white"
                  : "border border-line bg-white text-ink hover:bg-mist",
              ].join(" ")}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            aria-label="Next page"
            disabled={activePage === pageCount}
            onClick={() => setStudentPage((page) => Math.min(pageCount, page + 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-white text-muted hover:bg-mist disabled:cursor-not-allowed disabled:opacity-40"
          >
            ›
          </button>
        </nav>
      </div>
      {logging && (
        <BehaviourLogModal
          student={logging}
          onClose={() => setLogging(null)}
        />
      )}
    </div>
  );
}
