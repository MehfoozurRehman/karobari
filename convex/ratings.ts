import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireOwner } from "./lib/access";

/** Public: submit rating + optional tip via the order tracking token. */
export const submit = mutation({
  args: {
    trackingToken: v.string(),
    stars: v.number(),
    comment: v.optional(v.string()),
    tipRupees: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.stars) || args.stars < 1 || args.stars > 5) {
      throw new Error("Rating must be 1-5 stars");
    }
    const order = await ctx.db
      .query("orders")
      .withIndex("by_trackingToken", (q) =>
        q.eq("trackingToken", args.trackingToken),
      )
      .unique();
    if (!order) throw new Error("Order not found");
    if (order.status !== "delivered" && order.status !== "completed") {
      throw new Error("You can rate after your order is delivered");
    }
    const existing = await ctx.db
      .query("ratings")
      .withIndex("by_orderId", (q) => q.eq("orderId", order._id))
      .unique();
    if (existing) throw new Error("This order has already been rated");

    const tipPaisa =
      args.tipRupees && args.tipRupees > 0
        ? Math.round(args.tipRupees * 100)
        : 0;
    await ctx.db.insert("ratings", {
      orderId: order._id,
      businessId: order.businessId,
      stars: args.stars,
      comment: args.comment,
      tipPaisa,
    });
    if (tipPaisa > 0) {
      await ctx.db.patch("orders", order._id, { tipPaisa });
    }
    return null;
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const { business } = await requireOwner(ctx);
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .order("desc")
      .take(200);
    return await Promise.all(
      ratings.map(async (r) => {
        const order = await ctx.db.get("orders", r.orderId);
        return {
          ...r,
          orderNumber: order?.orderNumber ?? null,
          customerName: order?.customerName ?? null,
        };
      }),
    );
  },
});
