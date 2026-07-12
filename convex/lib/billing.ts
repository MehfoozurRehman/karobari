import { MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";
import { nowPkt } from "./dates";

export const FREE_ORDER_QUOTA = 20;
export const BASE_FEE_PAISA = 300 * 100;
export const COMMISSION_RATE = 0.02;
export const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

export function currentPeriod(now = Date.now()): string {
  return nowPkt(now).format("YYYY-MM");
}

export function previousPeriod(period: string): string {
  return nowPkt(new Date(`${period}-15T00:00:00Z`).getTime())
    .subtract(1, "month")
    .format("YYYY-MM");
}

export async function recordCompletedOrder(
  ctx: MutationCtx,
  business: Doc<"businesses">,
  order: Doc<"orders">,
): Promise<Id<"ledgerEntries"> | null> {
  await ctx.db.patch("businesses", business._id, {
    lifetimeCompletedOrders: business.lifetimeCompletedOrders + 1,
  });

  if (business.freeOrdersUsed < FREE_ORDER_QUOTA) {
    await ctx.db.patch("businesses", business._id, {
      freeOrdersUsed: business.freeOrdersUsed + 1,
    });
    return null;
  }

  const period = currentPeriod();
  const entry = await ctx.db
    .query("ledgerEntries")
    .withIndex("by_businessId_and_period", (q) =>
      q.eq("businessId", business._id).eq("period", period),
    )
    .unique();

  const commission = Math.round(order.totalPaisa * COMMISSION_RATE);
  if (!entry) {
    return await ctx.db.insert("ledgerEntries", {
      businessId: business._id,
      period,
      baseFeePaisa: BASE_FEE_PAISA,
      commissionPaisa: commission,
      completedOrderCount: 1,
      completedVolumePaisa: order.totalPaisa,
      status: "open",
    });
  }
  await ctx.db.patch("ledgerEntries", entry._id, {
    commissionPaisa: entry.commissionPaisa + commission,
    completedOrderCount: entry.completedOrderCount + 1,
    completedVolumePaisa: entry.completedVolumePaisa + order.totalPaisa,
  });
  return entry._id;
}
