import { action, internalMutation, internalQuery } from "../_generated/server";

import type { Id } from "../_generated/dataModel";
import { internal } from "../_generated/api";
import { requireOwner } from "../lib/access";
import { v } from "convex/values";

const GRAPH_BASE = "https://graph.facebook.com/v23.0";

export const ownerBusinessIdInternal = internalQuery({
  args: {},
  handler: async (ctx): Promise<Id<"businesses"> | null> => {
    try {
      const { business } = await requireOwner(ctx);
      return business._id;
    } catch {
      return null;
    }
  },
});

export const saveAccountInternal = internalMutation({
  args: {
    businessId: v.id("businesses"),
    wabaId: v.string(),
    phoneNumberId: v.string(),
    displayPhoneNumber: v.string(),
    accessToken: v.string(),
    pin: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("connected"),
      v.literal("error"),
    ),
    lastError: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .first();
    const doc = {
      businessId: args.businessId,
      wabaId: args.wabaId,
      phoneNumberId: args.phoneNumberId,
      displayPhoneNumber: args.displayPhoneNumber,
      accessToken: args.accessToken,
      pin: args.pin,
      status: args.status,
      connectedAt: Date.now(),
      lastError: args.lastError,
    };
    if (existing) {
      await ctx.db.replace("whatsappAccounts", existing._id, doc);
    } else {
      await ctx.db.insert("whatsappAccounts", doc);
    }
    return null;
  },
});

export const exchangeCode = action({
  args: {
    code: v.string(),
    wabaId: v.string(),
    phoneNumberId: v.string(),
  },
  returns: v.object({ displayPhoneNumber: v.string() }),
  handler: async (ctx, args) => {
    const businessId = await ctx.runQuery(
      internal.whatsapp.embeddedSignup.ownerBusinessIdInternal,
      {},
    );
    if (!businessId) throw new Error("Not authorized");

    const appId = process.env.NEXT_PUBLIC_META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    if (!appId || !appSecret) {
      throw new Error("META_APP_ID / META_APP_SECRET not configured");
    }

    const tokenRes = await fetch(
      `${GRAPH_BASE}/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${encodeURIComponent(args.code)}`,
    );
    const tokenJson = await tokenRes.json();
    if (!tokenRes.ok || !tokenJson.access_token) {
      throw new Error(tokenJson?.error?.message ?? "Token exchange failed");
    }
    const accessToken: string = tokenJson.access_token;

    const subRes = await fetch(`${GRAPH_BASE}/${args.wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!subRes.ok) {
      throw new Error(`App subscription failed: ${await subRes.text()}`);
    }

    const pin = String(Math.floor(100000 + Math.random() * 900000));
    const registerRes = await fetch(
      `${GRAPH_BASE}/${args.phoneNumberId}/register`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messaging_product: "whatsapp", pin }),
      },
    );
    if (!registerRes.ok) {
      const body = await registerRes.text();
      if (!body.includes("already")) {
        throw new Error(`Number registration failed: ${body}`);
      }
    }

    const infoRes = await fetch(
      `${GRAPH_BASE}/${args.phoneNumberId}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const info = await infoRes.json();
    const displayPhoneNumber: string = info.display_phone_number ?? "unknown";

    await ctx.runMutation(
      internal.whatsapp.embeddedSignup.saveAccountInternal,
      {
        businessId,
        wabaId: args.wabaId,
        phoneNumberId: args.phoneNumberId,
        displayPhoneNumber,
        accessToken,
        pin,
        status: "connected",
      },
    );
    return { displayPhoneNumber };
  },
});
