import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  contactQueries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    businessName: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("resolved"), v.literal("ignored")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  businesses: defineTable({
    name: v.string(),
    slug: v.string(),
    logoUrl: v.optional(v.string()),
    industry: v.string(),
    status: v.union(v.literal("active"), v.literal("suspended")),
    
    ownerName: v.string(),
    ownerPhone: v.string(),

    whatsappBusinessAccountId: v.optional(v.string()),
    whatsappPhoneNumberId: v.optional(v.string()),
    whatsappAccessToken: v.optional(v.string()),
    whatsappConnected: v.boolean(),

    paymentGatewayName: v.string(),
    paymentGatewayNumber: v.string(),
    paymentGatewayTitle: v.string(),
    
    createdAt: v.number(),
  })
  .index("by_slug", ["slug"])
  .index("by_ownerPhone", ["ownerPhone"]),

  onboardingSessions: defineTable({
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
    updatedAt: v.number(),
  }).index("by_phone", ["phone"]),
});
