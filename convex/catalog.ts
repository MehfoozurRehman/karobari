import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwner } from "./lib/access";

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const { business } = await requireOwner(ctx);
    const categories = await ctx.db
      .query("catalogCategories")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .take(100);
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .take(500);
    const itemsWithUrls = await Promise.all(
      items.map(async (item) => ({
        ...item,
        imageUrl: item.imageStorageId
          ? await ctx.storage.getUrl(item.imageStorageId)
          : null,
      })),
    );
    return {
      categories: categories.sort((a, b) => a.sortOrder - b.sortOrder),
      items: itemsWithUrls.sort((a, b) => a.sortOrder - b.sortOrder),
    };
  },
});

export const createCategory = mutation({
  args: { name: v.string() },
  returns: v.id("catalogCategories"),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const existing = await ctx.db
      .query("catalogCategories")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .take(100);
    return await ctx.db.insert("catalogCategories", {
      businessId: business._id,
      name: args.name,
      sortOrder: existing.length,
    });
  },
});

export const renameCategory = mutation({
  args: { categoryId: v.id("catalogCategories"), name: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const category = await ctx.db.get("catalogCategories", args.categoryId);
    if (!category || category.businessId !== business._id)
      throw new Error("Category not found");
    await ctx.db.patch("catalogCategories", args.categoryId, {
      name: args.name,
    });
    return null;
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("catalogCategories") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const category = await ctx.db.get("catalogCategories", args.categoryId);
    if (!category || category.businessId !== business._id)
      throw new Error("Category not found");
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_businessId_and_categoryId", (q) =>
        q.eq("businessId", business._id).eq("categoryId", args.categoryId),
      )
      .take(500);
    for (const item of items) {
      await ctx.db.patch("catalogItems", item._id, { categoryId: undefined });
    }
    await ctx.db.delete("catalogCategories", args.categoryId);
    return null;
  },
});

export const createItem = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    pricePaisa: v.number(),
    discountPct: v.optional(v.number()),
    categoryId: v.optional(v.id("catalogCategories")),
    available: v.optional(v.boolean()),
  },
  returns: v.id("catalogItems"),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    if (args.pricePaisa < 0) throw new Error("Price cannot be negative");
    const existing = await ctx.db
      .query("catalogItems")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .take(500);
    return await ctx.db.insert("catalogItems", {
      businessId: business._id,
      categoryId: args.categoryId,
      name: args.name,
      description: args.description,
      pricePaisa: Math.round(args.pricePaisa),
      discountPct: args.discountPct,
      imageStatus: "none",
      available: args.available ?? true,
      sortOrder: existing.length,
    });
  },
});

export const updateItem = mutation({
  args: {
    itemId: v.id("catalogItems"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    pricePaisa: v.optional(v.number()),
    discountPct: v.optional(v.union(v.number(), v.null())),
    categoryId: v.optional(v.union(v.id("catalogCategories"), v.null())),
    available: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const item = await ctx.db.get("catalogItems", args.itemId);
    if (!item || item.businessId !== business._id)
      throw new Error("Item not found");
    const patch: Record<string, unknown> = {};
    if (args.name !== undefined) patch.name = args.name;
    if (args.description !== undefined) patch.description = args.description;
    if (args.pricePaisa !== undefined) {
      if (args.pricePaisa < 0) throw new Error("Price cannot be negative");
      patch.pricePaisa = Math.round(args.pricePaisa);
    }
    if (args.discountPct !== undefined)
      patch.discountPct = args.discountPct === null ? undefined : args.discountPct;
    if (args.categoryId !== undefined)
      patch.categoryId = args.categoryId === null ? undefined : args.categoryId;
    if (args.available !== undefined) patch.available = args.available;
    await ctx.db.patch("catalogItems", args.itemId, patch);
    return null;
  },
});

export const deleteItem = mutation({
  args: { itemId: v.id("catalogItems") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const item = await ctx.db.get("catalogItems", args.itemId);
    if (!item || item.businessId !== business._id)
      throw new Error("Item not found");
    await ctx.db.delete("catalogItems", args.itemId);
    return null;
  },
});

export const bulkImport = mutation({
  args: {
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
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    await bulkImportForBusiness(ctx, business._id, args.categories);
    return null;
  },
});

export const bulkImportInternal = internalMutation({
  args: {
    businessId: v.id("businesses"),
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
  returns: v.null(),
  handler: async (ctx, args) => {
    await bulkImportForBusiness(ctx, args.businessId, args.categories);
    return null;
  },
});

import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

async function bulkImportForBusiness(
  ctx: MutationCtx,
  businessId: Id<"businesses">,
  categories: Array<{
    name: string;
    items: Array<{
      name: string;
      description?: string;
      priceRupees: number;
      discountPct?: number;
    }>;
  }>,
) {
  const existingCategories = await ctx.db
    .query("catalogCategories")
    .withIndex("by_businessId", (q) => q.eq("businessId", businessId))
    .take(100);
  const existingItems = await ctx.db
    .query("catalogItems")
    .withIndex("by_businessId", (q) => q.eq("businessId", businessId))
    .take(500);
  let categorySort = existingCategories.length;
  let itemSort = existingItems.length;

  for (const category of categories) {
    let categoryId: Id<"catalogCategories"> | undefined = existingCategories.find(
      (c) => c.name.toLowerCase() === category.name.toLowerCase(),
    )?._id;
    if (!categoryId && category.name) {
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
}
