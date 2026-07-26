import { FormEvent, useState } from "react";
import Avatar from "../../components/Avatar";

/** Figma: node 1:1797 "Messages Hub" */

const FILTERS = ["All", "Parents", "Staff"] as const;
type Filter = (typeof FILTERS)[number];

const THREADS = [
  {
    name: "Elena Rodriguez",
    kind: "Parents" as Filter,
    when: "14:20",
    preview: "Typing...",
    typing: true,
    online: true,
    unread: 0,
  },
  {
    name: "Marcus Thompson",
    kind: "Parents" as Filter,
    when: "Yesterday",
    preview: "The algebra resources were helpful.",
    typing: false,
    online: false,
    unread: 0,
  },
  {
    name: "Prof. Alice Chen",
    kind: "Staff" as Filter,
    when: "Yesterday",
    preview: "2 new messages",
    typing: false,
    online: true,
    unread: 2,
  },
  {
    name: "James Wilson",
    kind: "Parents" as Filter,
    when: "Monday",
    preview: "Regarding the upcoming field trip...",
    typing: false,
    online: false,
    unread: 0,
  },
];

const MESSAGES = [
  {
    from: "them" as const,
    body: "Hello Dr. Jenkins, I wanted to follow up on Mateo's progress with the new SMART goals we set last week.",
    at: "10:15 AM",
  },
  {
    from: "me" as const,
    body: "Hi Elena! Mateo is doing great. He's already completed the first two milestones for his algebra goal. I've uploaded the latest progress report to his portal.",
    at: "10:22 AM",
  },
  {
    from: "them" as const,
    body: "That's wonderful news! He seems much more confident. Could you also share the schedule for the extra tutoring sessions?",
    at: "10:45 AM",
  },
  {
    from: "me" as const,
    body: "Of course. I'm attaching the PDF schedule here for you. We have slots on Tuesdays and Thursdays at 3:30 PM.",
    at: "11:05 AM",
    file: { name: "Tutoring_Schedule_Q3.pdf", meta: "1.2 MB • PDF" },
  },
];

