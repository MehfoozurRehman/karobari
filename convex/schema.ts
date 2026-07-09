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
});
