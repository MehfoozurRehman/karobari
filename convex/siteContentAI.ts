import { action, internalMutation, mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { requireOwner } from "./lib/access";
import { Id } from "./_generated/dataModel";

const siteContentSchema = z.object({
  hero: z.object({
    headline: z.string().describe("Catchy short headline, may mix English and Roman Urdu"),
    subheadline: z.string(),
    ctaText: z.string().describe("Short button text like 'Order Now'"),
  }),
  about: z.object({ title: z.string(), body: z.string() }),
  highlights: z
    .array(z.object({ title: z.string(), text: z.string() }))
    .length(3),
  seo: z.object({ title: z.string(), description: z.string() }),
});

export const getMine = query({
  args: {},
  handler: async (ctx) => {
    const { business } = await requireOwner(ctx);
    const site = await ctx.db
      .query("siteContent")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .unique();
    return site ?? null;
  },
});

export const saveMine = mutation({
  args: { content: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .unique();
    if (existing) {
      await ctx.db.patch("siteContent", existing._id, {
        content: args.content,
        version: existing.version + 1,
      });
    } else {
      await ctx.db.insert("siteContent", {
        businessId: business._id,
        content: args.content,
        version: 1,
      });
    }
    return null;
  },
});

export const saveInternal = internalMutation({
  args: { businessId: v.id("businesses"), content: v.any() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .unique();
    if (existing) {
      await ctx.db.patch("siteContent", existing._id, {
        content: args.content,
        version: existing.version + 1,
      });
    } else {
      await ctx.db.insert("siteContent", {
        businessId: args.businessId,
        content: args.content,
        version: 1,
      });
    }
    return null;
  },
});

export const generate = action({
  args: { businessId: v.optional(v.id("businesses")) },
  returns: v.any(),
  handler: async (ctx, args) => {
    let businessId = args.businessId;
    if (!businessId) {
      const me: { business: { _id: Id<"businesses"> } | null } | null =
        await ctx.runQuery(internal.siteContentAI.ownerBusinessInternal, {});
      if (!me?.business) throw new Error("No business");
      businessId = me.business._id;
    }
    const business = await ctx.runQuery(internal.businesses.getInternal, {
      businessId,
    });
    if (!business) throw new Error("Business not found");

    const content = await generateSiteContentForBusiness({
      name: business.name,
      category: business.category,
      description: business.description,
      city: business.city,
    });
    await ctx.runMutation(internal.siteContentAI.saveInternal, {
      businessId,
      content,
    });
    return content;
  },
});

import { internalQuery } from "./_generated/server";
import { getCurrentUser } from "./lib/access";

export const ownerBusinessInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user?.businessId) return null;
    const business = await ctx.db.get("businesses", user.businessId);
    return business ? { business: { _id: business._id } } : null;
  },
});

export async function generateSiteContentForBusiness(input: {
  name: string;
  category: string;
  description: string;
  city?: string;
}) {
  const { object } = await generateObject({
    model: openai("gpt-5-mini"),
    schema: siteContentSchema,
    system:
      "You write warm, credible storefront website copy for Pakistani small businesses. " +
      "Audience: local customers on mobile. Tone: friendly, professional. " +
      "Mix English with light Roman Urdu naturally (like Pakistani brands do). Keep everything short and punchy.",
    prompt:
      `Business: ${input.name}\nCategory: ${input.category}\n` +
      `City: ${input.city ?? "Pakistan"}\nDescription: ${input.description}\n\n` +
      "Write the storefront content.",
  });
  return object;
}
