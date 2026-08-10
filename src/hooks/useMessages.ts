import { useCallback, useEffect, useMemo, useState } from "react";
import type { RealtimeChannel, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

export type MessageItem = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  pending?: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentMime?: string;
  attachmentSize?: number;
};

export type MessageThread = {
  id: string;
  name: string;
  role: "parent" | "staff";
  subject: string;
  studentName: string;
  messages: MessageItem[];
  lastReadAt: string | null;
};

type StoreState = {
  threads: MessageThread[];
  loading: boolean;
  error: string | null;
  isDemo: boolean;
  sendMessage: (
    conversationId: string,
    body: string,
    attachment?: File | null,
  ) => Promise<boolean>;
  markRead: (conversationId: string) => Promise<void>;
};

const DEMO_USER_ID = "demo-educator";
const STORAGE_KEY = "mizanova-message-demo-v2";
const IMAGE_MARKER = /\n?\[\[image:(.*?)\|(.*?)\]\]$/;

function unpackBody(raw: string) {
  const match = raw.match(IMAGE_MARKER);
  return {
    body: raw.replace(IMAGE_MARKER, "").trim(),
    attachmentUrl: match?.[1],
    attachmentName: match?.[2],
  };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const DEMO_THREADS: MessageThread[] = [
  {
    id: "mateo-family",
    name: "Elena Rodriguez",
    role: "parent",
    subject: "Mateo's learning support",
    studentName: "Mateo Rodriguez",
    lastReadAt: new Date().toISOString(),
    messages: [
      {
        id: "m1",
        senderId: "elena",
        body: "Hello Sarah, I wanted to follow up on Mateo's progress with the new SMART goals we set last week.",
        createdAt: "2026-07-28T00:15:00.000Z",
      },
      {
        id: "m2",
        senderId: DEMO_USER_ID,
        body: "Hi Elena! Mateo is doing well. He has completed the first two milestones for his algebra goal.",
        createdAt: "2026-07-28T00:22:00.000Z",
      },
      {
        id: "m3",
        senderId: "elena",
        body: "That's wonderful news. Could you also share the schedule for the extra tutoring sessions?",
        createdAt: "2026-07-28T00:45:00.000Z",
      },
    ],
  },
  {
    id: "thompson-family",
    name: "Marcus Thompson",
    role: "parent",
    subject: "Algebra resources",
    studentName: "Ava Thompson",
    lastReadAt: "2026-07-27T08:00:00.000Z",
    messages: [
      {
        id: "m4",
        senderId: "marcus",
        body: "The algebra resources were helpful. Ava completed the first worksheet independently.",
        createdAt: "2026-07-27T09:30:00.000Z",
      },
    ],
  },
  {
    id: "support-team",
    name: "Prof. Alice Chen",
    role: "staff",
    subject: "Learning support review",
    studentName: "Maya Reid",
    lastReadAt: null,
    messages: [
      {
        id: "m5",
        senderId: "alice",
        body: "I reviewed Maya's latest observations and added two strategy recommendations.",
        createdAt: "2026-07-27T05:10:00.000Z",
      },
      {
        id: "m6",
        senderId: "alice",
        body: "Could we discuss them before Thursday's support meeting?",
        createdAt: "2026-07-27T05:12:00.000Z",
      },
    ],
  },
];

function loadDemoThreads() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as MessageThread[]) : DEMO_THREADS;
  } catch {
    return DEMO_THREADS;
  }
}

function latestTime(thread: MessageThread) {
  return thread.messages[thread.messages.length - 1]?.createdAt ?? "";
}

