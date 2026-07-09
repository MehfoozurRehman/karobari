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
});
