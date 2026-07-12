import { internalAction, type ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import type { Doc, Id } from "../_generated/dataModel";
import { normalizePkPhone } from "../lib/phone";
import { storeInboundMedia } from "./media";

type WaMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; mime_type: string; caption?: string };
};

type WaChange = {
  value: {
    metadata?: { phone_number_id: string };
    contacts?: Array<{ profile?: { name?: string }; wa_id: string }>;
    messages?: WaMessage[];
  };
  field: string;
};

export const handle = internalAction({
  args: { payload: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entries = args.payload?.entry ?? [];
    for (const entry of entries) {
      for (const change of (entry.changes ?? []) as WaChange[]) {
        if (change.field !== "messages") continue;
        const value = change.value;
        const phoneNumberId = value.metadata?.phone_number_id;
        if (!phoneNumberId || !value.messages) continue;

        for (const message of value.messages) {
          await handleMessage(ctx, phoneNumberId, message, value);
        }
      }
    }
    return null;
  },
});

async function handleMessage(
  ctx: ActionCtx,
  phoneNumberId: string,
  message: WaMessage,
  value: WaChange["value"],
) {
  const duplicate: boolean = await ctx.runQuery(
    internal.whatsapp.messagesDb.hasInboundMessage,
    { waMessageId: message.id },
  );
  if (duplicate) return;

  const peerPhoneRaw = message.from;
  const peerPhone = normalizePkPhone(peerPhoneRaw) ?? peerPhoneRaw;
  const peerName = value.contacts?.find((c) => c.wa_id === peerPhoneRaw)
    ?.profile?.name;

  const isPlatform =
    phoneNumberId === process.env.WA_PLATFORM_PHONE_NUMBER_ID;

  let accessToken: string;
  let businessId: Id<"businesses"> | null = null;
  let kind: "customer" | "owner" | "onboarding";

  if (isPlatform) {
    accessToken = process.env.WA_PLATFORM_TOKEN ?? "";
    kind = "onboarding";
  } else {
    const account: Doc<"whatsappAccounts"> | null = await ctx.runQuery(
      internal.whatsapp.messagesDb.getAccountByPhoneNumberId,
      { phoneNumberId },
    );
    if (!account || account.status !== "connected") return;
    accessToken = account.accessToken;
    businessId = account.businessId;
    const business = await ctx.runQuery(internal.businesses.getInternal, {
      businessId: account.businessId,
    });
    kind = business && business.ownerPhone === peerPhone ? "owner" : "customer";
  }
  if (!accessToken) return;

  const conversationId: Id<"conversations"> = await ctx.runMutation(
    internal.whatsapp.messagesDb.upsertConversation,
    {
      channelPhoneNumberId: phoneNumberId,
      peerPhone,
      kind,
      businessId: businessId ?? undefined,
      peerName,
      markInbound: true,
    },
  );

  let text = message.text?.body ?? "";
  let mediaStorageId: Id<"_storage"> | undefined;
  let mediaType: string | undefined;

  if (message.type === "image" && message.image) {
    const stored = await storeInboundMedia(ctx, {
      mediaId: message.image.id,
      accessToken,
    });
    mediaStorageId = stored ?? undefined;
    mediaType = message.image.mime_type;
    text = message.image.caption ?? "[customer sent an image]";
  } else if (message.type === "document" && message.document) {
    const stored = await storeInboundMedia(ctx, {
      mediaId: message.document.id,
      accessToken,
    });
    mediaStorageId = stored ?? undefined;
    mediaType = message.document.mime_type;
    text = message.document.caption ?? "[customer sent a document]";
  } else if (message.type !== "text") {
    text = `[unsupported message type: ${message.type}]`;
  }

  await ctx.runMutation(internal.whatsapp.messagesDb.insertMessage, {
    conversationId,
    direction: "in",
    role: "user",
    text,
    waMessageId: message.id,
    mediaStorageId,
    mediaType,
  });

  if (kind === "onboarding") {
    await ctx.runAction(internal.agents.onboardingAgent.run, {
      conversationId,
      phoneNumberId,
      accessToken,
      peerPhone,
      text,
    });
  } else if (kind === "owner" && businessId) {
    await ctx.runAction(internal.agents.ownerAgent.run, {
      conversationId,
      businessId,
      phoneNumberId,
      accessToken,
      peerPhone,
    });
  } else if (businessId) {
    await ctx.runAction(internal.agents.customerAgent.run, {
      conversationId,
      businessId,
      phoneNumberId,
      accessToken,
      peerPhone,
    });
  }
}
