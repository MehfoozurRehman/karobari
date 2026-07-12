import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireOwner } from "./lib/access";
import {
  currentPeriod,
  previousPeriod,
  GRACE_PERIOD_MS,
  FREE_ORDER_QUOTA,
} from "./lib/billing";

export const myLedger = query({
  args: {},
  handler: async (ctx) => {
    const { business } = await requireOwner(ctx);
    const entries = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_businessId_and_period", (q) =>
        q.eq("businessId", business._id),
      )
      .order("desc")
      .take(24);
    const payments = await ctx.db
      .query("platformPayments")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .order("desc")
      .take(50);
    return {
      entries,
      payments,
      freeOrdersUsed: business.freeOrdersUsed,
      freeOrderQuota: FREE_ORDER_QUOTA,
      businessStatus: business.status,
    };
  },
});

export const generatePaymentUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireOwner(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const submitPlatformPayment = mutation({
  args: {
    ledgerEntryId: v.id("ledgerEntries"),
    method: v.union(
      v.literal("easypaisa"),
      v.literal("jazzcash"),
      v.literal("bank"),
    ),
    tid: v.optional(v.string()),
    screenshotStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { business } = await requireOwner(ctx);
    const entry = await ctx.db.get("ledgerEntries", args.ledgerEntryId);
    if (!entry || entry.businessId !== business._id) {
      throw new Error("Invoice not found");
    }
    if (entry.status !== "due" && entry.status !== "proof_submitted") {
      throw new Error("This invoice is not payable");
    }
    if (!args.tid && !args.screenshotStorageId) {
      throw new Error("Provide a transaction ID or a screenshot");
    }
    await ctx.db.insert("platformPayments", {
      businessId: business._id,
      ledgerEntryId: args.ledgerEntryId,
      method: args.method,
      tid: args.tid,
      screenshotStorageId: args.screenshotStorageId,
      amountPaisa: entry.baseFeePaisa + entry.commissionPaisa,
      status: "submitted",
    });
    await ctx.db.patch("ledgerEntries", args.ledgerEntryId, {
      status: "proof_submitted",
    });
    return null;
  },
});

export const closeMonthlyLedgers = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const lastPeriod = previousPeriod(currentPeriod());
    const open = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_period", (q) => q.eq("period", lastPeriod))
      .take(1000);
    for (const entry of open) {
      if (entry.status !== "open") continue;
      await ctx.db.patch("ledgerEntries", entry._id, {
        status: "due",
        dueAt: Date.now() + GRACE_PERIOD_MS,
      });
      await ctx.scheduler.runAfter(0, internal.email.sendInvoiceEmail, {
        businessId: entry.businessId,
        period: entry.period,
        amountPaisa: entry.baseFeePaisa + entry.commissionPaisa,
      });
    }
    return null;
  },
});

export const suspendOverdue = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const due = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_status", (q) => q.eq("status", "due"))
      .take(500);
    const now = Date.now();
    for (const entry of due) {
      if (!entry.dueAt || entry.dueAt > now) continue;
      const business = await ctx.db.get("businesses", entry.businessId);
      if (!business || business.status === "suspended") continue;
      await ctx.db.patch("businesses", business._id, {
        status: "suspended",
        suspendedAt: now,
      });
      await ctx.scheduler.runAfter(0, internal.email.sendSuspensionEmail, {
        businessId: business._id,
        period: entry.period,
        amountPaisa: entry.baseFeePaisa + entry.commissionPaisa,
      });
    }
    return null;
  },
});

export const entryInternal = internalQuery({
  args: { ledgerEntryId: v.id("ledgerEntries") },
  handler: async (ctx, args) => {
    return await ctx.db.get("ledgerEntries", args.ledgerEntryId);
  },
});
