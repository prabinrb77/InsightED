import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

/**
 * Landing page for the reset link emailed by Supabase. The link carries a
 * short-lived recovery session, so updateUser({ password }) works here
 * without the old password.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Password reset isn't available yet.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setBusy(false);
    if (updateError) {
      setError(
        updateError.message.includes("session")
          ? "This reset link has expired. Request a new one from the login page."
          : updateError.message,
      );
    } else {
      navigate("/");
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-page px-6 py-16 md:py-24">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col gap-2 pb-8 text-center">
          <span className="mx-auto w-fit rounded-full border border-teal-border bg-teal-tint px-3 py-1 text-[11px] font-bold uppercase tracking-[0.55px] text-brand">
            Reset password
          </span>
          <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-1px] text-ink">
            Choose a new password
          </h1>
          <p className="text-base leading-6 text-body">
            You'll be logged in straight after.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-card border border-line-soft bg-white p-8 shadow-card"
        >
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-sm font-semibold leading-5 text-ink"
            >
              New password
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

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex h-12 items-center justify-center rounded-lg bg-brand text-base font-semibold text-white shadow-btn transition-colors hover:bg-[#255d99] disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save new password"}
          </button>
        </form>

        <p className="pt-6 text-center text-sm leading-5 text-muted">
          Link expired?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-brand hover:underline"
          >
            Request a new one
          </Link>
        </p>
      </div>
    </section>
  );
}
