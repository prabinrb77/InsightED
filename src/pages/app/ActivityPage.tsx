import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBehaviourLogs, getStudents } from "../../lib/educatorStore";

type Filter = "All" | "Low" | "Medium" | "High";

export default function ActivityPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const logs = getBehaviourLogs();
  const students = getStudents();
  const visible = useMemo(
    () => logs.filter((log) => filter === "All" || log.intensity === filter),
    [filter, logs],
  );

  function studentFor(id: string) {
    return students.find((student) => student.id === id);
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.5px] text-ink">
            Behaviour activity
          </h1>
          <p className="pt-1 text-[15px] leading-6 text-muted">
            Review classroom observations and support context.
          </p>
        </div>
        <Link
          to="/app/students"
          className="flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-[#255d99]"
        >
          Log new behaviour
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Filter activity by intensity">
        {(["All", "Low", "Medium", "High"] as const).map((value) => (
          <button
            key={value}
            role="tab"
            aria-selected={filter === value}
            onClick={() => setFilter(value)}
            className={[
              "rounded-lg px-4 py-2 text-sm font-semibold",
              filter === value
                ? "bg-brand text-white"
                : "border border-line bg-white text-muted hover:bg-mist",
            ].join(" ")}
          >
            {value}
          </button>
        ))}
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-line bg-white">
        {visible.length ? (
          <ol>
            {visible.map((log) => {
              const student = studentFor(log.studentId);
              return (
                <li key={log.id} className="flex flex-wrap gap-4 border-b border-line px-5 py-5 last:border-0 md:flex-nowrap">
                  <span
                    className={[
                      "mt-1 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      log.intensity === "High"
                        ? "bg-red-100 text-red-700"
                        : log.intensity === "Medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-teal-tint text-teal",
                    ].join(" ")}
                  >
                    {log.intensity.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {student ? (
                        <Link to={`/app/students/${student.id}`} className="font-bold text-ink hover:text-brand">
                          {student.full}
                        </Link>
                      ) : (
                        <span className="font-bold text-ink">Student</span>
                      )}
                      <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                        {log.intensity} intensity
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate">{log.behaviour}</p>
                    <p className="mt-1 text-sm text-muted">{log.context}</p>
                    {log.notes && <p className="mt-2 text-sm leading-6 text-body">{log.notes}</p>}
                  </div>
                  <time className="shrink-0 text-xs text-muted">
                    {new Date(log.createdAt).toLocaleString([], {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </time>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="px-6 py-16 text-center">
            <p className="font-bold text-ink">No activity in this view</p>
            <p className="mt-1 text-sm text-muted">
              Behaviour logs recorded from the dashboard or student directory will appear here.
            </p>
            <Link to="/app/students" className="mt-5 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white">
              Choose a student
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
