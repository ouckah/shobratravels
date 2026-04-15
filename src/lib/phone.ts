import { parsePhoneNumberFromString, AsYouType } from "libphonenumber-js";

const DEFAULT_REGION = "US";

export function isValidPhone(raw: string): boolean {
  const p = parsePhoneNumberFromString(raw, DEFAULT_REGION);
  return !!p && p.isValid();
}

export function normalizePhone(raw: string): string {
  const p = parsePhoneNumberFromString(raw, DEFAULT_REGION);
  return p && p.isValid() ? p.number : raw.trim();
}

export function formatPhoneAsYouType(raw: string): string {
  return new AsYouType(DEFAULT_REGION).input(raw);
}

// Format only on forward-typing. When the user is deleting (shorter value)
// pass the raw input through so backspacing a formatting char doesn't get
// undone by re-applying the formatter.
export function formatPhoneInput(next: string, prev: string): string {
  if (next.length < prev.length) return next;
  return formatPhoneAsYouType(next);
}
