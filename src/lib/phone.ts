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

// Digit-based input handling: the user effectively types/deletes only digits.
// If the keystroke deleted a format char (digit count unchanged but value
// shortened), we drop a digit for them so backspace feels natural.
export function formatPhoneInput(next: string, prev: string): string {
  const nextDigits = next.replace(/\D/g, "");
  const prevDigits = prev.replace(/\D/g, "");

  let digits: string;
  if (next.length < prev.length && nextDigits.length === prevDigits.length) {
    // Backspace/delete landed on a format char — drop the preceding digit.
    digits = prevDigits.slice(0, -1);
  } else {
    digits = nextDigits;
  }

  if (!digits) return "";
  return formatPhoneAsYouType(digits);
}
