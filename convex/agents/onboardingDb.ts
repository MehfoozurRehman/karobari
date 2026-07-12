import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { allocateSlug } from "../businesses";
import { businessCategory } from "../schema";
import type { Id } from "../_generated/dataModel";

export const getSession = internalQuery({
  args: { peerPhone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("onboardingSessions")
      .withIndex("by_peerPhone", (q) => q.eq("peerPhone", args.peerPhone))
      .unique();
  },
});

export const upsertSession = internalMutation({
  args: {
    peerPhone: v.string(),
    step: v.union(
      v.literal("name"),
      v.literal("category"),
      v.literal("description"),
      v.literal("catalog"),
      v.literal("payments"),
      v.literal("confirm"),
      v.literal("done"),
    ),
    draft: v.any(),
    businessId: v.optional(v.id("businesses")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("onboardingSessions")
      .withIndex("by_peerPhone", (q) => q.eq("peerPhone", args.peerPhone))
      .unique();
    if (existing) {
      await ctx.db.patch("onboardingSessions", existing._id, {
        step: args.step,
        draft: args.draft,
        businessId: args.businessId ?? existing.businessId,
      });
    } else {
      await ctx.db.insert("onboardingSessions", args);
    }
    return null;
  },
});

export const businessByOwnerPhone = internalQuery({
  args: { peerPhone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("businesses")
      .withIndex("by_ownerPhone", (q) => q.eq("ownerPhone", args.peerPhone))
      .first();
  },
});

export const registerBusiness = internalMutation({
  args: {
    peerPhone: v.string(),
    name: v.string(),
    category: businessCategory,
    description: v.string(),
    city: v.optional(v.string()),
    easypaisa: v.optional(
      v.object({ accountName: v.string(), number: v.string() }),
    ),
    jazzcash: v.optional(
      v.object({ accountName: v.string(), number: v.string() }),
    ),
    categories: v.array(
      v.object({
        name: v.string(),
        items: v.array(
          v.object({
            name: v.string(),
            description: v.optional(v.string()),
            priceRupees: v.number(),
            discountPct: v.optional(v.number()),
          }),
        ),
      }),
    ),
  },
  returns: v.object({ businessId: v.id("businesses"), slug: v.string() }),
  handler: async (ctx, args) => {
    const slug = await allocateSlug(ctx, args.name);
    const businessId: Id<"businesses"> = await ctx.db.insert("businesses", {
      slug,
      name: args.name,
      category: args.category,
      description: args.description,
      ownerPhone: args.peerPhone,
      city: args.city,
      status: "active",
      createdVia: "whatsapp",
      themeId: "classic",
      paymentSettings: {
        codEnabled: true,
        easypaisa: args.easypaisa,
        jazzcash: args.jazzcash,
      },
      freeOrdersUsed: 0,
      lifetimeCompletedOrders: 0,
      nextOrderNumber: 1001,
    });

    let categorySort = 0;
    let itemSort = 0;
    for (const category of args.categories) {
      let categoryId: Id<"catalogCategories"> | undefined;
      if (category.name) {
        categoryId = await ctx.db.insert("catalogCategories", {
          businessId,
          name: category.name,
          sortOrder: categorySort++,
        });
      }
      for (const item of category.items) {
        await ctx.db.insert("catalogItems", {
          businessId,
          categoryId,
          name: item.name,
          description: item.description,
          pricePaisa: Math.round(item.priceRupees * 100),
          discountPct: item.discountPct,
          imageStatus: "none",
          available: true,
          sortOrder: itemSort++,
        });
      }
    }

    const session = await ctx.db
      .query("onboardingSessions")
      .withIndex("by_peerPhone", (q) => q.eq("peerPhone", args.peerPhone))
      .unique();
    if (session) {
      await ctx.db.patch("onboardingSessions", session._id, {
        step: "done",
        businessId,
      });
    }
    return { businessId, slug };
  },
});
