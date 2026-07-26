import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { GoogleLogo, MicrosoftLogo } from "../components/SocialAuthButtons";
import {
  supabase,
  authRedirectUrl,
  NOT_CONFIGURED_NOTICE,
} from "../lib/supabase";

/** Figma: node 1:198 "Login Page" */

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
    <AuthLayout>
      <div className="w-full max-w-[440px] rounded-xl border border-line bg-white p-8 drop-shadow-[0px_4px_10px_rgba(0,0,0,0.05)] md:p-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[32px] font-bold leading-10 text-authink">
            Welcome Back
          </h1>
          <p className="text-base leading-6 text-slate">
            Sign in to access your educational ecosystem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 pt-8">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-base font-semibold leading-6 text-authink"
            >
              Email Address
            </label>
            <div className="relative">
              <MailIcon />
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu.au"
                className="h-12 w-full rounded-lg border border-line bg-white pl-11 pr-4 text-base text-authink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-base font-semibold leading-6 text-authink"
              >
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium leading-[21px] text-brand hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <LockIcon />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 w-full rounded-lg border border-line bg-white pl-11 pr-12 text-base text-authink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate hover:text-authink"
              >
                <EyeIcon off={showPassword} />
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-slate">
            <input
              type="checkbox"
              name="remember"
              className="size-4 rounded border-line-strong accent-brand"
            />
            Remember me
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
            className="flex h-12 w-full items-center justify-center rounded-lg bg-brand text-base font-bold text-white transition-colors hover:bg-[#255d99] disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Login"}
          </button>
        </form>

        <div className="relative flex items-center justify-center py-8">
          <span aria-hidden className="absolute inset-x-0 h-px bg-line" />
          <span className="relative bg-white px-4 text-sm font-medium uppercase leading-[21px] tracking-[0.7px] text-slate">
            or continue with
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleProvider("google")}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-line bg-white text-base font-semibold text-authink transition-colors hover:bg-mist"
          >
            <GoogleLogo />
            Google
          </button>
          <button
            type="button"
            onClick={() => handleProvider("microsoft")}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-lg border border-line bg-white text-base font-semibold text-authink transition-colors hover:bg-mist"
          >
            <MicrosoftLogo />
            Microsoft
          </button>
        </div>

        <p className="flex justify-center gap-1 pt-8 text-sm leading-[21px] text-slate">
          Don't have an account?
          <Link to="/signup" className="font-bold text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

/* The frame draws these affordances with Font Awesome glyphs, which the project
   doesn't bundle — rendered as equivalent inline SVGs. */

function MailIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate"
    >
      <rect
        x="1.5"
        y="4"
        width="17"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M2 5.5 10 11l8-5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      fill="none"
      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate"
    >
      <rect
        x="3.5"
        y="8.5"
        width="13"
        height="9"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 8.5V6a3.5 3.5 0 1 1 7 0v2.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 20 20" fill="none" className="size-4">
      <path
        d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      {off && (
        <path
          d="M3 3l14 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
