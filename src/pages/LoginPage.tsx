import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SocialAuthButtons from "../components/SocialAuthButtons";
import {
  supabase,
  authRedirectUrl,
  NOT_CONFIGURED_NOTICE,
} from "../lib/supabase";

/** Figma: node 1:198 "Log in" */

type Notice = { kind: "info" | "error"; text: string };

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setNotice({ kind: "info", text: NOT_CONFIGURED_NOTICE });
      return;
    }
    setBusy(true);
    setNotice(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setBusy(false);
    if (error) {
      setNotice({ kind: "error", text: error.message });
    } else {
      navigate("/");
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
    <section className="flex min-h-[70vh] items-center justify-center bg-page px-6 py-16 md:py-24">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col gap-2 pb-8 text-center">
          <span className="mx-auto w-fit rounded-full border border-teal-border bg-teal-tint px-3 py-1 text-[11px] font-bold uppercase tracking-[0.55px] text-brand">
            Welcome back
          </span>
          <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-1px] text-ink">
            Log in to InsightED
          </h1>
          <p className="text-base leading-6 text-body">
            Pick up right where you left off.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-card border border-line-soft bg-white p-8 shadow-card"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-sm font-semibold leading-5 text-ink"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu.au"
              className="h-12 rounded-lg border border-line px-4 text-base text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold leading-5 text-ink"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="h-12 w-full rounded-lg border border-line px-4 pr-16 text-base text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-muted hover:text-ink"
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-body">
            <input
              type="checkbox"
              name="remember"
              className="h-4 w-4 rounded border-line-strong accent-brand"
            />
            Keep me logged in on this device
          </label>

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
            className="flex h-12 items-center justify-center rounded-lg bg-brand text-base font-semibold text-white shadow-btn transition-colors hover:bg-[#255d99] disabled:opacity-60"
          >
            {busy ? "Logging in…" : "Log in"}
          </button>

          <SocialAuthButtons onSelect={handleProvider} />
        </form>

        <p className="pt-6 text-center text-sm leading-5 text-muted">
          New to InsightED?{" "}
          <Link to="/signup" className="font-semibold text-brand hover:underline">
            Create your account
          </Link>
        </p>
      </div>
    </section>
  );
}
