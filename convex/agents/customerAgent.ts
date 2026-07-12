import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { z } from "zod";
import { tool } from "ai";
import { runAgent } from "./runAgent";
import type { Id } from "../_generated/dataModel";

export const run = internalAction({
  args: {
    conversationId: v.id("conversations"),
    businessId: v.id("businesses"),
    phoneNumberId: v.string(),
    accessToken: v.string(),
    peerPhone: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const business = await ctx.runQuery(internal.businesses.getInternal, {
      businessId: args.businessId,
    });
    if (!business) return null;

    if (business.status === "suspended") {
      const { sendText } = await import("../whatsapp/send");
      await sendText(ctx, {
        phoneNumberId: args.phoneNumberId,
        accessToken: args.accessToken,
        conversationId: args.conversationId,
        to: args.peerPhone,
        text: `Maazrat, ${business.name} filhaal orders nahi le raha. Baad mein dobara try karein.`,
      });
      return null;
    }

    const rootDomain = process.env.APP_ROOT_DOMAIN ?? "karobari.shop";
    const storeUrl = `https://${business.slug}.${rootDomain}`;

    const tools = {
      get_catalog: tool({
        description:
          "Get the full menu/product list with current prices and discounts.",
        inputSchema: z.object({}),
        execute: async (): Promise<string> => {
          return await ctx.runQuery(internal.agents.ops.catalogText, {
            businessId: args.businessId,
          });
        },
      }),
      get_business_info: tool({
        description:
          "Get business info: address, city, opening hours, delivery info, payment account numbers.",
        inputSchema: z.object({}),
        execute: async (): Promise<string> => {
          const info = await ctx.runQuery(internal.agents.ops.businessInfo, {
            businessId: args.businessId,
          });
          return JSON.stringify(info);
        },
      }),
      place_order: tool({
        description:
          "Place an order once the customer has confirmed items, delivery address, and payment method. " +
          "Only call after explicit confirmation from the customer.",
        inputSchema: z.object({
          items: z.array(
            z.object({
              itemName: z.string().describe("Item name as listed in the catalog"),
              qty: z.number().int().min(1).max(99),
            }),
          ),
          customerName: z.string().optional(),
          customerAddress: z.string().describe("Full delivery address"),
          paymentMethod: z.enum(["cod", "easypaisa", "jazzcash"]),
          note: z.string().optional(),
        }),
        execute: async (input): Promise<string> => {
          try {
            const result = await ctx.runMutation(internal.agents.ops.placeOrder, {
              businessId: args.businessId,
              customerPhone: args.peerPhone,
              customerName: input.customerName,
              customerAddress: input.customerAddress,
              note: input.note,
              paymentMethod: input.paymentMethod,
              items: input.items,
            });
            let text = `Order #${result.orderNumber} placed. Total: Rs. ${Math.round(result.totalPaisa / 100).toLocaleString("en-PK")}. Tracking link: ${storeUrl}/order/${result.trackingToken}`;
            if (result.unresolved.length > 0) {
              text += ` NOTE: these items were not found and were skipped: ${result.unresolved.join(", ")}`;
            }
            return text;
          } catch (e) {
            return e instanceof Error ? e.message : "Order failed.";
          }
        },
      }),
      get_order_status: tool({
        description:
          "Check the status of the customer's recent orders, optionally by order number.",
        inputSchema: z.object({
          orderNumber: z.number().int().optional(),
        }),
        execute: async (input): Promise<string> => {
          return await ctx.runQuery(internal.agents.ops.orderStatusForCustomer, {
            businessId: args.businessId,
            customerPhone: args.peerPhone,
            orderNumber: input.orderNumber,
          });
        },
      }),
    };

    const system =
      `You are the official WhatsApp sales agent for "${business.name}", a Pakistani ${business.category}` +
      `${business.city ? ` in ${business.city}` : ""}. ${business.description}\n\n` +
      "LANGUAGE: Reply in Roman Urdu (Urdu written in English letters), matching the customer's language. " +
      "If they write in English, you may mix English naturally like Pakistani businesses do.\n" +
      "STYLE: Short WhatsApp-style messages. Warm and helpful, like a real shop assistant. Use at most 1-2 emojis. " +
      "Never use markdown formatting like ** or #, plain text only.\n\n" +
      "YOUR JOB:\n" +
      "- Answer questions about products, prices, hours, location, delivery using your tools.\n" +
      "- Take orders: collect items + quantities, delivery address, and payment method (options: cash on delivery" +
      `${business.paymentSettings.easypaisa ? ", EasyPaisa" : ""}${business.paymentSettings.jazzcash ? ", JazzCash" : ""}). ` +
      "Summarize the order with the total and ask for a clear confirmation (haan/confirm) BEFORE calling place_order.\n" +
      "- After placing an order, share the order number and tracking link.\n" +
      "- For wallet payments, share the account details from get_business_info and tell them to submit the TID on the tracking link.\n" +
      `- The full menu is also at ${storeUrl}\n` +
      "- If asked something unrelated to the business, politely steer back.\n" +
      "- Never invent items or prices; always check the catalog tool.";

    await runAgent(ctx, {
      conversationId: args.conversationId,
      phoneNumberId: args.phoneNumberId,
      accessToken: args.accessToken,
      peerPhone: args.peerPhone,
      system,
      tools,
    });
    return null;
  },
});
