import { mutation } from "../_generated/server";

import { requireOwner } from "../lib/access";
import { v } from "convex/values";

export const saveBusinessAccount = mutation({
  args: {
    wabaId: v.string(),
    phoneNumberId: v.string(),
    displayPhoneNumber: v.string(),
    accessToken: v.string(),
    pin: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const existing = await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .first();
    const doc = {
      businessId: business._id,
      wabaId: args.wabaId,
      phoneNumberId: args.phoneNumberId,
      displayPhoneNumber: args.displayPhoneNumber,
      accessToken: args.accessToken,
      pin: args.pin,
      status: "connected" as const,
      connectedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.replace("whatsappAccounts", existing._id, doc);
    } else {
      await ctx.db.insert("whatsappAccounts", doc);
    }
    return null;
  },
});
