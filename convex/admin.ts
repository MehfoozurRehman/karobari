import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./lib/access";
import { currentPeriod } from "./lib/billing";
import { startOfTodayPktMs } from "./lib/dates";

export const overview = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const businesses = await ctx.db.query("businesses").take(2000);
    const byStatus: Record<string, number> = {};
    for (const b of businesses) {
      byStatus[b.status] = (byStatus[b.status] ?? 0) + 1;
    }
    const startOfDay = startOfTodayPktMs();
    const recentOrders = await ctx.db
      .query("orders")
      .order("desc")
      .take(1000);
    const todayOrders = recentOrders.filter(
      (o) => o._creationTime >= startOfDay,
    );
    const period = currentPeriod();
    const entries = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_period", (q) => q.eq("period", period))
      .take(1000);
    const accrued = entries.reduce(
      (s, e) => s + e.baseFeePaisa + e.commissionPaisa,
      0,
    );
    const allEntries = await ctx.db.query("ledgerEntries").take(2000);
    const collected = allEntries
      .filter((e) => e.status === "paid")
      .reduce((s, e) => s + e.baseFeePaisa + e.commissionPaisa, 0);
    const outstanding = allEntries
      .filter((e) => e.status === "due" || e.status === "proof_submitted")
      .reduce((s, e) => s + e.baseFeePaisa + e.commissionPaisa, 0);
    const pendingProofs = await ctx.db
      .query("platformPayments")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .take(200);
    const newQueries = await ctx.db
      .query("contactQueries")
      .withIndex("by_status", (q) => q.eq("status", "new"))
      .take(200);

    return {
      totalBusinesses: businesses.length,
      byStatus,
      todayOrderCount: todayOrders.length,
      todayGmvPaisa: todayOrders.reduce((s, o) => s + o.totalPaisa, 0),
      accruedThisMonthPaisa: accrued,
      collectedPaisa: collected,
      outstandingPaisa: outstanding,
      pendingProofCount: pendingProofs.length,
      newQueryCount: newQueries.length,
    };
  },
});

export const listBusinesses = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const businesses = await ctx.db.query("businesses").order("desc").take(500);
    return await Promise.all(
      businesses.map(async (b) => {
        const whatsapp = await ctx.db
          .query("whatsappAccounts")
          .withIndex("by_businessId", (q) => q.eq("businessId", b._id))
          .first();
        return {
          _id: b._id,
          name: b.name,
          slug: b.slug,
          category: b.category,
          city: b.city,
          status: b.status,
          createdVia: b.createdVia,
          ownerPhone: b.ownerPhone,
          freeOrdersUsed: b.freeOrdersUsed,
          lifetimeCompletedOrders: b.lifetimeCompletedOrders,
          whatsappConnected: whatsapp?.status === "connected",
          createdAt: b._creationTime,
        };
      }),
    );
  },
});

export const businessDetail = query({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const business = await ctx.db.get("businesses", args.businessId);
    if (!business) return null;
    const entries = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_businessId_and_period", (q) =>
        q.eq("businessId", args.businessId),
      )
      .order("desc")
      .take(24);
    const payments = await ctx.db
      .query("platformPayments")
      .withIndex("by_businessId", (q) => q.eq("businessId", args.businessId))
      .order("desc")
      .take(50);
    const paymentsWithUrls = await Promise.all(
      payments.map(async (p) => ({
        ...p,
        screenshotUrl: p.screenshotStorageId
          ? await ctx.storage.getUrl(p.screenshotStorageId)
          : null,
      })),
    );
    return { business, entries, payments: paymentsWithUrls };
  },
});

export const setBusinessStatus = mutation({
  args: {
    businessId: v.id("businesses"),
    status: v.union(v.literal("active"), v.literal("suspended")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("businesses", args.businessId, {
      status: args.status,
      suspendedAt: args.status === "suspended" ? Date.now() : undefined,
    });
    return null;
  },
});

export const paymentReviewQueue = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const submitted = await ctx.db
      .query("platformPayments")
      .withIndex("by_status", (q) => q.eq("status", "submitted"))
      .take(200);
    return await Promise.all(
      submitted.map(async (p) => {
        const business = await ctx.db.get("businesses", p.businessId);
        const entry = await ctx.db.get("ledgerEntries", p.ledgerEntryId);
        return {
          ...p,
          screenshotUrl: p.screenshotStorageId
            ? await ctx.storage.getUrl(p.screenshotStorageId)
            : null,
          businessName: business?.name ?? "(deleted)",
          period: entry?.period ?? "?",
        };
      }),
    );
  },
});

