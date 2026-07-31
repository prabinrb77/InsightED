/**
 * Sign-in accepts either an email address or a phone number in the one field,
 * because not every account has an email — the platform super admin signs in
 * with a mobile number.
 *
 * Australia is the default country code: the product is AU-hosted and every
 * sign-up wizard already collects +61 numbers.
 */

const DEFAULT_COUNTRY_CODE = "+61";

export function isPhoneIdentifier(value: string) {
  const v = value.trim();
  if (v.includes("@")) return false;
  return /^\+?[\d][\d\s()-]{5,}$/.test(v);
}

/** 0400071139 · 61400071139 · +61 400 071 139 → +61400071139 */
export function toE164Identifier(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned;

  const digits = cleaned.replace(/^0+/, "");
  if (digits.startsWith("61")) return `+${digits}`;
  return `${DEFAULT_COUNTRY_CODE}${digits}`;
}

/** Shapes whichever identifier was typed into Supabase's credential object. */
export function credentialsFor(identifier: string, password: string) {
  return isPhoneIdentifier(identifier)
    ? { phone: toE164Identifier(identifier), password }
    : { email: identifier.trim(), password };
}
