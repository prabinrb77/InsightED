import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { supabase, authRedirectUrl } from "../lib/supabase";

/**
 * Password reset request page, linked from the login form. Standard flow:
 * ask for the account email, send a time-limited reset link, and show the
 * same confirmation whether or not the email exists (so the form can't be
 * used to probe which addresses have accounts).
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (supabase) {
      setBusy(true);
      // Ignore errors on purpose: showing them would reveal which emails
      // have accounts. The confirmation copy is already conditional.
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: authRedirectUrl("reset-password"),
      });
      setBusy(false);
    }
    setSent(true);
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col gap-2 pb-8 text-center">
          <span className="mx-auto w-fit rounded-full border border-teal-border bg-teal-tint px-3 py-1 text-[11px] font-bold uppercase tracking-[0.55px] text-brand">
            Reset password
          </span>
          <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-1px] text-ink">
            Forgot your password?
          </h1>
          <p className="text-base leading-6 text-body">
            Enter the email you signed up with and we'll send you a link to
            reset it.
          </p>
        </div>

        {sent ? (
          <div
            role="status"
            className="flex flex-col gap-4 rounded-card border border-line-soft bg-white p-8 text-center shadow-card"
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-teal-tint text-2xl">
              📮
            </div>
            <h2 className="text-xl font-bold tracking-[-0.5px] text-ink">
              Check your inbox
            </h2>
            <p className="text-[15px] leading-6 text-body">
              If an account exists for{" "}
              <span className="font-semibold text-ink">{email}</span>, a reset
              link is on its way. It expires in 30 minutes — check your spam
              folder if you don't see it.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-sm font-semibold text-brand hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={busy}
              className="flex h-12 items-center justify-center rounded-lg bg-brand text-base font-semibold text-white shadow-btn transition-colors hover:bg-[#255d99] disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}

        <p className="pt-6 text-center text-sm leading-5 text-muted">
          Remembered it?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
