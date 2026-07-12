import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { z } from "zod";
import { tool } from "ai";
import { runAgent } from "./runAgent";

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

    const tools = {
      sales_summary: tool({
        description:
          "Get sales summary: revenue, completed orders, tips, top items for today, this week, or this month.",
        inputSchema: z.object({
          range: z.enum(["today", "week", "month"]),
        }),
        execute: async (input): Promise<string> => {
          return await ctx.runQuery(internal.agents.ops.salesSummary, {
            businessId: args.businessId,
            range: input.range,
          });
        },
      }),
      list_active_orders: tool({
        description:
          "List all active (not completed/cancelled) orders with status, customer, and payment info.",
        inputSchema: z.object({}),
        execute: async (): Promise<string> => {
          return await ctx.runQuery(internal.agents.ops.pendingOrdersText, {
            businessId: args.businessId,
          });
        },
      }),
      update_order_status: tool({
        description:
          "Move an order to a new status. Flow: pending → confirmed → preparing → ready → delivered → completed. " +
          "Any active order can be cancelled. Completing an order counts it in sales and billing.",
        inputSchema: z.object({
          orderNumber: z.number().int(),
          status: z.enum([
            "confirmed",
            "preparing",
            "ready",
            "delivered",
            "completed",
            "cancelled",
          ]),
        }),
        execute: async (input): Promise<string> => {
          return await ctx.runMutation(
            internal.agents.ops.updateOrderStatusByNumber,
            {
              businessId: args.businessId,
              orderNumber: input.orderNumber,
              status: input.status,
            },
          );
        },
      }),
      set_item_availability: tool({
        description:
          "Mark a catalog item as available or unavailable (out of stock).",
        inputSchema: z.object({
          itemName: z.string(),
          available: z.boolean(),
        }),
        execute: async (input): Promise<string> => {
          return await ctx.runMutation(internal.agents.ops.setItemAvailability, {
            businessId: args.businessId,
            itemName: input.itemName,
            available: input.available,
          });
        },
      }),
      set_item_price: tool({
        description: "Change the price of a catalog item (in rupees).",
        inputSchema: z.object({
          itemName: z.string(),
          priceRupees: z.number().positive(),
        }),
        execute: async (input): Promise<string> => {
          return await ctx.runMutation(internal.agents.ops.setItemPrice, {
            businessId: args.businessId,
            itemName: input.itemName,
            priceRupees: input.priceRupees,
          });
        },
      }),
      get_catalog: tool({
        description: "Get the current menu/product list with prices.",
        inputSchema: z.object({}),
        execute: async (): Promise<string> => {
          return await ctx.runQuery(internal.agents.ops.catalogText, {
            businessId: args.businessId,
          });
        },
      }),
      billing_status: tool({
        description:
          "Get Karobari platform billing status: free orders left, this month's fees, unpaid invoices.",
        inputSchema: z.object({}),
        execute: async (): Promise<string> => {
          return await ctx.runQuery(internal.agents.ops.billingStatus, {
            businessId: args.businessId,
          });
        },
      }),
    };

    const system =
      `You are the private Karobari assistant for the OWNER of "${business.name}". ` +
      "You are talking to the business owner on their own WhatsApp number.\n\n" +
      "LANGUAGE: Roman Urdu mixed naturally with English, matching how the owner writes. " +
      "Short, direct WhatsApp-style replies. No markdown, plain text. Numbers formatted like Rs. 12,500.\n\n" +
      "YOUR JOB:\n" +
      '- Answer questions like "aaj kitni sales huin?" using sales_summary.\n' +
      "- Show and manage orders (confirm, mark ready/delivered/completed, cancel) — always confirm before cancelling.\n" +
      "- Update item availability and prices on request.\n" +
      "- Report platform billing status when asked about fees or invoices.\n" +
      "- IMPORTANT: mark orders completed only when the owner says they are done/delivered and settled.\n" +
      "- Keep replies compact; summarize instead of dumping raw data.";

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
