import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  // Contact queries submitted by visitors/businesses
  contactQueries: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    businessName: v.optional(v.string()),
    message: v.string(),
    status: v.union(v.literal("new"), v.literal("resolved"), v.literal("ignored")),
    createdAt: v.number(),
  }).index("by_status", ["status"]),

  // Refined Multi-Tenant Business Registry Table
  businesses: defineTable({
    name: v.string(),             // e.g. "Khyber Shinwari"
    slug: v.string(),             // e.g. "khyber-shinwari" (used for subdomain / URL routing)
    logoUrl: v.optional(v.string()), // Business Logo Image URL
    industry: v.string(),         // e.g. "restaurant", "salon", "retail"
    status: v.union(v.literal("active"), v.literal("suspended")),
    
    // Owner details
    ownerName: v.string(),
    ownerPhone: v.string(),       // Owner WhatsApp/Phone Number

    // WhatsApp Meta OAuth details
    whatsappBusinessAccountId: v.optional(v.string()),
    whatsappPhoneNumberId: v.optional(v.string()),
    whatsappAccessToken: v.optional(v.string()),
    whatsappConnected: v.boolean(),

    // Payment gateway details (displayed to customers during checkouts)
    paymentGatewayName: v.string(),   // e.g. "EasyPaisa", "JazzCash", "Meezan Bank"
    paymentGatewayNumber: v.string(), // e.g. "03137178074", "1234567890"
    paymentGatewayTitle: v.string(),  // e.g. "Mehfooz ur Rehman"
    
    createdAt: v.number(),
  })
  .index("by_slug", ["slug"])
  .index("by_ownerPhone", ["ownerPhone"]),
});
