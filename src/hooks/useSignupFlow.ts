import { useState } from "react";
import { supabase, authRedirectUrl } from "../lib/supabase";

/**
 * Auth primitives shared by the teacher and specialist sign-up wizards.
 *
 * Order matters: Supabase can only verify an email or phone for a user that
 * already exists, so the account is created at step 1 and progressively
 * confirmed and enriched through the remaining steps.
 *
 * Requires in the Supabase dashboard:
 *  - Auth → Providers → Email → "Confirm email" ON
 *  - Auth → Email Templates → "Confirm signup" containing {{ .Token }}
 *  - Auth → Providers → Phone → enabled with Twilio credentials
 */

/** Supabase requires E.164 (+61412345678) — strip spaces and any leading 0. */
export function toE164(countryCode: string, national: string) {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "");
  return `${countryCode}${digits}`;
}

export type FlowResult =
  | { ok: true; skipEmailVerification?: boolean }
  | { ok: false; message: string };

/**
 * Supabase sometimes returns an error whose message is empty or a serialised
 * empty object — most often when a provider is switched off entirely. Fall
 * back to something the reader can act on.
 */
function readable(message: string | undefined, fallback: string) {
  const m = (message ?? "").trim();
  if (!m || m === "{}" || m === "[object Object]") return fallback;
  return m;
}

const NO_BACKEND =
  "Supabase isn't configured, so nothing was saved — continuing in demo mode.";

export default function useSignupFlow() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function fail(message: string): FlowResult {
    setError(message);
    setBusy(false);
    return { ok: false, message };
  }

  /** Step 1 — create the account. Sends the email confirmation code. */
  async function createAccount(
    email: string,
    password: string,
    metadata: Record<string, unknown>,
  ): Promise<FlowResult> {
    if (!supabase) return { ok: true, skipEmailVerification: false };
    setBusy(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata, emailRedirectTo: authRedirectUrl() },
    });

    if (signUpError) return fail(signUpError.message);

    // Supabase returns an identities array of length 0 when the address is
    // already registered — it avoids confirming account existence outright.
    if (data.user && data.user.identities?.length === 0) {
      return fail(
        "That email already has an account. Try logging in instead.",
      );
    }

    setBusy(false);
    // A session here means "Confirm email" is off in the dashboard, so there's
    // no code to check — skip the email step rather than dead-ending.
    return { ok: true, skipEmailVerification: Boolean(data.session) };
  }

  /** Step 2 — check the 6-digit code from the confirmation email. */
  async function verifyEmail(email: string, token: string): Promise<FlowResult> {
    if (!supabase) return { ok: true };
    setBusy(true);
    setError(null);

    const { error: otpError } = await supabase.auth.verifyOtp({
      email,
      token,
      type: "signup",
    });

    if (otpError) {
      return fail(
        /expired/i.test(otpError.message)
          ? "That code has expired. Request a new one."
          : "That code isn't right. Check the email and try again.",
      );
    }
    setBusy(false);
    return { ok: true };
  }

  async function resendEmail(email: string): Promise<FlowResult> {
    if (!supabase) return { ok: true };
    setError(null);
    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    return resendError ? fail(resendError.message) : { ok: true };
  }

  /**
   * Step 3a — attach the phone number, which triggers the SMS.
   * Needs the session created by verifyEmail, so it must run after it.
   */
  async function sendPhoneCode(phone: string): Promise<FlowResult> {
    if (!supabase) return { ok: true };
    setBusy(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({ phone });

    if (updateError) {
      const smsNotSetUp =
        "SMS isn't set up yet. Enable Supabase → Authentication → Providers → Phone and add your Twilio credentials.";
      return fail(
        /provider|disabled|not enabled|unsupported/i.test(updateError.message)
          ? smsNotSetUp
          : readable(updateError.message, smsNotSetUp),
      );
    }
    setBusy(false);
    return { ok: true };
  }

  /** Step 3b — check the SMS code. */
  async function verifyPhone(phone: string, token: string): Promise<FlowResult> {
    if (!supabase) return { ok: true };
    setBusy(true);
    setError(null);

    const { error: otpError } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "phone_change",
    });

    if (otpError) {
      return fail(
        /expired/i.test(otpError.message)
          ? "That code has expired. Request a new one."
          : "That code isn't right. Check the message and try again.",
      );
    }
    setBusy(false);
    return { ok: true };
  }

  /** Final step — store the details collected after the account was created. */
  async function saveProfile(
    metadata: Record<string, unknown>,
  ): Promise<FlowResult> {
    if (!supabase) return { ok: true };
    setBusy(true);
    setError(null);

    const { error: updateError } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (updateError) return fail(updateError.message);
    setBusy(false);
    return { ok: true };
  }

  return {
    busy,
    error,
    setError,
    isDemo: !supabase,
    demoNotice: NO_BACKEND,
    createAccount,
    verifyEmail,
    resendEmail,
    sendPhoneCode,
    verifyPhone,
    saveProfile,
  };
}
