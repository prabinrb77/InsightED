import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useSignupFlow, { toE164 } from "../hooks/useSignupFlow";
import SignupWizardLayout from "../components/SignupWizardLayout";
import OtpInput from "../components/OtpInput";
import { GoogleLogo, MicrosoftLogo } from "../components/SocialAuthButtons";
import {
  ApprovalTracker,
  Card,
  Consent,
  Countdown,
  Divider,
  ErrorNote,
  IconCircle,
  MailGlyph,
  PhoneGlyph,
  PrimaryOutline,
  Req,
  Resend,
  StepLabel,
  WIZARD_FIELD as FIELD,
  WIZARD_LABEL as LABEL,
  passwordStrength,
} from "../components/wizardBits";
import { supabase, authRedirectUrl } from "../lib/supabase";
import iconInfo from "../assets/icons/tsignup-info.svg";
import iconCountry from "../assets/icons/tsignup-country.svg";
import iconPrivacy from "../assets/icons/tsignup-privacy.svg";
import iconCurrency from "../assets/icons/tsignup-currency.svg";
import iconResidency from "../assets/icons/tsignup-residency.svg";
import iconSearch from "../assets/icons/tsignup-search.svg";

/**
 * Figma: 186:1185 (step 1) → 186:1297 (step 2) → 186:1356 (step 3)
 * → 186:1415 (step 4) → 186:1564 (account created).
 *
 * The account is created at step 1 — Supabase can only verify an email or
 * phone for a user that already exists. Steps 2 and 3 check real one-time
 * codes; step 4 attaches the school details to the confirmed account.
 * See useSignupFlow for the required Supabase dashboard configuration.
 */

const SCHOOL_SETTINGS = [
  { icon: iconCountry, label: "Country", value: "Australia" },
  { icon: iconPrivacy, label: "Privacy framework", value: "APP (Privacy Act 1988)" },
  { icon: iconCurrency, label: "Currency", value: "AUD" },
  { icon: iconResidency, label: "Data residency", value: "AWS Sydney" },
];

