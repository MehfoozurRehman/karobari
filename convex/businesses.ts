import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { businessCategory, paymentSettings } from "./schema";
import { getCurrentUser, requireOwner } from "./lib/access";
import { normalizePkPhone } from "./lib/phone";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

const RESERVED_SLUGS = new Set([
  "www", "app", "api", "admin", "dashboard", "mail", "smtp", "blog",
  "help", "docs", "status", "dev", "staging",
]);

/** Find a free slug, appending -2, -3, ... on collision. Shared helper. */
export async function allocateSlug(
  ctx: { db: { query: (t: "businesses") => any } },
  name: string,
): Promise<string> {
  const base = slugify(name) || "shop";
  let candidate = base;
  for (let i = 2; i < 100; i++) {
    if (!RESERVED_SLUGS.has(candidate)) {
      const clash = await ctx.db
        .query("businesses")
        .withIndex("by_slug", (q: any) => q.eq("slug", candidate))
        .unique();
      if (!clash) return candidate;
    }
    candidate = `${base}-${i}`;
  }
  throw new Error("Could not allocate slug");
}

export const create = mutation({
  args: {
    name: v.string(),
    category: businessCategory,
    description: v.string(),
    ownerPhone: v.string(),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    hours: v.optional(v.string()),
    deliveryInfo: v.optional(v.string()),
    themeId: v.string(),
    paymentSettings,
  },
  returns: v.object({ businessId: v.id("businesses"), slug: v.string() }),
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.businessId) throw new Error("You already have a business");

    const ownerPhone = normalizePkPhone(args.ownerPhone);
    if (!ownerPhone) throw new Error("Invalid Pakistani phone number");

    const slug = await allocateSlug(ctx, args.name);
    const businessId = await ctx.db.insert("businesses", {
      slug,
      name: args.name,
      category: args.category,
      description: args.description,
      ownerUserId: user._id,
      ownerPhone,
      city: args.city,
      address: args.address,
      hours: args.hours,
      deliveryInfo: args.deliveryInfo,
      status: "active",
      createdVia: "web",
      themeId: args.themeId,
      paymentSettings: args.paymentSettings,
      freeOrdersUsed: 0,
      lifetimeCompletedOrders: 0,
      nextOrderNumber: 1001,
    });
    await ctx.db.patch("users", user._id, { businessId });
    return { businessId, slug };
  },
});

export const update = mutation({
  args: {
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    category: v.optional(businessCategory),
    city: v.optional(v.string()),
    address: v.optional(v.string()),
    hours: v.optional(v.string()),
    deliveryInfo: v.optional(v.string()),
    ownerPhone: v.optional(v.string()),
    themeId: v.optional(v.string()),
    paymentSettings: v.optional(paymentSettings),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const patch: Record<string, unknown> = {};
    for (const key of [
      "name", "description", "category", "city", "address",
      "hours", "deliveryInfo", "themeId", "paymentSettings",
    ] as const) {
      if (args[key] !== undefined) patch[key] = args[key];
    }
    if (args.ownerPhone !== undefined) {
      const phone = normalizePkPhone(args.ownerPhone);
      if (!phone) throw new Error("Invalid Pakistani phone number");
      patch.ownerPhone = phone;
    }
    await ctx.db.patch("businesses", business._id, patch);
    return null;
  },
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user?.businessId) return null;
    const business = await ctx.db.get("businesses", user.businessId);
    if (!business) return null;
    const whatsapp = await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .first();
    return { ...business, whatsapp };
  },
});

/** Resolve a storefront tenant: subdomain slug or a full custom domain. */
export const getByTenant = query({
  args: { tenant: v.string() },
  handler: async (ctx, args) => {
    const tenant = args.tenant.toLowerCase();
    let business = await ctx.db
      .query("businesses")
      .withIndex("by_slug", (q) => q.eq("slug", tenant))
      .unique();
    if (!business && tenant.includes(".")) {
      const domain = await ctx.db
        .query("customDomains")
        .withIndex("by_domain", (q) => q.eq("domain", tenant))
        .unique();
      if (domain && domain.status === "active") {
        business = await ctx.db.get("businesses", domain.businessId);
      }
    }
    if (!business) return null;

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
    const site = await ctx.db
      .query("siteContent")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .unique();
    const heroImageUrl = site?.heroImageStorageId
      ? await ctx.storage.getUrl(site.heroImageStorageId)
      : null;
    const whatsapp = await ctx.db
      .query("whatsappAccounts")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .first();

    return {
      business: {
        _id: business._id,
        slug: business.slug,
        name: business.name,
        category: business.category,
        description: business.description,
        city: business.city,
        address: business.address,
        hours: business.hours,
        deliveryInfo: business.deliveryInfo,
        status: business.status,
        themeId: business.themeId,
        paymentSettings: business.paymentSettings,
      },
      whatsappNumber:
        whatsapp?.status === "connected"
          ? whatsapp.displayPhoneNumber.replace(/\D/g, "")
          : null,
      categories: categories.sort((a, b) => a.sortOrder - b.sortOrder),
      items: itemsWithUrls.sort((a, b) => a.sortOrder - b.sortOrder),
      siteContent: site?.content ?? null,
      heroImageUrl,
    };
  },
});

export const getInternal = internalQuery({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    return await ctx.db.get("businesses", args.businessId);
  },
});

export const setStatusInternal = internalMutation({
  args: {
    businessId: v.id("businesses"),
    status: v.union(
      v.literal("onboarding"),
      v.literal("active"),
      v.literal("grace"),
      v.literal("suspended"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("businesses", args.businessId, {
      status: args.status,
      suspendedAt: args.status === "suspended" ? Date.now() : undefined,
    });
    return null;
  },
});
