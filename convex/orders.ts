import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { orderStatus } from "./schema";
import { requireOwner } from "./lib/access";
import { normalizePkPhone } from "./lib/phone";
import { recordCompletedOrder } from "./lib/billing";

const orderItemInput = v.object({
  catalogItemId: v.id("catalogItems"),
  qty: v.number(),
});

function generateTrackingToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Shared order creation used by the storefront checkout and the WhatsApp agent. */
export async function createOrderForBusiness(
  ctx: MutationCtx,
  business: Doc<"businesses">,
  args: {
    customerPhone: string;
    customerName?: string;
    customerAddress?: string;
    note?: string;
    source: "storefront" | "whatsapp";
    paymentMethod: "cod" | "easypaisa" | "jazzcash";
    items: Array<{ catalogItemId: Id<"catalogItems">; qty: number }>;
  },
): Promise<{ orderId: Id<"orders">; orderNumber: number; trackingToken: string }> {
  if (business.status === "suspended") {
    throw new Error("This business is currently unavailable");
  }
  const phone = normalizePkPhone(args.customerPhone);
  if (!phone) throw new Error("Invalid Pakistani phone number");
  if (args.items.length === 0) throw new Error("Order has no items");

  let subtotal = 0;
  let discount = 0;
  const lines: Array<{
    catalogItemId: Id<"catalogItems">;
    nameSnapshot: string;
    unitPricePaisa: number;
    qty: number;
    lineTotalPaisa: number;
  }> = [];

  for (const line of args.items) {
    if (!Number.isInteger(line.qty) || line.qty < 1 || line.qty > 99) {
      throw new Error("Invalid quantity");
    }
    const item = await ctx.db.get("catalogItems", line.catalogItemId);
    if (!item || item.businessId !== business._id || !item.available) {
      throw new Error("An item in your cart is no longer available");
    }
    const effectivePrice = item.discountPct
      ? Math.round(item.pricePaisa * (1 - item.discountPct / 100))
      : item.pricePaisa;
    subtotal += item.pricePaisa * line.qty;
    discount += (item.pricePaisa - effectivePrice) * line.qty;
    lines.push({
      catalogItemId: item._id,
      nameSnapshot: item.name,
      unitPricePaisa: effectivePrice,
      qty: line.qty,
      lineTotalPaisa: effectivePrice * line.qty,
    });
  }

  const orderNumber = business.nextOrderNumber;
  await ctx.db.patch("businesses", business._id, {
    nextOrderNumber: orderNumber + 1,
  });

  const trackingToken = generateTrackingToken();
  const orderId = await ctx.db.insert("orders", {
    businessId: business._id,
    orderNumber,
    customerPhone: phone,
    customerName: args.customerName,
    customerAddress: args.customerAddress,
    note: args.note,
    source: args.source,
    status: "pending",
    paymentMethod: args.paymentMethod,
    paymentStatus: "unpaid",
    subtotalPaisa: subtotal,
    discountPaisa: discount,
    totalPaisa: subtotal - discount,
    trackingToken,
  });
  for (const line of lines) {
    await ctx.db.insert("orderItems", {
      orderId,
      businessId: business._id,
      ...line,
    });
  }
  return { orderId, orderNumber, trackingToken };
}

/** Public storefront checkout. */
export const createFromStorefront = mutation({
  args: {
    businessId: v.id("businesses"),
    customerPhone: v.string(),
    customerName: v.string(),
    customerAddress: v.string(),
    note: v.optional(v.string()),
    paymentMethod: v.union(
      v.literal("cod"),
      v.literal("easypaisa"),
      v.literal("jazzcash"),
    ),
    items: v.array(orderItemInput),
  },
  returns: v.object({
    orderNumber: v.number(),
    trackingToken: v.string(),
  }),
  handler: async (ctx, args) => {
    const business = await ctx.db.get("businesses", args.businessId);
    if (!business) throw new Error("Business not found");
    if (
      args.paymentMethod === "cod" &&
      !business.paymentSettings.codEnabled
    ) {
      throw new Error("Cash on delivery is not available for this shop");
    }
    const result = await createOrderForBusiness(ctx, business, {
      ...args,
      source: "storefront",
    });
    return {
      orderNumber: result.orderNumber,
      trackingToken: result.trackingToken,
    };
  },
});

/** Public order tracking by token (no auth). */
export const trackByToken = query({
  args: { trackingToken: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_trackingToken", (q) =>
        q.eq("trackingToken", args.trackingToken),
      )
      .unique();
    if (!order) return null;
    const business = await ctx.db.get("businesses", order.businessId);
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .take(100);
    const rating = await ctx.db
      .query("ratings")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .unique();
    const proof = await ctx.db
      .query("paymentProofs")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .first();
    return {
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        subtotalPaisa: order.subtotalPaisa,
        discountPaisa: order.discountPaisa,
        totalPaisa: order.totalPaisa,
        tipPaisa: order.tipPaisa,
        customerName: order.customerName,
        customerAddress: order.customerAddress,
        createdAt: order._creationTime,
      },
      items: items.map((i) => ({
        name: i.nameSnapshot,
        qty: i.qty,
        unitPricePaisa: i.unitPricePaisa,
        lineTotalPaisa: i.lineTotalPaisa,
      })),
      business: business
        ? {
            name: business.name,
            slug: business.slug,
            paymentSettings: business.paymentSettings,
          }
        : null,
      hasRating: rating !== null,
      proofStatus: proof?.status ?? null,
    };
  },
});