export default function MessagesPage() {
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState(THREADS[0].name);
  const [draft, setDraft] = useState("");
  const [sent, setSent] = useState<string[]>([]);

  const visible =
    filter === "All" ? THREADS : THREADS.filter((t) => t.kind === filter);

  function handleSend(e: FormEvent) {
    e.preventDefault();
    if (!draft.trim()) return;
    setSent((s) => [...s, draft.trim()]);
    setDraft("");
  }

  return (
    <div className="flex h-[calc(100vh-72px)] flex-col">
      {/* ── Title bar ────────────────────────────────────────── */}
      <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-6 py-4">
        <h1 className="text-xl font-bold tracking-[-0.3px] text-ink">
          Secure Communication
        </h1>
        <span className="flex items-center gap-1.5 rounded-full bg-teal-tint px-3 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-teal">
          <span aria-hidden>🔒</span> End-to-end encrypted
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)]">
        {/* ── Thread list ────────────────────────────────────── */}
        <aside className="flex min-h-0 flex-col border-r border-line bg-white">
          <div className="p-5 pb-3">
            <h2 className="text-base font-bold text-ink">Direct Messages</h2>
          </div>

          <div
            role="tablist"
            aria-label="Filter conversations"
            className="flex gap-1 px-4"
          >
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={[
                  "flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  filter === f
                    ? "bg-white text-ink shadow-btn ring-1 ring-line"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {f}
              </button>
            ))}
          </div>

          <label className="relative m-4 block">
            <span className="sr-only">Search conversations</span>
            <span
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-footext"
            >
              ⌕
            </span>
            <input
              placeholder="Search conversations..."
              className="h-10 w-full rounded-lg border border-line bg-mist pl-9 pr-3 text-center text-sm text-ink placeholder:text-footext focus:border-brand focus:bg-white focus:outline-none"
            />
          </label>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {visible.map((t) => (
              <li key={t.name}>
                <button
                  type="button"
                  onClick={() => setActive(t.name)}
                  className={[
                    "flex w-full items-start gap-3 border-b border-line px-4 py-4 text-left transition-colors",
                    active === t.name
                      ? "border-l-4 border-l-brand bg-[#EFF6FF] pl-3"
                      : "hover:bg-mist",
                  ].join(" ")}
                >
                  <span className="relative shrink-0">
                    <Avatar name={t.name} />
                    {t.online && (
                      <span
                        aria-hidden
                        className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-[#22C55E]"
                      />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-bold text-ink">
                        {t.name}
                      </span>
                      <span className="shrink-0 text-xs text-muted">
                        {t.when}
                      </span>
                    </span>
                    <span
                      className={`block truncate pt-0.5 text-xs ${
                        t.typing ? "font-medium text-brand" : "text-muted"
                      }`}
                    >
                      {t.preview}
                    </span>
                  </span>

                  {t.unread > 0 && (
                    <span
                      aria-label={`${t.unread} unread`}
                      className="mt-1 size-2 shrink-0 rounded-full bg-brand"
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ── Conversation ───────────────────────────────────── */}
        <section className="flex min-h-0 flex-col bg-white">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-6 py-3">
            <div>
              <h2 className="text-base font-bold text-ink">{active}</h2>
              <p className="flex items-center gap-1.5 text-xs text-[#16A34A]">
                <span aria-hidden className="size-1.5 rounded-full bg-[#22C55E]" />
                Online
              </p>
            </div>
            <div className="flex items-center gap-4 text-slate">
              <button type="button" aria-label="Start voice call">📞</button>
              <button type="button" aria-label="Start video call">🎥</button>
              <button type="button" aria-label="Conversation details">ℹ️</button>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto bg-mist px-6 py-5">
            <p className="flex justify-center pb-4">
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.6px] text-muted">
                Today
              </span>
            </p>

            <ol className="flex flex-col gap-4">
              {MESSAGES.map((m, i) => (
                <li
                  key={i}
                  className={m.from === "me" ? "flex justify-start" : "flex justify-end"}
                >
                  <div className="max-w-[560px]">
                    <div
                      className={[
                        "rounded-xl px-4 py-3 text-sm leading-6",
                        m.from === "me"
                          ? "bg-brand text-white"
                          : "border border-line bg-white text-ink",
                      ].join(" ")}
                    >
                      {m.body}

                      {m.file && (
                        <span className="mt-3 flex items-center gap-3 rounded-lg bg-white/15 p-3">
                          <span
                            aria-hidden
                            className="flex size-9 items-center justify-center rounded bg-white/20 text-xs font-bold"
                          >
                            PDF
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">
                              {m.file.name}
                            </span>
                            <span className="block text-xs opacity-80">
                              {m.file.meta}
                            </span>
                          </span>
                          <span aria-hidden>⭳</span>
                        </span>
                      )}
                    </div>
                    <p
                      className={`pt-1 text-[11px] text-muted ${
                        m.from === "me" ? "text-left" : "text-right"
                      }`}
                    >
                      {m.at} {m.from === "me" && <span aria-hidden>✓✓</span>}
                    </p>
                  </div>
                </li>
              ))}

              {sent.map((s, i) => (
                <li key={`sent-${i}`} className="flex justify-start">
                  <div className="max-w-[560px]">
                    <div className="rounded-xl bg-brand px-4 py-3 text-sm leading-6 text-white">
                      {s}
                    </div>
                    <p className="pt-1 text-[11px] text-muted">Just now</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <form
            onSubmit={handleSend}
            className="shrink-0 border-t border-line px-6 py-4"
          >
            <div className="flex items-center gap-3 pb-3">
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-md bg-[#EFF6FF] px-3 py-1.5 text-xs font-semibold text-brand"
              >
                ✨ Message Templates ⌄
              </button>
              <button type="button" aria-label="Attach a file" className="text-slate">
                📎
              </button>
              <button type="button" aria-label="Insert emoji" className="text-slate">
                🙂
              </button>
            </div>

            <div className="flex items-center gap-3">
              <label className="relative flex-1">
                <span className="sr-only">Message</span>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your message here..."
                  className="h-12 w-full rounded-lg border border-line bg-mist px-4 pr-11 text-sm text-ink placeholder:text-footext focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
                <span
                  aria-hidden
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate"
                >
                  🎙
                </span>
              </label>
              <button
                type="submit"
                aria-label="Send message"
                className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand text-white transition-colors hover:bg-[#255d99]"
              >
                ➤
              </button>
            </div>
          </form>

          <p className="shrink-0 border-t border-line px-6 py-3 text-center text-xs text-muted">
            All communications are logged and monitored for educational
            compliance.
          </p>
        </section>
      </div>
    </div>
  );
}
