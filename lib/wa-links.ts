function normalizePkPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 12 && cleaned.startsWith("92")) {
    return cleaned;
  }
  if (cleaned.length === 10) {
    return "92" + cleaned;
  }
  return cleaned;
}

const phoneFromEnv = process.env.NEXT_PUBLIC_WA_PLATFORM_PHONE_NUMBER || "+1 555-887-3738";
export const PLATFORM_WHATSAPP_NUMBER = normalizePkPhone(phoneFromEnv);

export function waLink(phone: string, text: string): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function waStartBusinessLink(): string {
  return waLink(PLATFORM_WHATSAPP_NUMBER, "Start Business");
}

export function waOrderConfirmLink(
  businessPhone: string,
  orderNumber: number,
): string {
  return waLink(businessPhone, `Order #${orderNumber} confirm karna hai`);
}
