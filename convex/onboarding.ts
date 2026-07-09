import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSession = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onboardingSessions")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
  },
});

export const createOrUpdateSession = mutation({
  args: {
    phone: v.string(),
    step: v.union(
      v.literal("idle"),
      v.literal("awaiting_name"),
      v.literal("awaiting_industry"),
      v.literal("awaiting_city"),
      v.literal("awaiting_payment_gateway"),
      v.literal("awaiting_payment_number"),
      v.literal("awaiting_payment_title")
    ),
    businessName: v.optional(v.string()),
    industry: v.optional(v.string()),
    city: v.optional(v.string()),
    paymentGatewayName: v.optional(v.string()),
    paymentGatewayNumber: v.optional(v.string()),
    paymentGatewayTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("onboardingSessions")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        step: args.step,
        businessName: args.businessName !== undefined ? args.businessName : existing.businessName,
        industry: args.industry !== undefined ? args.industry : existing.industry,
        city: args.city !== undefined ? args.city : existing.city,
        paymentGatewayName: args.paymentGatewayName !== undefined ? args.paymentGatewayName : existing.paymentGatewayName,
        paymentGatewayNumber: args.paymentGatewayNumber !== undefined ? args.paymentGatewayNumber : existing.paymentGatewayNumber,
        paymentGatewayTitle: args.paymentGatewayTitle !== undefined ? args.paymentGatewayTitle : existing.paymentGatewayTitle,
        updatedAt: Date.now(),
      });
      return existing._id;
    } else {
      const id = await ctx.db.insert("onboardingSessions", {
        phone: args.phone,
        step: args.step,
        businessName: args.businessName,
        industry: args.industry,
        city: args.city,
        paymentGatewayName: args.paymentGatewayName,
        paymentGatewayNumber: args.paymentGatewayNumber,
        paymentGatewayTitle: args.paymentGatewayTitle,
        updatedAt: Date.now(),
      });
      return id;
    }
  },
});

export const deleteSession = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("onboardingSessions")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const registerBusiness = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    industry: v.string(),
    ownerName: v.string(),
    ownerPhone: v.string(),
    paymentGatewayName: v.string(),
    paymentGatewayNumber: v.string(),
    paymentGatewayTitle: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("businesses", {
      name: args.name,
      slug: args.slug,
      industry: args.industry,
      status: "active",
      ownerName: args.ownerName,
      ownerPhone: args.ownerPhone,
      whatsappConnected: false,
      paymentGatewayName: args.paymentGatewayName,
      paymentGatewayNumber: args.paymentGatewayNumber,
      paymentGatewayTitle: args.paymentGatewayTitle,
      createdAt: Date.now(),
    });
    return id;
  },
});