export default function TeacherSignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mobile, setMobile] = useState("");
  const [consents, setConsents] = useState({
    terms: false,
    ai: false,
    nonclinical: false,
  });

  // Steps 2 & 3
  const [emailCode, setEmailCode] = useState("");
  const [smsCode, setSmsCode] = useState("");

  // Step 4
  const [school, setSchool] = useState("");
  const [alsoParent, setAlsoParent] = useState(false);
  const [displayName, setDisplayName] = useState("");

  const [dialCode, setDialCode] = useState("+61");

  const flow = useSignupFlow();
  const { busy, error, setError } = flow;

  const allConsented = consents.terms && consents.ai && consents.nonclinical;
  const e164 = toE164(dialCode, mobile);

  function goto(next: number) {
    setError(null);
    setStep(next);
    window.scrollTo(0, 0);
  }

  /** Step 1 — create the account, which sends the email code. */
  async function handleStep1(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    const res = await flow.createAccount(email, password, {
      role: "teacher",
      phone_pending: e164,
    });
    if (!res.ok) return;
    // "Confirm email" off in the dashboard means there's no code to check.
    if (res.skipEmailVerification) {
      goto(3);
      await startPhoneVerification();
    } else {
      goto(2);
    }
  }

  /** Step 2 — check the emailed code, then trigger the SMS. */
  async function handleVerifyEmail() {
    const res = await flow.verifyEmail(email, emailCode);
    if (!res.ok) return;
    goto(3);
    await startPhoneVerification();
  }

  async function startPhoneVerification() {
    if (!mobile.trim()) return;
    await flow.sendPhoneCode(e164);
  }

  /** Step 3 — check the SMS code. */
  async function handleVerifyPhone() {
    const res = await flow.verifyPhone(e164, smsCode);
    if (!res.ok) return;
    goto(4);
  }

  async function handleProvider(provider: "google" | "microsoft") {
    if (!supabase) {
      setError(flow.demoNotice);
      return;
    }
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      // Supabase's name for Microsoft sign-in is "azure"
      provider: provider === "microsoft" ? "azure" : "google",
      options: {
        redirectTo: authRedirectUrl(),
        ...(provider === "microsoft" ? { scopes: "email" } : {}),
      },
    });
    if (oauthError) setError(oauthError.message);
  }

  /** Step 4 — attach the school details to the confirmed account. */
  async function handleCreateAccount(e: FormEvent) {
    e.preventDefault();
    const res = await flow.saveProfile({
      full_name: displayName,
      role: "teacher",
      phone: e164,
      school,
      also_parent: alsoParent,
    });
    if (res.ok) goto(5);
  }

  return (
    <SignupWizardLayout
      step={step}
      totalSteps={4}
      showSignIn={step === 1}
      onBack={step > 1 && step < 5 ? () => goto(step - 1) : undefined}
    >
      {step === 1 && (
        <Card>
          <StepLabel>Step 1 of 4</StepLabel>
          <h1 className="text-2xl font-bold leading-8 text-[#0F172A]">
            Create your teacher account
          </h1>
          <p className="text-sm leading-5 text-authslate">
            We'll verify your details to keep students safe.
          </p>

          <form onSubmit={handleStep1} className="flex flex-col gap-5 pt-6">
            <label className="flex flex-col gap-2">
              <span className={LABEL}>
                School Assigned Email <Req />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu.au"
                className={FIELD}
              />
            </label>

            <div className="flex flex-col gap-2">
              <label className={LABEL} htmlFor="pw">
                Password <Req />
              </label>
              <div className="relative">
                <input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${FIELD} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 px-4 text-sm text-authslate hover:text-ink"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < passwordStrength(password) ? "bg-brand" : "bg-line-edge"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs leading-4 text-authslate">
                8+ characters, 1 number, 1 special character
              </p>
            </div>

            <label className="flex flex-col gap-2">
              <span className={LABEL}>
                Confirm password <Req />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={FIELD}
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className={LABEL}>
                Mobile number <Req />
              </span>
              <div className="flex gap-3">
                <select
                  aria-label="Country calling code"
                  className="w-28 shrink-0 rounded-lg border border-authline bg-white px-3 py-3.5 text-base text-ink focus:border-brand focus:outline-none"
                  value={dialCode}
                  onChange={(e) => setDialCode(e.target.value)}
                >
                  <option value="+61">🇦🇺 +61</option>
                  <option value="+64">🇳🇿 +64</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+1">🇺🇸 +1</option>
                </select>
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="412 345 678"
                  className={FIELD}
                />
              </div>
            </div>

            <Divider>or sign up with</Divider>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleProvider("google")}
                className="flex h-12 items-center justify-center gap-3 rounded-lg border border-authline bg-white text-[15px] font-semibold text-ink transition-colors hover:bg-mist"
              >
                <GoogleLogo />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => handleProvider("microsoft")}
                className="flex h-12 items-center justify-center gap-3 rounded-lg border border-authline bg-white text-[15px] font-semibold text-ink transition-colors hover:bg-mist"
              >
                <MicrosoftLogo />
                Continue with Microsoft
              </button>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <Consent
                checked={consents.terms}
                onChange={(v) => setConsents((c) => ({ ...c, terms: v }))}
              >
                I agree to the{" "}
                <Link to="/terms" className="text-brand hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-brand hover:underline">
                  Privacy Policy
                </Link>
              </Consent>
              <Consent
                checked={consents.ai}
                onChange={(v) => setConsents((c) => ({ ...c, ai: v }))}
              >
                I understand that AI-generated strategies are educational, not
                clinical advice
              </Consent>
              <Consent
                checked={consents.nonclinical}
                onChange={(v) => setConsents((c) => ({ ...c, nonclinical: v }))}
              >
                I acknowledge that MiZanova provides non-clinical support only
              </Consent>
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            <PrimaryOutline type="submit" disabled={!allConsented}>
              Continue to Verification
            </PrimaryOutline>
          </form>
        </Card>
      )}

      {step === 2 && (
        <Card className="text-center">
          <StepLabel>Step 2 of 4</StepLabel>
          <IconCircle>
            <MailGlyph />
          </IconCircle>
          <h1 className="pt-2 text-2xl font-bold leading-8 text-[#0F172A]">
            Check your email
          </h1>
          <p className="text-sm leading-5 text-authslate">
            We sent a 6-digit code to{" "}
            <span className="font-semibold text-ink">
              {email || "your school address"}
            </span>
          </p>

          <div className="pt-6">
            <OtpInput
              value={emailCode}
              onChange={setEmailCode}
              label="Email verification code"
            />
          </div>

          <Countdown seconds={582} />
          <Resend onResend={() => flow.resendEmail(email)} />

          {error && <ErrorNote>{error}</ErrorNote>}

          <PrimaryOutline
            type="button"
            disabled={emailCode.length < 6 || busy}
            onClick={handleVerifyEmail}
          >
            Verify &amp; Continue
          </PrimaryOutline>
        </Card>
      )}

      {step === 3 && (
        <Card className="text-center">
          <StepLabel>Step 3 of 4</StepLabel>
          <IconCircle>
            <PhoneGlyph />
          </IconCircle>
          <h1 className="pt-2 text-2xl font-bold leading-8 text-[#0F172A]">
            Verify your phone number
          </h1>
          <p className="text-sm leading-5 text-authslate">
            We sent a 6-digit code by SMS to{" "}
            <span className="font-semibold text-ink">
              {mobile ? e164 : `${dialCode} 412 345 678`}
            </span>
          </p>

          <div className="pt-6">
            <OtpInput
              value={smsCode}
              onChange={setSmsCode}
              label="SMS verification code"
            />
          </div>

          <Countdown seconds={299} />
          <Resend onResend={startPhoneVerification} />

          {error && <ErrorNote>{error}</ErrorNote>}

          <PrimaryOutline
            type="button"
            disabled={smsCode.length < 6 || busy}
            onClick={handleVerifyPhone}
          >
            Verify &amp; Continue
          </PrimaryOutline>
        </Card>
      )}

      {step === 4 && (
        <Card>
          <StepLabel>Step 4 of 4</StepLabel>
          <h1 className="text-center text-2xl font-bold leading-8 text-[#0F172A]">
            Connect to your school
          </h1>
          <p className="text-center text-sm leading-5 text-authslate">
            Find your school to inherit its compliance settings
          </p>

          <form onSubmit={handleCreateAccount} className="flex flex-col gap-4 pt-6">
            <label className="flex flex-col gap-2">
              <span className={LABEL}>
                Find your school <Req />
              </span>
              <span className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2">
                  <img src={iconSearch} alt="" aria-hidden className="size-full" />
                </span>
                <input
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Search Your School"
                  className={`${FIELD} border-2 border-brand pl-10`}
                />
              </span>
            </label>

            <button
              type="button"
              className="self-start text-xs font-medium leading-4 text-brand hover:underline"
            >
              My school isn't listed — Request to add your school
            </button>

            <div className="flex flex-col gap-4 rounded-xl border border-[rgba(45,106,106,0.1)] bg-[#E6F0F0] p-5">
              <h2 className="flex items-center gap-2 text-xs font-bold uppercase leading-4 tracking-[0.6px] text-brand">
                <span className="size-3">
                  <img src={iconInfo} alt="" aria-hidden className="size-full" />
                </span>
                Your school's settings will be applied
              </h2>
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SCHOOL_SETTINGS.map((s) => (
                  <div key={s.label} className="flex gap-2.5">
                    <span className="mt-0.5 size-4 shrink-0">
                      <img
                        src={s.icon}
                        alt=""
                        aria-hidden
                        className="size-full object-contain"
                      />
                    </span>
                    <span>
                      <dt className="text-[10px] font-bold uppercase leading-[15px] tracking-[-0.25px] text-authslate">
                        {s.label}
                      </dt>
                      <dd className="text-sm font-semibold leading-5 text-[#1E293B]">
                        {s.value}
                      </dd>
                    </span>
                  </div>
                ))}
              </dl>
            </div>

            <label className="flex gap-3 p-1">
              <input
                type="checkbox"
                checked={alsoParent}
                onChange={(e) => setAlsoParent(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded-sm border-[#767676] accent-brand"
              />
              <span className="flex flex-col gap-1">
                <span className="text-sm font-semibold leading-5 text-[#0F172A]">
                  I am also a parent of a child at this school
                </span>
                <span className="text-xs leading-[19.5px] text-authslate">
                  We'll create both Teacher and Parent dashboards for you. You'll
                  choose which role to use at each login.
                </span>
              </span>
            </label>

            <label className="flex flex-col gap-2 pt-2">
              <span className={LABEL}>
                How Other will see you <Req />
              </span>
              <input
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ms Sarah Chen"
                className={FIELD}
              />
            </label>

            {error && <ErrorNote>{error}</ErrorNote>}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-brand py-4 text-lg font-bold text-white shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] transition-colors hover:bg-[#255d99] disabled:opacity-60"
            >
              {busy ? "Creating account…" : "Create Account"}
              <span aria-hidden>→</span>
            </button>
          </form>
        </Card>
      )}

      {step === 5 && (
        <Card className="text-center">
          <span className="mx-auto flex size-[150px] items-center justify-center rounded-full bg-[#E6F0F7]">
            <span className="flex size-[100px] items-center justify-center rounded-full bg-brand text-5xl text-white">
              ✓
            </span>
          </span>

          <h1 className="pt-6 text-3xl font-bold leading-9 text-[#0F172A]">
            Account created!
          </h1>
          <p className="text-base leading-6 text-authslate">
            Welcome to MiZanova, {displayName || "Sarah"}.
          </p>

          <ApprovalTracker />

          <div className="mt-8 flex flex-col gap-3 rounded-xl bg-[#E6F0F0] p-6 text-left">
            <h2 className="flex items-center gap-2 text-sm font-bold leading-5 text-brand">
              <span className="size-3">
                <img src={iconInfo} alt="" aria-hidden className="size-full" />
              </span>
              What happens next?
            </h2>
            <p className="text-[13px] leading-5 text-body">
              To ensure student safety, all educators must complete a quick{" "}
              <strong className="font-bold text-ink">
                Professional Verification
              </strong>
              . You'll need to upload your teaching ID or a letter from your
              school administration.
            </p>
            <p className="text-[13px] leading-5 text-body">
              Once submitted, our compliance team will review your credentials.
              This process typically takes{" "}
              <strong className="font-bold text-ink">2 business days</strong>.
            </p>
            <p className="text-[13px] leading-5 text-body">
              After approval, you'll receive an email to set up your{" "}
              <strong className="font-bold text-ink">
                2FA (Two-Factor Authentication)
              </strong>{" "}
              and gain full access to your gradebook and roster management tools.
            </p>
          </div>

          {/* Professional Verification isn't built yet, so both routes drop
              the new educator into the app. */}
          <button
            type="button"
            onClick={() => navigate("/app")}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-4 text-base font-bold text-white shadow-btn transition-colors hover:bg-[#255d99]"
          >
            Complete Professional Verification Now <span aria-hidden>→</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/app")}
            className="pt-4 text-sm font-semibold text-brand hover:underline"
          >
            Save and continue later
          </button>

          <p className="pt-6 text-xs text-authslate">
            Need help?{" "}
            <a href="#support" className="text-brand hover:underline">
              Contact Support
            </a>
          </p>
        </Card>
      )}
    </SignupWizardLayout>
  );
}
