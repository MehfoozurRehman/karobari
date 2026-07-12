import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwner } from "./lib/access";

/** Public: generate an upload URL for a payment screenshot. */
export const generateProofUploadUrl = mutation({
  args: { trackingToken: v.string() },
  returns: v.string(),
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_trackingToken", (q) =>
        q.eq("trackingToken", args.trackingToken),
      )
      .unique();
    if (!order) throw new Error("Order not found");
    return await ctx.storage.generateUploadUrl();
  },
});

/** Public: customer submits TID and/or screenshot for a wallet payment. */
export const submitProof = mutation({
  args: {
    trackingToken: v.string(),
    method: v.union(v.literal("easypaisa"), v.literal("jazzcash")),
    tid: v.optional(v.string()),
    screenshotStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (!args.tid && !args.screenshotStorageId) {
      throw new Error("Provide a transaction ID or a screenshot");
    }
    const order = await ctx.db
      .query("orders")
      .withIndex("by_trackingToken", (q) =>
        q.eq("trackingToken", args.trackingToken),
      )
      .unique();
    if (!order) throw new Error("Order not found");
    await ctx.db.insert("paymentProofs", {
      orderId: order._id,
      businessId: order.businessId,
      tid: args.tid,
      screenshotStorageId: args.screenshotStorageId,
      method: args.method,
      status: "submitted",
    });
    await ctx.db.patch("orders", order._id, {
      paymentStatus: "proof_submitted",
    });
    return null;
  },
});

/** Business owner reviews a customer's payment proof. */
export const reviewProof = mutation({
  args: {
    proofId: v.id("paymentProofs"),
    decision: v.union(v.literal("accepted"), v.literal("rejected")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const proof = await ctx.db.get("paymentProofs", args.proofId);
    if (!proof || proof.businessId !== business._id)
      throw new Error("Proof not found");
    await ctx.db.patch("paymentProofs", args.proofId, {
      status: args.decision,
    });
    await ctx.db.patch("orders", proof.orderId, {
      paymentStatus: args.decision === "accepted" ? "paid" : "unpaid",
    });
    return null;
  },
});
