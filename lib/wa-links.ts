export const PLATFORM_WHATSAPP_NUMBER = "923290203450";

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
