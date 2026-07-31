import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type View = "Day" | "Week" | "Month";
type Category = "Class" | "Support" | "Meeting" | "Personal";

type ScheduleEvent = {
  id: string;
  title: string;
  date: string;
  start: string;
  end: string;
  category: Category;
  student?: string;
  notes?: string;
  done: boolean;
};

const STORAGE_KEY = "mizanova-educator-schedule-v1";

function dateKey(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay() || 7;
  result.setDate(result.getDate() - day + 1);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(date: Date, amount: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function seedEvents(): ScheduleEvent[] {
  const today = dateKey(new Date());
  return [
    { id: "homeroom", title: "Morning Homeroom – Grade 4", date: today, start: "08:15", end: "08:45", category: "Class", done: true },
    { id: "math", title: "Math Workshop: Fractions", date: today, start: "09:00", end: "10:00", category: "Class", done: false },
    { id: "speech", title: "Speech Therapy", date: today, start: "10:00", end: "11:00", category: "Support", student: "Leo Marsh", done: false },
    { id: "iep", title: "IEP Review", date: today, start: "11:30", end: "12:15", category: "Meeting", student: "Maya Reid", done: false },
    { id: "reading", title: "Guided Reading: Group B", date: today, start: "13:00", end: "14:00", category: "Class", done: false },
  ];
}

function loadEvents() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as ScheduleEvent[]) : seedEvents();
  } catch {
    return seedEvents();
  }
}

const TONES: Record<Category, string> = {
  Class: "border-l-brand bg-[#EFF6FF]",
  Support: "border-l-[#7C3AED] bg-[#F5F3FF]",
  Meeting: "border-l-[#EA580C] bg-[#FFF7ED]",
  Personal: "border-l-slate-400 bg-mist",
};

