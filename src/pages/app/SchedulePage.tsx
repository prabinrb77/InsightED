import { useState } from "react";
import Avatar from "../../components/Avatar";

/** Figma: node 1:1478 "Refined Daily Schedule Page" */

const HOURS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
];

type Slot = {
  title: string;
  time: string;
  icon: string;
  tone: "blue" | "purple" | "amber" | "grey";
  done?: boolean;
  current?: boolean;
  student?: string;
  secondary?: string;
  action?: string;
};

const SLOTS: Slot[] = [
  {
    title: "Morning Homeroom - Grade 4",
    time: "8:15 AM - 8:45 AM",
    icon: "🗂",
    tone: "blue",
    done: true,
    action: "Quick Log",
  },
  {
    title: "Math Workshop: Fractions Part 1",
    time: "9:00 AM - 10:00 AM",
    icon: "🧮",
    tone: "blue",
    secondary: "View Lesson",
    action: "Quick Log",
  },
  {
    title: "Speech Therapy: Leo M.",
    time: "10:00 AM - 11:00 AM",
    icon: "",
    tone: "purple",
    current: true,
    student: "Leo Marsh",
    secondary: "View Student",
    action: "Quick Log",
  },
  {
    title: "IEP Review: Maya R.",
    time: "11:30 AM - 12:15 PM",
    icon: "👥",
    tone: "amber",
    secondary: "View Profile",
    action: "Log Meeting",
  },
  {
    title: "Lunch Break - 12:15 PM - 1:00 PM",
    time: "",
    icon: "🍴",
    tone: "grey",
  },
  {
    title: "Guided Reading: Group B",
    time: "1:00 PM - 2:00 PM",
    icon: "📖",
    tone: "blue",
    action: "Quick Log",
  },
];

const TONES = {
  blue: { bar: "bg-brand", bg: "bg-[#EFF6FF]", time: "text-brand" },
  purple: { bar: "bg-[#7C3AED]", bg: "bg-[#F5F3FF]", time: "text-[#7C3AED]" },
  amber: { bar: "bg-[#EA580C]", bg: "bg-[#FFF7ED]", time: "text-[#EA580C]" },
  grey: { bar: "bg-line-strong", bg: "bg-mist", time: "text-muted" },
};

const SUMMARY = [
  { label: "Scheduled Students", value: "12 Total", chip: "bg-[#DBEAFE]", icon: "👥" },
  { label: "Completed Sessions", value: "03 Logs Filed", chip: "bg-[#FEF3C7]", icon: "📋" },
  { label: "Upcoming Tasks", value: "04 Remaining", chip: "bg-[#FEE2E2]", icon: "🕘" },
];

export default function SchedulePage() {
  const [view, setView] = useState<"Day" | "Week" | "Month">("Day");

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.5px] text-ink">
            Today's Agenda
          </h1>
          <p className="pt-1 text-[15px] leading-6 text-muted">
            Monday, Oct 30, 2023
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            className="text-sm font-semibold text-brand hover:underline"
          >
            Jump to Now
          </button>
          <div
            role="tablist"
            aria-label="Calendar range"
            className="flex rounded-lg border border-line bg-mist p-1"
          >
            {(["Day", "Week", "Month"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={[
                  "rounded-md px-4 py-1.5 text-sm font-semibold transition-colors",
                  view === v
                    ? "bg-white text-ink shadow-btn"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
        <div className="grid grid-cols-[92px_minmax(0,1fr)]">
          {/* time rail */}
          <div className="border-r border-line bg-mist">
            {HOURS.map((h) => (
              <div
                key={h}
                className="relative flex h-[72px] items-start justify-end px-3 pt-2 text-xs text-muted"
              >
                {h === "10:00 AM" ? (
                  <span className="rounded bg-brand px-2 py-0.5 text-[11px] font-bold text-white">
                    10:18 AM
                  </span>
                ) : (
                  h
                )}
              </div>
            ))}
          </div>

          {/* events */}
          <ol className="flex flex-col gap-2 p-3">
            {SLOTS.map((s) => {
              const tone = TONES[s.tone];
              return (
                <li
                  key={s.title}
                  className={`flex items-center gap-3 overflow-hidden rounded-lg ${tone.bg}`}
                >
                  <span aria-hidden className={`h-full w-1 self-stretch ${tone.bar}`} />

                  {s.student ? (
                    <Avatar name={s.student} className="my-3 size-9" />
                  ) : (
                    <span
                      aria-hidden
                      className="my-3 flex size-9 items-center justify-center rounded-lg bg-white text-base"
                    >
                      {s.icon}
                    </span>
                  )}

                  <div className="min-w-0 flex-1 py-3">
                    <p className="flex items-center gap-1.5 text-sm font-bold leading-5 text-ink">
                      {s.title}
                      {s.done && (
                        <span aria-label="Completed" className="text-brand">
                          ✓
                        </span>
                      )}
                    </p>
                    {s.time && (
                      <p className={`text-xs leading-4 ${tone.time}`}>{s.time}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-3 pr-3">
                    {s.secondary && (
                      <button
                        type="button"
                        className="hidden text-sm font-medium text-brand hover:underline sm:block"
                      >
                        {s.secondary}
                      </button>
                    )}
                    {s.action && (
                      <button
                        type="button"
                        className={[
                          "flex h-9 items-center rounded-lg px-4 text-sm font-semibold transition-colors",
                          s.current
                            ? "bg-brand text-white hover:bg-[#255d99]"
                            : s.tone === "amber"
                              ? "border border-[#EA580C] bg-white text-[#EA580C] hover:bg-[#FFF7ED]"
                              : "border border-brand bg-white text-brand hover:bg-mist",
                        ].join(" ")}
                      >
                        {s.action}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <div className="grid gap-6 pt-6 md:grid-cols-3">
        {SUMMARY.map((s) => (
          <article
            key={s.label}
            className="flex items-center gap-4 rounded-xl border border-line bg-white p-5"
          >
            <span
              aria-hidden
              className={`flex size-11 items-center justify-center rounded-lg text-lg ${s.chip}`}
            >
              {s.icon}
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase leading-4 tracking-[0.6px] text-muted">
                {s.label}
              </p>
              <p className="pt-1 text-xl font-bold text-ink">{s.value}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
