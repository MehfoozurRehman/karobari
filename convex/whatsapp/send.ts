import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

const GRAPH_BASE = "https://graph.facebook.com/v23.0";
const WINDOW_MS = 24 * 60 * 60 * 1000;

export async function sendText(
  ctx: ActionCtx,
  args: {
    phoneNumberId: string;
    accessToken: string;
    conversationId: Id<"conversations">;
    to: string;
    text: string;
  },
): Promise<boolean> {
  const conversation: Doc<"conversations"> | null = await ctx.runQuery(
    internal.whatsapp.messagesDb.getConversation,
    { conversationId: args.conversationId },
  );
  if (
    !conversation ||
    Date.now() - conversation.lastInboundAt > WINDOW_MS
  ) {
    console.warn(
      `Skipped WhatsApp send to ${args.to}: 24h window closed`,
    );
    return false;
  }

  const res = await fetch(`${GRAPH_BASE}/${args.phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: args.to,
      type: "text",
      text: { preview_url: true, body: args.text },
    }),
  });
  if (!res.ok) {
    console.error(`WhatsApp send failed: ${await res.text()}`);
    return false;
  }
  await ctx.runMutation(internal.whatsapp.messagesDb.insertMessage, {
    conversationId: args.conversationId,
    direction: "out",
    role: "assistant",
    text: args.text,
  });
  return true;
}

export async function resolveChannel(
  ctx: ActionCtx,
  phoneNumberId: string,
): Promise<{ accessToken: string; businessId: Id<"businesses"> | null } | null> {
  if (phoneNumberId === process.env.WA_PLATFORM_PHONE_NUMBER_ID) {
    const token = process.env.WA_PLATFORM_TOKEN;
    if (!token) return null;
    return { accessToken: token, businessId: null };
  }
  const account: Doc<"whatsappAccounts"> | null = await ctx.runQuery(
    internal.whatsapp.messagesDb.getAccountByPhoneNumberId,
    { phoneNumberId },
  );
  if (!account || account.status !== "connected") return null;
  return { accessToken: account.accessToken, businessId: account.businessId };
}