export const reviewPlatformPayment = mutation({
  args: {
    paymentId: v.id("platformPayments"),
    decision: v.union(v.literal("approved"), v.literal("rejected")),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const payment = await ctx.db.get("platformPayments", args.paymentId);
    if (!payment) throw new Error("Payment not found");
    await ctx.db.patch("platformPayments", args.paymentId, {
      status: args.decision,
      reviewedBy: admin.email,
      reviewNote: args.note,
    });
    if (args.decision === "approved") {
      await ctx.db.patch("ledgerEntries", payment.ledgerEntryId, {
        status: "paid",
        paidAt: Date.now(),
      });
      const business = await ctx.db.get("businesses", payment.businessId);
      if (business && business.status === "suspended") {
        const otherDue = await ctx.db
          .query("ledgerEntries")
          .withIndex("by_businessId_and_period", (q) =>
            q.eq("businessId", payment.businessId),
          )
          .take(24);
        const stillOwing = otherDue.some(
          (e) =>
            e._id !== payment.ledgerEntryId &&
            (e.status === "due" || e.status === "proof_submitted"),
        );
        if (!stillOwing) {
          await ctx.db.patch("businesses", payment.businessId, {
            status: "active",
            suspendedAt: undefined,
          });
        }
      }
    } else {
      await ctx.db.patch("ledgerEntries", payment.ledgerEntryId, {
        status: "due",
      });
    }
    return null;
  },
});

export const recordManualPayment = mutation({
  args: {
    ledgerEntryId: v.id("ledgerEntries"),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    const entry = await ctx.db.get("ledgerEntries", args.ledgerEntryId);
    if (!entry) throw new Error("Entry not found");
    await ctx.db.insert("platformPayments", {
      businessId: entry.businessId,
      ledgerEntryId: entry._id,
      method: "manual",
      amountPaisa: entry.baseFeePaisa + entry.commissionPaisa,
      status: "approved",
      reviewedBy: admin.email,
      reviewNote: args.note ?? "Recorded manually by admin",
    });
    await ctx.db.patch("ledgerEntries", entry._id, {
      status: "paid",
      paidAt: Date.now(),
    });
    const business = await ctx.db.get("businesses", entry.businessId);
    if (business?.status === "suspended") {
      await ctx.db.patch("businesses", entry.businessId, {
        status: "active",
        suspendedAt: undefined,
      });
    }
    return null;
  },
});

export const waiveLedgerEntry = mutation({
  args: {
    ledgerEntryId: v.id("ledgerEntries"),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch("ledgerEntries", args.ledgerEntryId, {
      status: "waived",
      adminNote: args.note,
    });
    return null;
  },
});

export const ledgerOverview = query({
  args: { period: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const period = args.period ?? currentPeriod();
    const entries = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_period", (q) => q.eq("period", period))
      .take(1000);
    const withBusiness = await Promise.all(
      entries.map(async (e) => {
        const business = await ctx.db.get("businesses", e.businessId);
        return {
          ...e,
          businessName: business?.name ?? "(deleted)",
          businessStatus: business?.status ?? "unknown",
        };
      }),
    );
    const dueEverywhere = await ctx.db
      .query("ledgerEntries")
      .withIndex("by_status", (q) => q.eq("status", "due"))
      .take(1000);
    const overdueOther = await Promise.all(
      dueEverywhere
        .filter((e) => e.period !== period)
        .map(async (e) => {
          const business = await ctx.db.get("businesses", e.businessId);
          return {
            ...e,
            businessName: business?.name ?? "(deleted)",
            businessStatus: business?.status ?? "unknown",
          };
        }),
    );
    return { period, entries: withBusiness, overdueOther };
  },
});
