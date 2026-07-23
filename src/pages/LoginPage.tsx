import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";

/** Figma: node 1:198 "Log in" */

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // No auth backend yet — surface a friendly notice instead of failing silently.
    setSubmitted(true);
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
          noValidate={false}
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

          {submitted && (
            <p
              role="status"
              className="rounded-lg border border-teal-border bg-teal-tint px-4 py-3 text-sm leading-5 text-teal"
            >
              Accounts aren't open yet — logins will work once the InsightED
              app launches.
            </p>
          )}

          <button
            type="submit"
            className="flex h-12 items-center justify-center rounded-lg bg-brand text-base font-semibold text-white shadow-btn transition-colors hover:bg-[#255d99]"
          >
            Log in
          </button>

          <div className="flex items-center gap-4" aria-hidden>
            <span className="h-px flex-1 bg-line" />
            <span className="text-[13px] font-medium text-muted">
              or continue with
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="flex h-12 items-center justify-center gap-2.5 rounded-lg border border-line bg-white text-[15px] font-semibold text-ink transition-colors hover:bg-line-soft"
            >
              <GoogleLogo />
              Google
            </button>
            <button
              type="button"
              onClick={() => setSubmitted(true)}
              className="flex h-12 items-center justify-center gap-2.5 rounded-lg border border-line bg-white text-[15px] font-semibold text-ink transition-colors hover:bg-line-soft"
            >
              <MicrosoftLogo />
              Microsoft
            </button>
          </div>
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

function GoogleLogo() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3.01c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.72-4.95H1.27v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.28a7.21 7.21 0 0 1 0-4.56V6.61H1.27a12 12 0 0 0 0 10.78l4.01-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.59 1.8l3.44-3.44A11.98 11.98 0 0 0 1.27 6.61l4.01 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

function MicrosoftLogo() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path fill="#F25022" d="M1 1h10.5v10.5H1z" />
      <path fill="#7FBA00" d="M12.5 1H23v10.5H12.5z" />
      <path fill="#00A4EF" d="M1 12.5h10.5V23H1z" />
      <path fill="#FFB900" d="M12.5 12.5H23V23H12.5z" />
    </svg>
  );
}
