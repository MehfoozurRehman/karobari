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

  // Businesses/Tenants registered on the platform
  businesses: defineTable({
    ownerName: v.string(),
    ownerPhone: v.string(), // e.g. "923137178074"
    name: v.string(),       // e.g. "Khyber Shinwari"
    slug: v.string(),       // e.g. "khyber-shinwari" (used for subdomain/routing)
    cities: v.array(v.string()), // e.g. ["Karachi", "Lahore"] (for multi-branch support)
    industry: v.string(),   // e.g. "restaurant", "salon", "hotel", "retail"
    walletType: v.union(v.literal("easypaisa"), v.literal("jazzcash"), v.literal("bank")),
    walletNumber: v.string(),
    walletTitle: v.string(),
    status: v.union(v.literal("active"), v.literal("suspended")),
    createdAt: v.number(),
  })
  .index("by_slug", ["slug"])
  .index("by_ownerPhone", ["ownerPhone"]),

  // Catalog items/products for each business
  products: defineTable({
    businessId: v.id("businesses"),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    discountPrice: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    category: v.string(),    // e.g. "Karahi", "Services"
    inStock: v.boolean(),
    createdAt: v.number(),
  }).index("by_business", ["businessId"]),

  // Customer orders
  orders: defineTable({
    businessId: v.id("businesses"),
    customerName: v.string(),
    customerPhone: v.string(),
    city: v.string(),
    area: v.string(),       // e.g. "DHA Phase 5"
    addressDetails: v.string(), // e.g. "House 42, Street 3, Block Z"
    paymentMethod: v.union(v.literal("cod"), v.literal("easypaisa"), v.literal("jazzcash")),
    paymentTid: v.optional(v.string()), // Transaction ID for mobile wallets
    paymentProofUrl: v.optional(v.string()),
    totalAmount: v.number(),
    status: v.union(
      v.literal("pending_verification"),
      v.literal("preparing"),
      v.literal("out_for_delivery"),
      v.literal("completed"),
      v.literal("cancelled")
    ),
    riderTip: v.optional(v.number()),
    commissionOwed: v.number(), // 2% calculation stored at time of completion
    createdAt: v.number(),
  })
  .index("by_business", ["businessId"])
  .index("by_status", ["status"]),

  // Order items list
  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    unitPrice: v.number(),
  }).index("by_order", ["orderId"]),
});
