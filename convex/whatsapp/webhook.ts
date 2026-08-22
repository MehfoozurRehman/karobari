import { internalAction, type ActionCtx } from '../_generated/server';
import { internal } from '../_generated/api';
import { v } from 'convex/values';
import type { Doc, Id } from '../_generated/dataModel';
import { normalizePkPhone } from '../lib/phone';
import { storeInboundMedia, transcribeInboundAudio } from './media';
import { sendText } from './send';

type WaMessage = {
  id: string;
  from: string;
  type: string;
  text?: { body: string };
  image?: { id: string; mime_type: string; caption?: string };
  document?: { id: string; mime_type: string; caption?: string };
  audio?: { id: string; mime_type: string; voice?: boolean };
  voice?: { id: string; mime_type: string };
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
        if (change.field !== 'messages') continue;
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

async function handleMessage(ctx: ActionCtx, phoneNumberId: string, message: WaMessage, value: WaChange['value']) {
  const duplicate: boolean = await ctx.runQuery(internal.whatsapp.messagesDb.hasInboundMessage, { waMessageId: message.id });
  if (duplicate) return;

  const peerPhoneRaw = message.from;
  const peerPhone = normalizePkPhone(peerPhoneRaw) ?? peerPhoneRaw;
  const peerName = value.contacts?.find((c) => c.wa_id === peerPhoneRaw)?.profile?.name;

  const isPlatform = !process.env.WA_PLATFORM_PHONE_NUMBER_ID || phoneNumberId === process.env.WA_PLATFORM_PHONE_NUMBER_ID;

  let accessToken: string;
  let businessId: Id<'businesses'> | null = null;
  let kind: 'customer' | 'owner' | 'onboarding' = 'onboarding';

  if (isPlatform) {
    accessToken = process.env.WA_PLATFORM_TOKEN ?? '';
    // Check if peer is an existing business owner
    const existingBusinessByOwner: Doc<'businesses'> | null = await ctx.runQuery(internal.agents.onboardingDb.businessByOwnerPhone, { peerPhone });
    if (existingBusinessByOwner) {
      businessId = existingBusinessByOwner._id;
      kind = 'owner';
    }
  } else {
    const account: Doc<'whatsappAccounts'> | null = await ctx.runQuery(internal.whatsapp.messagesDb.getAccountByPhoneNumberId, { phoneNumberId });
    if (!account || account.status !== 'connected') return;
    accessToken = account.accessToken;
    businessId = account.businessId;
    const business = await ctx.runQuery(internal.businesses.getInternal, {
      businessId: account.businessId,
    });
    kind = business && business.ownerPhone === peerPhone ? 'owner' : 'customer';
  }

  // Handle voice notes / audio messages with Whisper transcription
  let text = message.text?.body ?? '';
  let mediaStorageId: Id<'_storage'> | undefined;
  let mediaType: string | undefined;

  const audioId = message.audio?.id || message.voice?.id;
  if ((message.type === 'audio' || message.type === 'voice') && audioId) {
    const stored = await storeInboundMedia(ctx, {
      mediaId: audioId,
      accessToken,
    });
    mediaStorageId = stored ?? undefined;
    mediaType = message.audio?.mime_type || message.voice?.mime_type || 'audio/ogg';
    
    // Transcribe speech
    const transcript = await transcribeInboundAudio({
      mediaId: audioId,
      accessToken,
    });
    text = transcript ?? '[Voice Note - transcription unavailable]';
  } else if (message.type === 'image' && message.image) {
    const stored = await storeInboundMedia(ctx, {
      mediaId: message.image.id,
      accessToken,
    });
    mediaStorageId = stored ?? undefined;
    mediaType = message.image.mime_type;
    text = message.image.caption ?? '[customer sent an image]';
  } else if (message.type === 'document' && message.document) {
    const stored = await storeInboundMedia(ctx, {
      mediaId: message.document.id,
      accessToken,
    });
    mediaStorageId = stored ?? undefined;
    mediaType = message.document.mime_type;
    text = message.document.caption ?? '[customer sent a document]';
  } else if (message.type !== 'text') {
    text = `[unsupported message type: ${message.type}]`;
  }

  // Check for Single-Number Shop Prefix (e.g., "Order from @shinwari", "Shop: biryani-house")
  if (isPlatform && kind !== 'owner') {
    const shopPrefixMatch = text.match(/^(?:order from|shop|dukan|store)\s*[:@]?\s*([a-zA-Z0-9-]+)/i);
    if (shopPrefixMatch) {
      const slug = shopPrefixMatch[1].toLowerCase();
      const matchedBusiness = await ctx.runQuery(internal.whatsapp.messagesDb.getBusinessBySlug, { slug });
      if (matchedBusiness) {
        businessId = matchedBusiness._id;
        kind = 'customer';
      }
    }
  }

  const conversationId: Id<'conversations'> = await ctx.runMutation(internal.whatsapp.messagesDb.upsertConversation, {
    channelPhoneNumberId: phoneNumberId,
    peerPhone,
    kind,
    businessId: businessId ?? undefined,
    peerName,
    markInbound: true,
  });

  await ctx.runMutation(internal.whatsapp.messagesDb.insertMessage, {
    conversationId,
    direction: 'in',
    role: 'user',
    text,
    waMessageId: message.id,
    mediaStorageId,
    mediaType,
  });

  const conversation = await ctx.runQuery(internal.whatsapp.messagesDb.getConversation, { conversationId });

  // Human-in-the-loop control commands (/bot or start bot to resume)
  const trimmed = text.trim().toLowerCase();
  if (trimmed === '/bot' || trimmed === 'start bot' || trimmed === 'bot on') {
    await ctx.runMutation(internal.whatsapp.messagesDb.setBotPaused, { conversationId, isBotPaused: false });
    await sendText(ctx, {
      phoneNumberId,
      accessToken,
      conversationId,
      to: peerPhone,
      text: '🤖 Karobari AI Assistant dobara active ho gaya hai.',
    });
    return;
  }

  if (trimmed === '/pause' || trimmed === 'stop bot' || trimmed === 'bot off') {
    await ctx.runMutation(internal.whatsapp.messagesDb.setBotPaused, { conversationId, isBotPaused: true });
    await sendText(ctx, {
      phoneNumberId,
      accessToken,
      conversationId,
      to: peerPhone,
      text: '⏸️ Karobari AI Assistant pause ho gaya hai. Dobara shuru karne ke liye "/bot" likhein.',
    });
    return;
  }

  // If conversation is paused by human, do not run AI agents
  if (conversation?.isBotPaused) {
    return;
  }

  if (kind === 'onboarding') {
    await ctx.runAction(internal.agents.onboardingAgent.run, {
      conversationId,
      phoneNumberId,
      accessToken,
      peerPhone,
      text,
    });
  } else if (kind === 'owner' && businessId) {
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

