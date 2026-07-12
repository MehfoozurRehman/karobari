import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser } from "./lib/access";
import { normalizePkPhone } from "./lib/phone";

export const ensureUser = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
    const role = adminEmails.includes(args.email.toLowerCase())
      ? ("admin" as const)
      : ("owner" as const);

    const phone = args.phone ? (normalizePkPhone(args.phone) ?? undefined) : undefined;

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    let userId;
    if (existing) {
      await ctx.db.patch("users", existing._id, {
        email: args.email,
        name: args.name ?? existing.name,
        phone: phone ?? existing.phone,
        role: existing.role === "admin" ? "admin" : role,
      });
      userId = existing._id;
    } else {
      userId = await ctx.db.insert("users", {
        clerkId: identity.subject,
        email: args.email,
        name: args.name,
        phone,
        role,
      });
    }

    const user = await ctx.db.get("users", userId);
    if (user && !user.businessId && user.phone) {
      const business = await ctx.db
        .query("businesses")
        .withIndex("by_ownerPhone", (q) => q.eq("ownerPhone", user.phone!))
        .first();
      if (business && !business.ownerUserId) {
        await ctx.db.patch("businesses", business._id, { ownerUserId: userId });
        await ctx.db.patch("users", userId, { businessId: business._id });
      }
    }
    return null;
  },
});

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    const business = user.businessId
      ? await ctx.db.get("businesses", user.businessId)
      : null;
    return { user, business };
  },
});