export default function useMessages(session: Session | null): StoreState {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isDemo = !supabase || !session;
  const userId = session?.user.id ?? DEMO_USER_ID;

  const loadRemote = useCallback(async () => {
    if (!supabase || !session) return;
    setLoading(true);
    setError(null);

    const { data: mine, error: mineError } = await supabase
      .from("conversation_participants")
      .select("conversation_id,last_read_at")
      .eq("profile_id", session.user.id);

    if (mineError) {
      setError(mineError.message);
      setLoading(false);
      return;
    }

    const ids = (mine ?? []).map((row) => row.conversation_id as string);
    if (!ids.length) {
      setThreads([]);
      setLoading(false);
      return;
    }

    const [conversationResult, participantResult, messageResult] =
      await Promise.all([
        supabase
          .from("conversations")
          .select("id,subject,student_id,students(first_name,last_name)")
          .in("id", ids),
        supabase
          .from("conversation_participants")
          .select("conversation_id,profile_id,profiles(full_name,role)")
          .in("conversation_id", ids),
        supabase
          .from("messages")
          .select("id,conversation_id,sender_id,body,created_at,attachment_path,attachment_name,attachment_mime,attachment_size")
          .in("conversation_id", ids)
          .is("deleted_at", null)
          .order("created_at", { ascending: true }),
      ]);

    const remoteError =
      conversationResult.error ?? participantResult.error ?? messageResult.error;
    if (remoteError) {
      setError(remoteError.message);
      setLoading(false);
      return;
    }

    const readMap = new Map(
      (mine ?? []).map((row) => [
        row.conversation_id as string,
        row.last_read_at as string | null,
      ]),
    );
    const participants = participantResult.data ?? [];
    const messages = await Promise.all((messageResult.data ?? []).map(async (message) => {
      if (!message.attachment_path) return { ...message, signed_url: undefined as string | undefined };
      const { data } = await supabase!.storage.from("message-attachments").createSignedUrl(message.attachment_path as string, 600);
      return { ...message, signed_url: data?.signedUrl };
    }));

    const next = (conversationResult.data ?? []).map((conversation) => {
      const other = participants.find(
        (participant) =>
          participant.conversation_id === conversation.id &&
          participant.profile_id !== session.user.id,
      );
      const profile = other?.profiles as unknown as {
        full_name: string | null;
        role: string;
      } | null;
      const student = conversation.students as unknown as {
        first_name: string;
        last_name: string;
      } | null;

      return {
        id: conversation.id as string,
        name: profile?.full_name || "Support team member",
        role: profile?.role === "parent" ? ("parent" as const) : ("staff" as const),
        subject: (conversation.subject as string | null) || "Student support",
        studentName: student
          ? `${student.first_name} ${student.last_name}`
          : "Linked student",
        lastReadAt: readMap.get(conversation.id as string) ?? null,
        messages: messages
          .filter((message) => message.conversation_id === conversation.id)
          .map((message) => {
            const content = unpackBody((message.body as string | null) ?? "");
            return {
              id: message.id as string,
              ...content,
              senderId: message.sender_id as string,
              createdAt: message.created_at as string,
              attachmentUrl: (message.signed_url as string | undefined) ?? content.attachmentUrl,
              attachmentName: (message.attachment_name as string | undefined) ?? content.attachmentName,
              attachmentMime: message.attachment_mime as string | undefined,
              attachmentSize: message.attachment_size as number | undefined,
            };
          }),
      };
    });

    setThreads(next.sort((a, b) => latestTime(b).localeCompare(latestTime(a))));
    setLoading(false);
  }, [session]);

  useEffect(() => {
    if (isDemo) {
      setThreads(loadDemoThreads());
      setLoading(false);
      setError(null);
      return;
    }
    void loadRemote();
  }, [isDemo, loadRemote]);

  useEffect(() => {
    if (!supabase || !session) return;
    const client = supabase;
    let channel: RealtimeChannel | null = client
      .channel(`messages:${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => void loadRemote(),
      )
      .subscribe();
    return () => {
      if (channel) void client.removeChannel(channel);
      channel = null;
    };
  }, [loadRemote, session]);

  const sendMessage = useCallback(
    async (
      conversationId: string,
      rawBody: string,
      attachment?: File | null,
    ) => {
      const body = rawBody.trim();
      if (!body && !attachment) return false;
      let attachmentUrl: string | undefined;
      let attachmentName: string | undefined;
      let attachmentPath: string | undefined;

      if (attachment) {
        attachmentName = attachment.name;
        if (isDemo) {
          attachmentUrl = await fileToDataUrl(attachment);
        } else {
          const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "-");
          const path = `${conversationId}/${crypto.randomUUID()}-${safeName}`;
          attachmentPath = path;
          const { error: uploadError } = await supabase!.storage
            .from("message-attachments")
            .upload(path, attachment, { contentType: attachment.type });
          if (uploadError) {
            setError(`Image upload failed: ${uploadError.message}`);
            return false;
          }
          const { data: signed, error: signedError } = await supabase!.storage
            .from("message-attachments")
            .createSignedUrl(path, 60 * 60 * 24 * 365);
          if (signedError) {
            setError(`Image link failed: ${signedError.message}`);
            return false;
          }
          attachmentUrl = signed.signedUrl;
        }
      }

      const optimistic: MessageItem = {
        id: `pending-${Date.now()}`,
        senderId: userId,
        body,
        createdAt: new Date().toISOString(),
        pending: !isDemo,
        attachmentUrl,
        attachmentName,
      };
      setThreads((current) =>
        current.map((thread) =>
          thread.id === conversationId
            ? { ...thread, messages: [...thread.messages, optimistic] }
            : thread,
        ),
      );

      if (isDemo) {
        setThreads((current) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          return current;
        });
        return true;
      }

      const { error: sendError } = await supabase!.from("messages").insert({
        conversation_id: conversationId,
        sender_id: userId,
        body: body || null,
        attachment_path: attachmentPath,
        attachment_name: attachmentName,
        attachment_mime: attachment?.type || null,
        attachment_size: attachment?.size || null,
      });
      if (sendError) {
        setThreads((current) =>
          current.map((thread) =>
            thread.id === conversationId
              ? {
                  ...thread,
                  messages: thread.messages.filter(
                    (message) => message.id !== optimistic.id,
                  ),
                }
              : thread,
          ),
        );
        setError(sendError.message);
        return false;
      }
      await loadRemote();
      return true;
    },
    [isDemo, loadRemote, userId],
  );

  const markRead = useCallback(
    async (conversationId: string) => {
      const readAt = new Date().toISOString();
      setThreads((current) =>
        current.map((thread) =>
          thread.id === conversationId
            ? { ...thread, lastReadAt: readAt }
            : thread,
        ),
      );
      if (isDemo) {
        setThreads((current) => {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
          return current;
        });
        return;
      }
      await supabase!
        .from("conversation_participants")
        .update({ last_read_at: readAt })
        .eq("conversation_id", conversationId)
        .eq("profile_id", userId);
    },
    [isDemo, userId],
  );

  return useMemo(
    () => ({
      threads,
      loading,
      error,
      isDemo,
      sendMessage,
      markRead,
    }),
    [error, isDemo, loading, markRead, sendMessage, threads],
  );
}
