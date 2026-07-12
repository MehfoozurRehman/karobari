import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { createOrderForBusiness, transitionOrderStatus } from "../orders";
import { currentPeriod, FREE_ORDER_QUOTA } from "../lib/billing";
import { startOfTodayPktMs } from "../lib/dates";
import { Doc } from "../_generated/dataModel";

function rs(paisa: number): string {
  return `Rs. ${Math.round(paisa / 100).toLocaleString("en-PK")}`;
}

function effectivePrice(item: Doc<"catalogItems">): number {
  return item.discountPct
    ? Math.round(item.pricePaisa * (1 - item.discountPct / 100))
    : item.pricePaisa;
}

export const catalogText = internalQuery({
  args: { businessId: v.id("businesses") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("catalogCategories")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .take(100);
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .take(500);
    const byCategory = new Map<string, string[]>();
    for (const item of items) {
      if (!item.available) continue;
      const catName =
        categories.find((c) => c._id === item.categoryId)?.name ?? "Other";
      const line =
        `- ${item.name}: ${rs(effectivePrice(item))}` +
        (item.discountPct ? ` (${item.discountPct}% off, was ${rs(item.pricePaisa)})` : "") +
        (item.description ? ` — ${item.description}` : "");
      byCategory.set(catName, [...(byCategory.get(catName) ?? []), line]);
    }
    if (byCategory.size === 0) return "Catalog is empty right now.";
    return [...byCategory.entries()]
      .map(([cat, lines]) => `${cat}:\n${lines.join("\n")}`)
      .join("\n\n");
  },
});

export const businessInfo = internalQuery({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    const business = await ctx.db.get("businesses", args.businessId);
    if (!business) return null;
    return {
      name: business.name,
      category: business.category,
      description: business.description,
      city: business.city ?? null,
      address: business.address ?? null,
      hours: business.hours ?? null,
      deliveryInfo: business.deliveryInfo ?? null,
      slug: business.slug,
      status: business.status,
      paymentSettings: business.paymentSettings,
    };
  },
});

export const placeOrder = internalMutation({
  args: {
    businessId: v.id("businesses"),
    customerPhone: v.string(),
    customerName: v.optional(v.string()),
    customerAddress: v.string(),
    note: v.optional(v.string()),
    paymentMethod: v.union(
      v.literal("cod"),
      v.literal("easypaisa"),
      v.literal("jazzcash"),
    ),
    items: v.array(v.object({ itemName: v.string(), qty: v.number() })),
  },
  returns: v.object({
    orderNumber: v.number(),
    trackingToken: v.string(),
    totalPaisa: v.number(),
    unresolved: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const business = await ctx.db.get("businesses", args.businessId);
    if (!business) throw new Error("Business not found");
    const catalog = await ctx.db
      .query("catalogItems")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .take(500);

    const resolved: Array<{ catalogItemId: Doc<"catalogItems">["_id"]; qty: number }> = [];
    const unresolved: string[] = [];
    for (const line of args.items) {
      const wanted = line.itemName.toLowerCase().trim();
      const match =
        catalog.find((i) => i.available && i.name.toLowerCase() === wanted) ??
        catalog.find(
          (i) =>
            i.available &&
            (i.name.toLowerCase().includes(wanted) ||
              wanted.includes(i.name.toLowerCase())),
        );
      if (match) resolved.push({ catalogItemId: match._id, qty: line.qty });
      else unresolved.push(line.itemName);
    }
    if (resolved.length === 0) {
      throw new Error(
        `No items matched the catalog: ${unresolved.join(", ")}`,
      );
    }
    const result = await createOrderForBusiness(ctx, business, {
      customerPhone: args.customerPhone,
      customerName: args.customerName,
      customerAddress: args.customerAddress,
      note: args.note,
      source: "whatsapp",
      paymentMethod: args.paymentMethod,
      items: resolved,
    });
    const order = await ctx.db.get("orders", result.orderId);
    return {
      orderNumber: result.orderNumber,
      trackingToken: result.trackingToken,
      totalPaisa: order?.totalPaisa ?? 0,
      unresolved,
    };
  },
});

export const orderStatusForCustomer = internalQuery({
  args: {
    businessId: v.id("businesses"),
    customerPhone: v.string(),
    orderNumber: v.optional(v.number()),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_businessId_and_customerPhone", (q) =>
        q
          .eq("businessId", args.businessId)
          .eq("customerPhone", args.customerPhone),
      )
      .order("desc")
      .take(5);
    const filtered = args.orderNumber
      ? orders.filter((o) => o.orderNumber === args.orderNumber)
      : orders;
    if (filtered.length === 0) return "No orders found for this customer.";
    return filtered
      .map(
        (o) =>
          `Order #${o.orderNumber}: status=${o.status}, total=${rs(o.totalPaisa)}, payment=${o.paymentMethod}/${o.paymentStatus}`,
      )
      .join("\n");
  },
});

