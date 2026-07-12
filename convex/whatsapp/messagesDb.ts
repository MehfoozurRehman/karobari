import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

export const upsertConversation = internalMutation({
  args: {
    channelPhoneNumberId: v.string(),
    peerPhone: v.string(),
    kind: v.union(
      v.literal("customer"),
      v.literal("owner"),
      v.literal("onboarding"),
    ),
    businessId: v.optional(v.id("businesses")),
    peerName: v.optional(v.string()),
    markInbound: v.boolean(),
  },
  returns: v.id("conversations"),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_channelPhoneNumberId_and_peerPhone", (q) =>
        q
          .eq("channelPhoneNumberId", args.channelPhoneNumberId)
          .eq("peerPhone", args.peerPhone),
      )
      .unique();
    if (existing) {
      await ctx.db.patch("conversations", existing._id, {
        kind: args.kind,
        businessId: args.businessId ?? existing.businessId,
        peerName: args.peerName ?? existing.peerName,
        ...(args.markInbound ? { lastInboundAt: Date.now() } : {}),
      });
      return existing._id;
    }
    return await ctx.db.insert("conversations", {
      channelPhoneNumberId: args.channelPhoneNumberId,
      peerPhone: args.peerPhone,
      kind: args.kind,
      businessId: args.businessId,
      peerName: args.peerName,
      lastInboundAt: args.markInbound ? Date.now() : 0,
    });
  },
});

export const getConversation = internalQuery({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get("conversations", args.conversationId);
  },
});

export const hasInboundMessage = internalQuery({
  args: { waMessageId: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("messages")
      .withIndex("by_waMessageId", (q) => q.eq("waMessageId", args.waMessageId))
      .first();
    return existing !== null;
  },
});

export const insertMessage = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    direction: v.union(v.literal("in"), v.literal("out")),
    role: v.union(
      v.literal("user"),
      v.literal("assistant"),
      v.literal("tool"),
      v.literal("system"),
    ),
    text: v.optional(v.string()),
    waMessageId: v.optional(v.string()),
    mediaStorageId: v.optional(v.id("_storage")),
    mediaType: v.optional(v.string()),
    toolCalls: v.optional(v.any()),
  },
  returns: v.id("messages"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", args);
  },
});

export const recentMessages = internalQuery({
  args: { conversationId: v.id("conversations"), limit: v.number() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .order("desc")
      .take(args.limit);
    return rows.reverse();
  },
});

export const setAgentState = internalMutation({
  args: { conversationId: v.id("conversations"), agentState: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("conversations", args.conversationId, {
      agentState: args.agentState,
    });
    return null;
  },
});

export const getAccountByPhoneNumberId = internalQuery({
  args: { phoneNumberId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_phoneNumberId", (q) =>
        q.eq("phoneNumberId", args.phoneNumberId),
      )
      .unique();
  },
});
