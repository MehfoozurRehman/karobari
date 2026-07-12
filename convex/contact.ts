import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    businessName: v.optional(v.string()),
    message: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("contactQueries", { ...args, status: "new" });
    return null;
  },
});

export const listForAdmin = query({
  args: {
    status: v.optional(
      v.union(v.literal("new"), v.literal("replied"), v.literal("closed")),
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (me?.role !== "admin") throw new Error("Not authorized");
    if (args.status !== undefined) {
      const status = args.status;
      return await ctx.db
        .query("contactQueries")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(200);
    }
    return await ctx.db.query("contactQueries").order("desc").take(200);
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("contactQueries"),
    status: v.union(v.literal("new"), v.literal("replied"), v.literal("closed")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const me = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (me?.role !== "admin") throw new Error("Not authorized");
    await ctx.db.patch("contactQueries", args.id, { status: args.status });
    return null;
  },
});
