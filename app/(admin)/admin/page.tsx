"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatPaisa } from "@/lib/currency";

export default function AdminOverview() {
  const { isAuthenticated } = useConvexAuth();
  const stats = useQuery(api.admin.overview, isAuthenticated ? {} : "skip");

  if (!stats)
    return <div className="h-64 animate-pulse rounded-2xl bg-stone-900" />;

  const cards = [
    { label: "Total Businesses", value: String(stats.totalBusinesses) },
    { label: "Active", value: String(stats.byStatus.active ?? 0) },
    { label: "Suspended", value: String(stats.byStatus.suspended ?? 0) },
    { label: "Orders Today", value: String(stats.todayOrderCount) },
    { label: "GMV Today", value: formatPaisa(stats.todayGmvPaisa) },
    { label: "Accrued This Month", value: formatPaisa(stats.accruedThisMonthPaisa) },
    { label: "Collected (All Time)", value: formatPaisa(stats.collectedPaisa) },
    { label: "Outstanding", value: formatPaisa(stats.outstandingPaisa) },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-extrabold">Platform Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-stone-800 bg-stone-900/50 p-5"
          >
            <p className="text-xs text-stone-400">{c.label}</p>
            <p className="mt-1 truncate text-xl font-extrabold">{c.value}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {stats.pendingProofCount > 0 && (
          <Link
            href="/admin/billing"
            className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm font-semibold text-amber-300 hover:bg-amber-500/20"
          >
            💰 {stats.pendingProofCount} payment proof
            {stats.pendingProofCount > 1 ? "s" : ""} awaiting review →
          </Link>
        )}
        {stats.newQueryCount > 0 && (
          <Link
            href="/admin/contact"
            className="rounded-2xl border border-blue-500/30 bg-blue-500/10 px-5 py-4 text-sm font-semibold text-blue-300 hover:bg-blue-500/20"
          >
            📨 {stats.newQueryCount} new contact quer
            {stats.newQueryCount > 1 ? "ies" : "y"} →
          </Link>
        )}
      </div>
    </div>
  );
}
