/**
 * Normalize a Pakistani phone number to the canonical `923XXXXXXXXX` form
 * (no plus sign). Accepts "03xx...", "+92 3xx...", "92 3xx...", "0092...".
 * Returns null if the input cannot be interpreted as a Pakistani mobile number.
 */
export function normalizePkPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  let n = digits;
  if (n.startsWith("0092")) n = n.slice(4);
  else if (n.startsWith("92")) n = n.slice(2);
  else if (n.startsWith("0")) n = n.slice(1);
  // Pakistani mobile numbers: 3XXXXXXXXX (10 digits starting with 3)
  if (n.length === 10 && n.startsWith("3")) return `92${n}`;
  return null;
}

/** Format `923001234567` as `+92 300 1234567` for display. */
export function formatPkPhone(normalized: string): string {
  if (normalized.length === 12 && normalized.startsWith("92")) {
    return `+92 ${normalized.slice(2, 5)} ${normalized.slice(5)}`;
  }
  return `+${normalized}`;
}
