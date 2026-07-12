import { MutationCtx } from "../_generated/server";
import { Doc, Id } from "../_generated/dataModel";

export const FREE_ORDER_QUOTA = 20;
export const BASE_FEE_PAISA = 300 * 100;
export const COMMISSION_RATE = 0.02;
export const GRACE_PERIOD_MS = 7 * 24 * 60 * 60 * 1000;

/** Current billing period like "2026-07" in Pakistan time (UTC+5). */
export function currentPeriod(now = Date.now()): string {
  const pkt = new Date(now + 5 * 60 * 60 * 1000);
  const y = pkt.getUTCFullYear();
  const m = String(pkt.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** Previous billing period relative to `period` ("2026-07" -> "2026-06"). */
export function previousPeriod(period: string): string {
  const [y, m] = period.split("-").map(Number);
  const prev = m === 1 ? [y - 1, 12] : [y, m - 1];
  return `${prev[0]}-${String(prev[1]).padStart(2, "0")}`;
}

/**
 * Record a completed order against the business's billing state.
 * Consumes free quota first; afterwards accrues 2% commission (plus the
 * Rs. 300 base fee once per month) into the open ledger entry.
 * Must be called inside the same mutation that marks the order completed.
 */
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
  let entry = await ctx.db
    .query("ledgerEntries")
    .withIndex("by_businessId_and_period", (q) =>
      q.eq("businessId", business._id).eq("period", period),
    )
    .unique();

  const commission = Math.round(order.totalPaisa * COMMISSION_RATE);
  if (!entry) {
    const entryId = await ctx.db.insert("ledgerEntries", {
      businessId: business._id,
      period,
      baseFeePaisa: BASE_FEE_PAISA,
      commissionPaisa: commission,
      completedOrderCount: 1,
      completedVolumePaisa: order.totalPaisa,
      status: "open",
    });
    return entryId;
  }
  await ctx.db.patch("ledgerEntries", entry._id, {
    commissionPaisa: entry.commissionPaisa + commission,
    completedOrderCount: entry.completedOrderCount + 1,
    completedVolumePaisa: entry.completedVolumePaisa + order.totalPaisa,
  });
  return entry._id;
}
