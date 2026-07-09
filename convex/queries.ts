import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Add a new contact submission from visitors
export const submitQuery = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    businessName: v.optional(v.string()),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const queryId = await ctx.db.insert("contactQueries", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      businessName: args.businessName,
      message: args.message,
      status: "new",
      createdAt: Date.now(),
    });
    return queryId;
  },
});

// Retrieve contact queries for the super admin portal
export const getQueries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("contactQueries")
      .withIndex("by_status")
      .order("desc")
      .collect();
  },
});
