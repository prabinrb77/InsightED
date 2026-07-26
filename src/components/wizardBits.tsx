import { ButtonHTMLAttributes, ReactNode, useEffect, useState } from "react";

/** Shared building blocks for the multi-step sign-up wizards (Figma 186:*, 326:*). */

export const WIZARD_FIELD =
  "w-full rounded-lg border border-authline bg-white px-4 py-3.5 text-base text-ink placeholder:text-[#94A3B8] focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20";
export const WIZARD_LABEL = "text-sm font-semibold leading-5 text-[#334155]";

export function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;
  return score;
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex w-full max-w-[560px] flex-col gap-2 rounded-xl border border-authline bg-white p-8 drop-shadow-[0px_1px_1px_rgba(0,0,0,0.05)] md:p-12 ${className}`}
    >
      {children}
    </div>
  );
}

export function StepLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-[11px] font-bold uppercase leading-[16.5px] tracking-[1.1px] text-brand">
      {children}
    </p>
  );
}

export function Req() {
  return (
    <span aria-hidden className="text-red-500">
      *
    </span>
  );
}

export function Divider({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex items-center justify-center py-2">
      <span aria-hidden className="absolute inset-x-0 h-px bg-authline" />
      <span className="relative bg-white px-4 text-[11px] font-semibold uppercase tracking-[0.7px] text-authslate">
        {children}
      </span>
    </div>
  );
}

export function Consent({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex gap-3 text-[13px] leading-5 text-body">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded-sm border-[#767676] accent-brand"
      />
      <span>{children}</span>
    </label>
  );
}

export function PrimaryOutline({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="mt-2 w-full rounded-lg border-2 border-brand bg-white py-3.5 text-base font-bold text-brand transition-colors hover:bg-teal-tint disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
    </button>
  );
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
    >
      {children}
    </p>
  );
}

export function IconCircle({ children }: { children: ReactNode }) {
  return (
    <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-[#E6F0F0] text-brand">
      {children}
    </span>
  );
}

/** Counts down from the frame's starting value; purely presentational. */
export function Countdown({ seconds }: { seconds: number }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  const mm = Math.floor(left / 60);
  const ss = String(left % 60).padStart(2, "0");
  return (
    <p className="pt-3 text-xs leading-4 text-authslate">
      ⏱ Code expires in{" "}
      <span className="font-semibold text-ink">
        {mm}:{ss}
      </span>
    </p>
  );
}

export function Resend() {
  const [left, setLeft] = useState(60);
  useEffect(() => {
    const id = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="pt-4 text-sm leading-5 text-authslate">
      Didn't get the code?{" "}
      <button
        type="button"
        disabled={left > 0}
        onClick={() => setLeft(60)}
        className="font-medium text-brand disabled:text-footext"
      >
        {left > 0 ? `Resend code (${left}s)` : "Resend code"}
      </button>
    </p>
  );
}

/** The 4-stage approval tracker on the account-created screens. */
export function ApprovalTracker() {
  const stages = [
    { n: "✓", label: "Draft", sub: "Completed", state: "done" },
    { n: "2", label: "Submitted", sub: "← You are here", state: "current" },
    { n: "3", label: "Review", sub: "", state: "todo" },
    { n: "4", label: "Active", sub: "", state: "todo" },
  ];
  return (
    <ol className="flex items-start justify-between gap-2 pt-8">
      {stages.map((s) => (
        <li key={s.label} className="flex flex-1 flex-col items-center gap-1.5">
          <span
            className={[
              "flex size-8 items-center justify-center rounded-full text-sm font-bold",
              s.state === "done"
                ? "bg-brand text-white"
                : s.state === "current"
                  ? "border-2 border-brand bg-white text-brand"
                  : "bg-line-edge text-authslate",
            ].join(" ")}
          >
            {s.state === "current" ? "●" : s.n}
          </span>
          <span
            className={`text-xs font-semibold ${s.state === "todo" ? "text-authslate" : "text-brand"}`}
          >
            {s.label}
          </span>
          {s.sub && (
            <span className="text-[10px] uppercase leading-[15px] text-authslate">
              {s.sub}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}

/* The frames use Font Awesome glyphs here; rendered as inline SVGs. */

export function MailGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect
        x="2.5"
        y="5"
        width="19"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PhoneGlyph() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className="size-6">
      <rect
        x="6"
        y="2.5"
        width="12"
        height="19"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M11 18.5h2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
