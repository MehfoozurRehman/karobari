/**
 * Normalize a Pakistani phone number to `923XXXXXXXXX` (no plus sign).
 * Mirror of lib/phone.ts on the frontend — keep in sync.
 */
export function normalizePkPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  if (!digits) return null;
  let n = digits;
  if (n.startsWith("0092")) n = n.slice(4);
  else if (n.startsWith("92")) n = n.slice(2);
  else if (n.startsWith("0")) n = n.slice(1);
  if (n.length === 10 && n.startsWith("3")) return `92${n}`;
  return null;
}
