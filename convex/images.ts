import { action, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { internalQuery } from "./_generated/server";

const GEMINI_IMAGE_MODEL = "gemini-2.5-flash-image";

async function generateImageBytes(prompt: string): Promise<{
  bytes: Uint8Array;
  mimeType: string;
}> {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_IMAGE_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE"] },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`Gemini image generation failed: ${await res.text()}`);
  }
  const json = await res.json();
  const part = json.candidates?.[0]?.content?.parts?.find(
    (p: { inlineData?: { data: string } }) => p.inlineData,
  );
  if (!part) throw new Error("Gemini returned no image");
  const b64: string = part.inlineData.data;
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return { bytes, mimeType: part.inlineData.mimeType ?? "image/png" };
}

export const itemInternal = internalQuery({
  args: { itemId: v.id("catalogItems") },
  handler: async (ctx, args) => {
    return await ctx.db.get("catalogItems", args.itemId);
  },
});

export const setItemImageInternal = internalMutation({
  args: {
    itemId: v.id("catalogItems"),
    storageId: v.optional(v.id("_storage")),
    status: v.union(
      v.literal("none"),
      v.literal("generating"),
      v.literal("ready"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("catalogItems", args.itemId, {
      imageStorageId: args.storageId,
      imageStatus: args.status,
    });
    return null;
  },
});

export const setHeroImageInternal = internalMutation({
  args: { businessId: v.id("businesses"), storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const site = await ctx.db
      .query("siteContent")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .unique();
    if (site) {
      await ctx.db.patch("siteContent", site._id, {
        heroImageStorageId: args.storageId,
      });
    }
    return null;
  },
});

export const generateItemImage = action({
  args: {
    itemId: v.id("catalogItems"),
    extraPrompt: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const item = await ctx.runQuery(internal.images.itemInternal, {
      itemId: args.itemId,
    });
    if (!item) throw new Error("Item not found");
    const business = await ctx.runQuery(internal.businesses.getInternal, {
      businessId: item.businessId,
    });

    await ctx.runMutation(internal.images.setItemImageInternal, {
      itemId: args.itemId,
      storageId: item.imageStorageId,
      status: "generating",
    });
    try {
      const prompt =
        `Professional food/product photography for a Pakistani ${business?.category ?? "shop"}: ` +
        `"${item.name}"${item.description ? ` — ${item.description}` : ""}. ` +
        "Appetizing, realistic, warm lighting, shallow depth of field, on a clean rustic surface, " +
        "square composition, no text or watermarks." +
        (args.extraPrompt ? ` ${args.extraPrompt}` : "");
      const { bytes, mimeType } = await generateImageBytes(prompt);
      const blob = new Blob([bytes as BlobPart], { type: mimeType });
      const storageId = await ctx.storage.store(blob);
      await ctx.runMutation(internal.images.setItemImageInternal, {
        itemId: args.itemId,
        storageId,
        status: "ready",
      });
    } catch (e) {
      await ctx.runMutation(internal.images.setItemImageInternal, {
        itemId: args.itemId,
        storageId: item.imageStorageId,
        status: item.imageStorageId ? "ready" : "none",
      });
      throw e;
    }
    return null;
  },
});

export const generateHeroImage = action({
  args: { businessId: v.id("businesses") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const business = await ctx.runQuery(internal.businesses.getInternal, {
      businessId: args.businessId,
    });
    if (!business) throw new Error("Business not found");
    const { bytes, mimeType } = await generateImageBytes(
      `Wide atmospheric hero banner photo for a Pakistani ${business.category} named "${business.name}". ` +
        `${business.description}. Cinematic, warm, inviting, high quality, no text or watermarks, 16:9.`,
    );
    const blob = new Blob([bytes as BlobPart], { type: mimeType });
    const storageId = await ctx.storage.store(blob);
    await ctx.runMutation(internal.images.setHeroImageInternal, {
      businessId: args.businessId,
      storageId,
    });
    return null;
  },
});