export const salesSummary = internalQuery({
  args: {
    businessId: v.id("businesses"),
    range: v.union(v.literal("today"), v.literal("week"), v.literal("month")),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const startOfToday = startOfTodayPktMs();
    const since =
      args.range === "today"
        ? startOfToday
        : args.range === "week"
          ? startOfToday - 6 * 24 * 60 * 60 * 1000
          : startOfToday - 29 * 24 * 60 * 60 * 1000;

    const completed = await ctx.db
      .query("orders")
      .withIndex("by_businessId_and_completedAt", (q) =>
        q.eq("businessId", args.businessId).gte("completedAt", since),
      )
      .take(1000);
    const pending = await ctx.db
      .query("orders")
      .withIndex("by_businessId_and_status", (q) =>
        q.eq("businessId", args.businessId).eq("status", "pending"),
      )
      .take(100);

    const revenue = completed.reduce((s, o) => s + o.totalPaisa, 0);
    const tips = completed.reduce((s, o) => s + (o.tipPaisa ?? 0), 0);

    const counts = new Map<string, number>();
    for (const order of completed.slice(0, 200)) {
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
        .take(50);
      for (const item of items) {
        counts.set(item.nameSnapshot, (counts.get(item.nameSnapshot) ?? 0) + item.qty);
      }
    }
    const top = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, qty]) => `${name} (${qty})`)
      .join(", ");

    return (
      `Range: ${args.range}\nCompleted orders: ${completed.length}\n` +
      `Revenue: ${rs(revenue)}\nTips: ${rs(tips)}\n` +
      `Pending orders right now: ${pending.length}` +
      (top ? `\nTop items: ${top}` : "")
    );
  },
});

export const pendingOrdersText = internalQuery({
  args: { businessId: v.id("businesses") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const active: string[] = [];
    for (const status of ["pending", "confirmed", "preparing", "ready", "delivered"] as const) {
      const orders = await ctx.db
        .query("orders")
        .withIndex("by_businessId_and_status", (q) =>
          q.eq("businessId", args.businessId).eq("status", status),
        )
        .take(20);
      for (const o of orders) {
        active.push(
          `#${o.orderNumber} [${o.status}] ${rs(o.totalPaisa)} — ${o.customerName ?? o.customerPhone}, ${o.customerAddress ?? "no address"} (${o.paymentMethod}/${o.paymentStatus})`,
        );
      }
    }
    return active.length > 0 ? active.join("\n") : "No active orders.";
  },
});

export const updateOrderStatusByNumber = internalMutation({
  args: {
    businessId: v.id("businesses"),
    orderNumber: v.number(),
    status: v.union(
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("delivered"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const business = await ctx.db.get("businesses", args.businessId);
    if (!business) throw new Error("Business not found");
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .take(500);
    const order = orders.find((o) => o.orderNumber === args.orderNumber);
    if (!order) return `Order #${args.orderNumber} not found.`;
    try {
      await transitionOrderStatus(ctx, business, order, args.status);
      return `Order #${args.orderNumber} is now ${args.status}.`;
    } catch (e) {
      return e instanceof Error ? e.message : "Transition failed.";
    }
  },
});

export const setItemAvailability = internalMutation({
  args: {
    businessId: v.id("businesses"),
    itemName: v.string(),
    available: v.boolean(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .take(500);
    const wanted = args.itemName.toLowerCase().trim();
    const match =
      items.find((i) => i.name.toLowerCase() === wanted) ??
      items.find((i) => i.name.toLowerCase().includes(wanted));
    if (!match) return `Item "${args.itemName}" not found.`;
    await ctx.db.patch("catalogItems", match._id, {
      available: args.available,
    });
    return `${match.name} is now ${args.available ? "available" : "unavailable"}.`;
  },
});

export const setItemPrice = internalMutation({
  args: {
    businessId: v.id("businesses"),
    itemName: v.string(),
    priceRupees: v.number(),
  },
  returns: v.string(),
  handler: async (ctx, args) => {
    if (args.priceRupees <= 0) return "Price must be positive.";
    const items = await ctx.db
      .query("catalogItems")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .take(500);
    const wanted = args.itemName.toLowerCase().trim();
    const match =
      items.find((i) => i.name.toLowerCase() === wanted) ??
      items.find((i) => i.name.toLowerCase().includes(wanted));
    if (!match) return `Item "${args.itemName}" not found.`;
    await ctx.db.patch("catalogItems", match._id, {
      pricePaisa: Math.round(args.priceRupees * 100),
    });
    return `${match.name} price updated to Rs. ${args.priceRupees}.`;
  },
});

export const billingStatus = internalQuery({
  args: { businessId: v.id("businesses") },
  returns: v.string(),
  handler: async (ctx, args) => {
    const business = await ctx.db.get("businesses", args.businessId);
    if (!business) return "Business not found.";
    const period = currentPeriod();
    const entry = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_businessId_and_period", (q) =>
        q.eq("businessId", args.businessId).eq("period", period),
      )
      .unique();
    const dueEntries = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_businessId_and_period", (q) =>
        q.eq("businessId", args.businessId),
      )
      .take(24);
    const outstanding = dueEntries.filter(
      (e) => e.status === "due" || e.status === "proof_submitted",
    );
    const freeLeft = Math.max(0, FREE_ORDER_QUOTA - business.freeOrdersUsed);
    let text = `Free orders left: ${freeLeft} of ${FREE_ORDER_QUOTA}.`;
    if (entry) {
      text += `\nThis month (${period}): base ${rs(entry.baseFeePaisa)} + commission ${rs(entry.commissionPaisa)} on ${entry.completedOrderCount} orders = ${rs(entry.baseFeePaisa + entry.commissionPaisa)} (status: ${entry.status}).`;
    } else {
      text += `\nNo charges this month yet.`;
    }
    for (const e of outstanding) {
      if (e.period !== period) {
        text += `\nUNPAID invoice for ${e.period}: ${rs(e.baseFeePaisa + e.commissionPaisa)} (status: ${e.status}).`;
      }
    }
    if (business.status === "suspended") {
      text += `\n⚠️ Account is SUSPENDED for non-payment.`;
    }
    return text;
  },
});