/** Dashboard order list. */
export const listMine = query({
  args: { status: v.optional(orderStatus) },
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const orders = args.status
      ? await ctx.db
          .query("orders")
          .withIndex("by_businessId_and_status", (q) =>
            q.eq("businessId", business._id).eq("status", args.status!),
          )
          .order("desc")
          .take(200)
      : await ctx.db
          .query("orders")
          .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
          .order("desc")
          .take(200);
    return orders;
  },
});

export const getMineById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const order = await ctx.db.get("orders", args.orderId);
    if (!order || order.businessId !== business._id) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .take(100);
    const proofs = await ctx.db
      .query("paymentProofs")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .take(10);
    const proofsWithUrls = await Promise.all(
      proofs.map(async (p) => ({
        ...p,
        screenshotUrl: p.screenshotStorageId
          ? await ctx.storage.getUrl(p.screenshotStorageId)
          : null,
      })),
    );
    const rating = await ctx.db
      .query("ratings")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .unique();
    return { order, items, proofs: proofsWithUrls, rating };
  },
});

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["delivered", "cancelled"],
  delivered: ["completed"],
  completed: [],
  cancelled: [],
};

/** Shared status transition used by dashboard and the owner WhatsApp agent. */
export async function transitionOrderStatus(
  ctx: MutationCtx,
  business: Doc<"businesses">,
  order: Doc<"orders">,
  next: Doc<"orders">["status"],
): Promise<void> {
  if (!STATUS_FLOW[order.status]?.includes(next)) {
    throw new Error(`Cannot move order from ${order.status} to ${next}`);
  }
  if (next === "completed") {
    const ledgerEntryId = await recordCompletedOrder(ctx, business, order);
    await ctx.db.patch("orders", order._id, {
      status: "completed",
      completedAt: Date.now(),
      billedLedgerEntryId: ledgerEntryId ?? undefined,
      // COD is implicitly collected on delivery completion.
      paymentStatus:
        order.paymentMethod === "cod" ? "paid" : order.paymentStatus,
    });
    return;
  }
  await ctx.db.patch("orders", order._id, { status: next });
}

export const updateStatus = mutation({
  args: { orderId: v.id("orders"), status: orderStatus },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const order = await ctx.db.get("orders", args.orderId);
    if (!order || order.businessId !== business._id)
      throw new Error("Order not found");
    await transitionOrderStatus(ctx, business, order, args.status);
    return null;
  },
});

export const markPaid = mutation({
  args: { orderId: v.id("orders") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const order = await ctx.db.get("orders", args.orderId);
    if (!order || order.businessId !== business._id)
      throw new Error("Order not found");
    await ctx.db.patch("orders", args.orderId, { paymentStatus: "paid" });
    return null;
  },
});

/** Sales stats for the dashboard overview and the owner WhatsApp agent. */
export const statsInternal = internalQuery({
  args: {
    businessId: v.id("businesses"),
    sinceMs: v.number(),
  },
  handler: async (ctx, args) => {
    const completed = await ctx.db
      .query("orders")
      .withIndex("by_businessId_and_completedAt", (q) =>
        q.eq("businessId", args.businessId).gte("completedAt", args.sinceMs),
      )
      .take(1000);
    const pending = await ctx.db
      .query("orders")
      .withIndex("by_businessId_and_status", (q) =>
        q.eq("businessId", args.businessId).eq("status", "pending"),
      )
      .take(100);
    const revenue = completed.reduce((sum, o) => sum + o.totalPaisa, 0);
    const tips = completed.reduce((sum, o) => sum + (o.tipPaisa ?? 0), 0);
    return {
      completedCount: completed.length,
      revenuePaisa: revenue,
      tipsPaisa: tips,
      pendingCount: pending.length,
    };
  },
});

export const dashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const { business } = await requireOwner(ctx);
    const startOfDayPkt = (() => {
      const now = new Date(Date.now() + 5 * 60 * 60 * 1000);
      now.setUTCHours(0, 0, 0, 0);
      return now.getTime() - 5 * 60 * 60 * 1000;
    })();
    const completedToday = await ctx.db
      .query("orders")
      .withIndex("by_businessId_and_completedAt", (q) =>
        q.eq("businessId", business._id).gte("completedAt", startOfDayPkt),
      )
      .take(500);
    const pending = await ctx.db
      .query("orders")
      .withIndex("by_businessId_and_status", (q) =>
        q.eq("businessId", business._id).eq("status", "pending"),
      )
      .take(100);
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .order("desc")
      .take(100);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
        : null;
    return {
      todayRevenuePaisa: completedToday.reduce((s, o) => s + o.totalPaisa, 0),
      todayCompleted: completedToday.length,
      todayTipsPaisa: completedToday.reduce((s, o) => s + (o.tipPaisa ?? 0), 0),
      pendingCount: pending.length,
      avgRating,
      ratingCount: ratings.length,
      freeOrdersUsed: business.freeOrdersUsed,
      lifetimeCompletedOrders: business.lifetimeCompletedOrders,
    };
  },
});
