import { action } from "./_generated/server";
import { v } from "convex/values";
import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

const catalogSchema = z.object({
  categories: z.array(
    z.object({
      name: z.string().describe("Category name, e.g. 'BBQ'. Empty string if uncategorized."),
      items: z.array(
        z.object({
          name: z.string(),
          description: z
            .string()
            .optional()
            .describe("Short description if present in the text"),
          priceRupees: z.number().describe("Price in Pakistani rupees"),
          discountPct: z
            .number()
            .optional()
            .describe("Discount percentage if mentioned"),
        }),
      ),
    }),
  ),
});

/**
 * Parse a free-form pasted menu / product list (English, Urdu, or Roman Urdu)
 * into a structured catalog. Used by the dashboard import page and reused by
 * the WhatsApp onboarding agent.
 */
export const importFromText = action({
  args: { text: v.string() },
  returns: v.object({
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
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await parseCatalogText(args.text);
  },
});

/** Shared parser also used internally by the WhatsApp onboarding agent. */
export async function parseCatalogText(text: string) {
  const { object } = await generateObject({
    model: openai("gpt-5-mini"),
    schema: catalogSchema,
    system:
      "You convert a Pakistani small business's pasted product/menu list into a structured catalog. " +
      "The text may be in English, Urdu script, or Roman Urdu, in any messy format. " +
      "Rules: prices are in Pakistani rupees (interpret '450', 'Rs. 450', '450 rs' all as 450). " +
      "If an item has variants with different prices (e.g. 'full 400, half 250'), create separate items " +
      "like 'Shinwari Pulao (Full)' and 'Shinwari Pulao (Half)'. " +
      "Group items under the categories given in the text; if none, use one category with an empty name. " +
      "Never invent items or prices that are not in the text. Skip lines without a price.",
    prompt: text,
  });
  // Drop items the model may have emitted with invalid prices.
  const categories = object.categories
    .map((c) => ({
      ...c,
      items: c.items.filter(
        (i) => Number.isFinite(i.priceRupees) && i.priceRupees > 0,
      ),
    }))
    .filter((c) => c.items.length > 0);
  return { categories };
}
