import { FormEvent, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import SocialAuthButtons from "../components/SocialAuthButtons";
import {
  supabase,
  authRedirectUrl,
  NOT_CONFIGURED_NOTICE,
} from "../lib/supabase";

/**
 * Step 2 of sign-up, reached from the choose-path screen (Figma 186:1103).
 * The role-specific multi-step flows in Figma (invite codes, school lookup,
 * specialist verification) aren't built yet — this collects the essentials and
 * records the chosen role on the account.
 */

const ROLE_COPY: Record<string, { label: string; blurb: string }> = {
  teacher: {
    label: "Teacher",
    blurb: "Join your school's InsightED account.",
  },
  parent: {
    label: "Parent",
    blurb: "Set up support for your child.",
  },
  specialist: {
    label: "Specialist",
    blurb: "Support students and families across schools.",
  },
};

type Notice = { kind: "info" | "error" | "success"; text: string };

export default function SignupFormPage() {
  const { role = "" } = useParams();
  const copy = ROLE_COPY[role];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  if (!copy) return <Navigate to="/signup" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setNotice({ kind: "info", text: NOT_CONFIGURED_NOTICE });
      return;
    }
    setBusy(true);
    setNotice(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Stored on the user's profile (auth.users.raw_user_meta_data)
        data: { full_name: name, role },
        emailRedirectTo: authRedirectUrl(),
      },
    });
    setBusy(false);
    if (error) {
      setNotice({ kind: "error", text: error.message });
    } else {
      setNotice({
        kind: "success",
        text: `Almost there — we've sent a confirmation link to ${email}. Click it to activate your account.`,
      });
    }
  }

  async function handleProvider(provider: "google" | "microsoft") {
    if (!supabase) {
      setNotice({ kind: "info", text: NOT_CONFIGURED_NOTICE });
      return;
    }
    setNotice(null);
    const { error } = await supabase.auth.signInWithOAuth({
      // Supabase's name for Microsoft sign-in is "azure"
      provider: provider === "microsoft" ? "azure" : "google",
      options: {
        redirectTo: authRedirectUrl(),
        ...(provider === "microsoft" ? { scopes: "email" } : {}),
      },
    });
    if (error) setNotice({ kind: "error", text: error.message });
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px] rounded-xl border border-line bg-white p-8 drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)] md:p-10">
        <div className="flex flex-col gap-2 text-center">
          <span className="mx-auto w-fit rounded-full bg-authchip px-3 py-1 text-[11px] font-bold uppercase tracking-[0.55px] text-teal">
            {copy.label}
          </span>
          <h1 className="pt-1 text-[28px] font-bold leading-9 text-authink">
            Create your account
          </h1>
          <p className="text-base leading-6 text-slate">{copy.blurb}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-base font-semibold leading-6 text-authink"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-12 w-full rounded-lg border border-line bg-white px-4 text-base text-authink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-base font-semibold leading-6 text-authink"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu.au"
              className="h-12 w-full rounded-lg border border-line bg-white px-4 text-base text-authink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-base font-semibold leading-6 text-authink"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="h-12 w-full rounded-lg border border-line bg-white px-4 pr-16 text-base text-authink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-slate hover:text-authink"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {notice && (
            <p
              role={notice.kind === "error" ? "alert" : "status"}
              className={
                notice.kind === "error"
                  ? "rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
                  : "rounded-lg border border-teal-border bg-teal-tint px-4 py-3 text-sm leading-5 text-teal"
              }
            >
              {notice.text}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-brand text-base font-bold text-white transition-colors hover:bg-[#255d99] disabled:opacity-60"
          >
            {busy ? "Creating account…" : "Create account"}
          </button>

          <SocialAuthButtons onSelect={handleProvider} />
        </form>

        <p className="flex justify-center gap-1 pt-8 text-sm leading-[21px] text-slate">
          <Link to="/signup" className="font-semibold text-brand hover:underline">
            ← Choose a different role
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