export default function SchedulePage() {
  const [view, setView] = useState<View>("Day");
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [events, setEvents] = useState<ScheduleEvent[]>(loadEvents);
  const [showForm, setShowForm] = useState(false);

  function persist(next: ScheduleEvent[]) {
    setEvents(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  const visibleEvents = useMemo(() => {
    const selected = dateKey(selectedDate);
    const weekStart = startOfWeek(selectedDate);
    return events
      .filter((event) => {
        const eventDate = new Date(`${event.date}T12:00:00`);
        if (view === "Day") return event.date === selected;
        if (view === "Week") {
          return eventDate >= weekStart && eventDate < addDays(weekStart, 7);
        }
        return (
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      })
      .sort((a, b) => `${a.date}${a.start}`.localeCompare(`${b.date}${b.start}`));
  }, [events, selectedDate, view]);

  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleEvent[]>();
    visibleEvents.forEach((event) => {
      map.set(event.date, [...(map.get(event.date) ?? []), event]);
    });
    return [...map.entries()];
  }, [visibleEvents]);

  function move(direction: number) {
    const next = new Date(selectedDate);
    if (view === "Day") next.setDate(next.getDate() + direction);
    if (view === "Week") next.setDate(next.getDate() + direction * 7);
    if (view === "Month") next.setMonth(next.getMonth() + direction);
    setSelectedDate(next);
  }

  function toggleDone(id: string) {
    persist(events.map((event) => event.id === id ? { ...event, done: !event.done } : event));
  }

  function removeEvent(id: string) {
    persist(events.filter((event) => event.id !== id));
  }

  function addEvent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next: ScheduleEvent = {
      id: crypto.randomUUID(),
      title: String(form.get("title") ?? "").trim(),
      date: String(form.get("date")),
      start: String(form.get("start")),
      end: String(form.get("end")),
      category: String(form.get("category")) as Category,
      student: String(form.get("student") ?? "").trim() || undefined,
      notes: String(form.get("notes") ?? "").trim() || undefined,
      done: false,
    };
    if (!next.title || !next.date || !next.start || !next.end) return;
    persist([...events, next]);
    setSelectedDate(new Date(`${next.date}T12:00:00`));
    setShowForm(false);
  }

  const heading =
    view === "Month"
      ? selectedDate.toLocaleDateString([], { month: "long", year: "numeric" })
      : view === "Week"
        ? `Week of ${startOfWeek(selectedDate).toLocaleDateString([], { month: "short", day: "numeric" })}`
        : selectedDate.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const completed = visibleEvents.filter((event) => event.done).length;
  const students = new Set(visibleEvents.map((event) => event.student).filter(Boolean)).size;

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.5px] text-ink">Schedule</h1>
          <p className="pt-1 text-[15px] text-muted">{heading}</p>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="h-11 rounded-lg bg-brand px-5 text-sm font-semibold text-white hover:bg-[#255d99]">
          + Add event
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-white p-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => move(-1)} aria-label={`Previous ${view.toLowerCase()}`} className="size-9 rounded-lg border border-line text-xl text-ink hover:bg-mist">‹</button>
          <button type="button" onClick={() => setSelectedDate(new Date())} className="h-9 rounded-lg border border-line px-4 text-sm font-semibold text-brand hover:bg-mist">Today</button>
          <button type="button" onClick={() => move(1)} aria-label={`Next ${view.toLowerCase()}`} className="size-9 rounded-lg border border-line text-xl text-ink hover:bg-mist">›</button>
        </div>
        <div role="tablist" aria-label="Calendar range" className="flex rounded-lg bg-mist p-1">
          {(["Day", "Week", "Month"] as const).map((value) => (
            <button key={value} role="tab" aria-selected={view === value} onClick={() => setView(value)} className={`rounded-md px-4 py-1.5 text-sm font-semibold ${view === value ? "bg-white text-ink shadow-btn" : "text-muted"}`}>
              {value}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {grouped.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line bg-white px-6 py-16 text-center">
            <p className="font-semibold text-ink">Nothing scheduled</p>
            <p className="mt-1 text-sm text-muted">Add an event or move to another date.</p>
            <button type="button" onClick={() => setShowForm(true)} className="mt-4 text-sm font-semibold text-brand hover:underline">Add the first event</button>
          </div>
        ) : grouped.map(([date, dayEvents]) => (
          <section key={date} className="overflow-hidden rounded-xl border border-line bg-white">
            <h2 className="border-b border-line bg-mist px-5 py-3 text-sm font-bold text-ink">
              {new Date(`${date}T12:00:00`).toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })}
            </h2>
            <ol className="divide-y divide-line">
              {dayEvents.map((event) => (
                <li key={event.id} className={`flex flex-wrap items-center gap-4 border-l-4 px-5 py-4 ${TONES[event.category]}`}>
                  <button type="button" onClick={() => toggleDone(event.id)} aria-label={event.done ? "Mark incomplete" : "Mark complete"} className={`flex size-7 items-center justify-center rounded-full border-2 ${event.done ? "border-brand bg-brand text-white" : "border-line-strong bg-white"}`}>
                    {event.done ? "✓" : ""}
                  </button>
                  <div className="w-28 shrink-0">
                    <p className="text-sm font-bold text-ink">{event.start}</p>
                    <p className="text-xs text-muted">to {event.end}</p>
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <p className={`font-bold text-ink ${event.done ? "line-through opacity-60" : ""}`}>{event.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{event.category}{event.student ? ` · ${event.student}` : ""}</p>
                    {event.notes && <p className="mt-1 text-xs text-slate">{event.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    {event.student && <Link to="/app/messages" className="text-sm font-semibold text-brand hover:underline">Message</Link>}
                    <button type="button" onClick={() => removeEvent(event.id)} className="text-sm font-semibold text-red-600 hover:underline">Delete</button>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>

      <div className="grid gap-4 pt-6 sm:grid-cols-3">
        {[
          ["Events", `${visibleEvents.length} scheduled`],
          ["Students", `${students} linked`],
          ["Completed", `${completed} of ${visibleEvents.length}`],
        ].map(([label, value]) => (
          <article key={label} className="rounded-xl border border-line bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-[0.6px] text-muted">{label}</p>
            <p className="pt-1 text-xl font-bold text-ink">{value}</p>
          </article>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && setShowForm(false)}>
          <form onSubmit={addEvent} className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-ink">Add schedule event</h2>
              <button type="button" onClick={() => setShowForm(false)} aria-label="Close" className="text-2xl text-muted">×</button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2 text-sm font-semibold text-ink">Title<input name="title" required autoFocus className="mt-1 h-11 w-full rounded-lg border border-line px-3 font-normal" placeholder="e.g. Parent meeting" /></label>
              <label className="text-sm font-semibold text-ink">Date<input name="date" type="date" required defaultValue={dateKey(selectedDate)} className="mt-1 h-11 w-full rounded-lg border border-line px-3 font-normal" /></label>
              <label className="text-sm font-semibold text-ink">Category<select name="category" className="mt-1 h-11 w-full rounded-lg border border-line px-3 font-normal">{(["Class", "Support", "Meeting", "Personal"] as const).map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="text-sm font-semibold text-ink">Starts<input name="start" type="time" required defaultValue="09:00" className="mt-1 h-11 w-full rounded-lg border border-line px-3 font-normal" /></label>
              <label className="text-sm font-semibold text-ink">Ends<input name="end" type="time" required defaultValue="10:00" className="mt-1 h-11 w-full rounded-lg border border-line px-3 font-normal" /></label>
              <label className="sm:col-span-2 text-sm font-semibold text-ink">Student (optional)<input name="student" className="mt-1 h-11 w-full rounded-lg border border-line px-3 font-normal" placeholder="Student name" /></label>
              <label className="sm:col-span-2 text-sm font-semibold text-ink">Notes (optional)<textarea name="notes" rows={3} className="mt-1 w-full rounded-lg border border-line px-3 py-2 font-normal" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-lg border border-line px-4 text-sm font-semibold text-ink">Cancel</button>
              <button type="submit" className="h-10 rounded-lg bg-brand px-5 text-sm font-semibold text-white">Save event</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
