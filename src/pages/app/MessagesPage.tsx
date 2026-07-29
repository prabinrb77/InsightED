import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Avatar from "../../components/Avatar";
import useMessages, { MessageThread } from "../../hooks/useMessages";
import useSession from "../../hooks/useSession";

type Filter = "all" | "parent" | "staff";

function formatThreadTime(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMessageTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function unreadCount(thread: MessageThread, userId: string) {
  return thread.messages.filter(
    (message) =>
      message.senderId !== userId &&
      (!thread.lastReadAt || message.createdAt > thread.lastReadAt),
  ).length;
}

export default function MessagesPage() {
  const session = useSession();
  const {
    threads,
    loading,
    error,
    isDemo,
    sendMessage,
    markRead,
  } = useMessages(session);
  const userId = session?.user.id ?? "demo-educator";
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!attachment) {
      setAttachmentPreview(null);
      return;
    }
    const url = URL.createObjectURL(attachment);
    setAttachmentPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [attachment]);

  useEffect(() => {
    if (!activeId && threads[0]) setActiveId(threads[0].id);
    if (activeId && !threads.some((thread) => thread.id === activeId)) {
      setActiveId(threads[0]?.id ?? null);
    }
  }, [activeId, threads]);

  const active = threads.find((thread) => thread.id === activeId) ?? null;
  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return threads.filter(
      (thread) =>
        (filter === "all" || thread.role === filter) &&
        (!needle ||
          `${thread.name} ${thread.subject} ${thread.studentName}`
            .toLowerCase()
            .includes(needle)),
    );
  }, [filter, search, threads]);

  useEffect(() => {
    if (!active) return;
    void markRead(active.id);
  }, [active?.id, active?.messages.length, markRead]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [active?.messages.length]);

  async function handleSend(event?: FormEvent) {
    event?.preventDefault();
    if (!active || (!draft.trim() && !attachment) || sending) return;
    const message = draft;
    const image = attachment;
    setDraft("");
    setAttachment(null);
    setSending(true);
    const sent = await sendMessage(active.id, message, image);
    if (!sent) {
      setDraft(message);
      setAttachment(image);
    }
    setSending(false);
  }

  function handleComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-[580px] flex-col bg-white">
      <header className="flex shrink-0 flex-wrap items-center gap-3 border-b border-line px-5 py-4 md:px-6">
        <div>
          <h1 className="text-xl font-bold tracking-[-0.3px] text-ink">
            Secure communication
          </h1>
          <p className="mt-0.5 text-xs text-muted">
            Conversations are limited to people linked to the same student.
          </p>
        </div>
        <span className="ml-auto rounded-full bg-teal-tint px-3 py-1 text-[10px] font-bold uppercase tracking-[0.5px] text-teal">
          Private · role-based access
        </span>
      </header>

      {isDemo && (
        <div className="border-b border-[#FDE68A] bg-[#FFFBEB] px-5 py-2 text-xs text-[#92400E] md:px-6">
          Demo mode: messages are saved in this browser. Connect Supabase and
          sign in to sync conversations between real users.
        </div>
      )}
      {error && (
        <div role="alert" className="border-b border-red-200 bg-red-50 px-6 py-2 text-sm text-red-700">
          Messages could not sync: {error}
        </div>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[340px_minmax(0,1fr)]">
        <aside
          className={[
            "min-h-0 flex-col border-r border-line bg-white",
            showConversation ? "hidden md:flex" : "flex",
          ].join(" ")}
        >
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <h2 className="font-bold text-ink">Conversations</h2>
            <span className="text-xs text-muted">{threads.length} total</span>
          </div>

          <div className="mx-4 flex rounded-lg bg-mist p-1" role="tablist">
            {(["all", "parent", "staff"] as const).map((value) => (
              <button
                key={value}
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={[
                  "flex-1 rounded-md px-2 py-1.5 text-xs font-semibold capitalize transition",
                  filter === value
                    ? "bg-white text-ink shadow-btn"
                    : "text-muted hover:text-ink",
                ].join(" ")}
              >
                {value === "parent" ? "Parents" : value}
              </button>
            ))}
          </div>

          <label className="relative m-4">
            <span className="sr-only">Search conversations</span>
            <svg aria-hidden viewBox="0 0 20 20" fill="none" className="absolute left-3 top-3 size-4 text-footext">
              <circle cx="9" cy="9" r="5.5" stroke="currentColor" strokeWidth="1.6" />
              <path d="m13.5 13.5 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search people or students"
              className="h-10 w-full rounded-lg border border-line bg-mist pl-9 pr-3 text-sm text-ink placeholder:text-footext focus:border-brand focus:bg-white focus:outline-none"
            />
          </label>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              <p className="px-5 py-8 text-center text-sm text-muted">
                Loading conversations…
              </p>
            ) : visible.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold text-ink">No conversations found</p>
                <p className="mt-1 text-sm text-muted">
                  Try another search or filter.
                </p>
              </div>
            ) : (
              <ul>
                {visible.map((thread) => {
                  const last = thread.messages[thread.messages.length - 1];
                  const unread = unreadCount(thread, userId);
                  return (
                    <li key={thread.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveId(thread.id);
                          setShowConversation(true);
                        }}
                        className={[
                          "flex w-full gap-3 border-b border-line px-4 py-4 text-left transition-colors",
                          activeId === thread.id
                            ? "border-l-4 border-l-brand bg-[#EFF6FF] pl-3"
                            : "hover:bg-mist",
                        ].join(" ")}
                      >
                        <Avatar name={thread.name} className="size-10 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2">
                            <span className="truncate text-sm font-bold text-ink">
                              {thread.name}
                            </span>
                            <span className="ml-auto shrink-0 text-[11px] text-muted">
                              {formatThreadTime(last?.createdAt)}
                            </span>
                          </span>
                          <span className="block truncate text-xs font-medium text-slate">
                            {thread.studentName}
                          </span>
                          <span className="mt-0.5 flex items-center gap-2">
                            <span className="min-w-0 flex-1 truncate text-xs text-muted">
                              {last?.senderId === userId ? "You: " : ""}
                              {last?.body ?? "No messages yet"}
                            </span>
                            {unread > 0 && (
                              <span className="flex min-w-5 justify-center rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold text-white">
                                {unread}
                              </span>
                            )}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </aside>

        <section
          className={[
            "min-h-0 flex-col bg-white",
            showConversation ? "flex" : "hidden md:flex",
          ].join(" ")}
        >
          {!active ? (
            <div className="flex flex-1 items-center justify-center p-8 text-center">
              <div>
                <p className="font-semibold text-ink">Select a conversation</p>
                <p className="mt-1 text-sm text-muted">
                  Choose a linked parent or staff member to view messages.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex shrink-0 items-center gap-3 border-b border-line px-4 py-3 md:px-6">
                <button
                  type="button"
                  onClick={() => setShowConversation(false)}
                  className="rounded p-1 text-brand md:hidden"
                  aria-label="Back to conversations"
                >
                  ←
                </button>
                <Avatar name={active.name} className="size-9" />
                <div className="min-w-0">
                  <h2 className="truncate text-sm font-bold text-ink">{active.name}</h2>
                  <p className="truncate text-xs text-muted">
                    {active.studentName} · {active.subject}
                  </p>
                </div>
                <span className="ml-auto rounded-full bg-mist px-2.5 py-1 text-[10px] font-semibold capitalize text-muted">
                  {active.role}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto bg-mist px-4 py-5 md:px-8">
                <ol className="mx-auto flex max-w-3xl flex-col gap-4">
                  {active.messages.map((message) => {
                    const mine = message.senderId === userId;
                    return (
                      <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div className="max-w-[min(560px,85%)]">
                          <div
                            className={[
                              "overflow-hidden rounded-2xl text-sm leading-6",
                              mine
                                ? "rounded-br-md bg-brand text-white"
                                : "rounded-bl-md border border-line bg-white text-ink",
                              message.pending ? "opacity-70" : "",
                            ].join(" ")}
                          >
                            {message.attachmentUrl && (
                              <a
                                href={message.attachmentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block bg-white"
                              >
                                <img
                                  src={message.attachmentUrl}
                                  alt={message.attachmentName || "Shared photo"}
                                  className="max-h-80 w-full object-cover"
                                />
                              </a>
                            )}
                            {message.body && (
                              <p className="whitespace-pre-wrap break-words px-4 py-2.5">
                                {message.body}
                              </p>
                            )}
                          </div>
                          <p className={`mt-1 text-[11px] text-muted ${mine ? "text-right" : "text-left"}`}>
                            {formatMessageTime(message.createdAt)}
                            {message.pending ? " · Sending…" : mine ? " · Sent" : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
                <div ref={bottomRef} />
              </div>

              <form onSubmit={handleSend} className="shrink-0 border-t border-line bg-white px-4 py-4 md:px-6">
                {attachmentPreview && (
                  <div className="mx-auto mb-3 flex max-w-3xl items-center gap-3 rounded-xl border border-line bg-mist p-2">
                    <img src={attachmentPreview} alt="Photo ready to send" className="size-16 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">{attachment?.name}</p>
                      <p className="text-xs text-muted">Ready to send</p>
                    </div>
                    <button type="button" onClick={() => setAttachment(null)} className="flex size-9 items-center justify-center rounded-lg text-xl text-muted hover:bg-white" aria-label="Remove attached photo">
                      ×
                    </button>
                  </div>
                )}
                <div className="mx-auto flex max-w-3xl items-end gap-3">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      if (file && file.size > 5 * 1024 * 1024) {
                        event.target.value = "";
                        window.alert("Please choose an image smaller than 5 MB.");
                        return;
                      }
                      setAttachment(file);
                    }}
                  />
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-xl text-brand hover:bg-mist" aria-label="Attach a photo" title="Attach a photo">
                    📷
                  </button>
                  <label className="flex-1">
                    <span className="sr-only">Message</span>
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={handleComposerKeyDown}
                      rows={1}
                      maxLength={4000}
                      placeholder={`Message ${active.name}`}
                      className="max-h-32 min-h-12 w-full resize-none rounded-xl border border-line bg-mist px-4 py-3 text-sm text-ink placeholder:text-footext focus:border-brand focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </label>
                  <button
                    type="submit"
                    disabled={(!draft.trim() && !attachment) || sending}
                    className="flex h-12 shrink-0 items-center justify-center rounded-xl bg-brand px-5 text-sm font-semibold text-white transition hover:bg-[#255d99] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {sending ? "Sending…" : "Send"}
                  </button>
                </div>
                <p className="mx-auto mt-2 max-w-3xl text-[11px] text-muted">
                  Enter to send · Shift + Enter for a new line
                </p>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
