import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import SocialAuthButtons from "../components/SocialAuthButtons";
import {
  supabase,
  authRedirectUrl,
  NOT_CONFIGURED_NOTICE,
} from "../lib/supabase";

/** Figma: node 186:1103 "Create your account" */

const ROLES = [
  { value: "school", label: "School" },
  { value: "parent", label: "Parent" },
  { value: "specialist", label: "Specialist" },
];

type Notice = { kind: "info" | "error" | "success"; text: string };

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("school");
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
    <section className="flex min-h-[70vh] items-center justify-center bg-page px-6 py-16 md:py-24">
      <div className="w-full max-w-[440px]">
        <div className="flex flex-col gap-2 pb-8 text-center">
          <span className="mx-auto w-fit rounded-full border border-teal-border bg-teal-tint px-3 py-1 text-[11px] font-bold uppercase tracking-[0.55px] text-brand">
            Get started
          </span>
          <h1 className="text-[32px] font-bold leading-[1.15] tracking-[-1px] text-ink">
            Create your account
          </h1>
          <p className="text-base leading-6 text-body">
            Join the ecosystem supporting every learner.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-card border border-line-soft bg-white p-8 shadow-card"
        >
          <fieldset className="flex flex-col gap-1.5">
            <legend className="pb-1.5 text-sm font-semibold leading-5 text-ink">
              I am a…
            </legend>
            <div className="grid grid-cols-3 gap-2" role="radiogroup">
              {ROLES.map((r) => (
                <label
                  key={r.value}
                  className={[
                    "flex h-11 cursor-pointer items-center justify-center rounded-lg border px-2 text-center text-[13px] font-semibold leading-4 transition-colors",
                    role === r.value
                      ? "border-brand bg-brand-tint text-brand"
                      : "border-line text-body hover:bg-line-soft",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    name="role"
                    value={r.value}
                    checked={role === r.value}
                    onChange={() => setRole(r.value)}
                    className="sr-only"
                  />
                  {r.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="name"
              className="text-sm font-semibold leading-5 text-ink"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="h-12 rounded-lg border border-line px-4 text-base text-ink placeholder:text-footext focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            />
          </div>

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
            <label
              htmlFor="password"
              className="text-sm font-semibold leading-5 text-ink"
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
            {busy ? "Creating account…" : "Create account"}
          </button>

          <SocialAuthButtons onSelect={handleProvider} />

          <p className="text-center text-[13px] leading-5 text-muted">
            By creating an account you agree to our{" "}
            <Link to="/terms" className="font-medium text-brand hover:underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="font-medium text-brand hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </form>

        <p className="pt-6 text-center text-sm leading-5 text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
