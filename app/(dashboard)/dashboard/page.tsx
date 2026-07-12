"use client";

import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaisa } from "@/lib/currency";
import { Star } from "lucide-react";

export default function DashboardOverview() {
  const { isAuthenticated } = useConvexAuth();
  const stats = useQuery(
    api.orders.dashboardStats,
    isAuthenticated ? {} : "skip",
  );
  const orders = useQuery(
    api.orders.listMine,
    isAuthenticated ? { status: "pending" } : "skip",
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Overview
        </h1>
        <p className="text-sm text-stone-500">Aaj ka business, one glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Today's Revenue"
          value={stats ? formatPaisa(stats.todayRevenuePaisa) : "—"}
        />
        <StatCard
          label="Completed Today"
          value={stats ? String(stats.todayCompleted) : "—"}
        />
        <StatCard
          label="Pending Orders"
          value={stats ? String(stats.pendingCount) : "—"}
          highlight={Boolean(stats && stats.pendingCount > 0)}
        />
        <StatCard
          label="Avg Rating"
          value={
            stats?.avgRating
              ? `${stats.avgRating.toFixed(1)} ★ (${stats.ratingCount})`
              : "No ratings yet"
          }
        />
      </div>

      {stats && stats.freeOrdersUsed < 20 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <strong>{20 - stats.freeOrdersUsed} free orders left.</strong> After
          your first 20 completed orders, billing starts at Rs. 300/month + 2%
          per order.
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Pending Orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-sm font-semibold text-emerald-700 hover:underline"
          >
            View all →
          </Link>
        </div>
        {orders === undefined ? (
          <div className="h-40 animate-pulse rounded-2xl bg-stone-200" />
        ) : orders.length === 0 ? (
          <Card className="rounded-2xl border-stone-200">
            <CardContent className="py-10 text-center text-sm text-stone-500">
              No pending orders right now.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 8).map((order) => (
              <Link
                key={order._id}
                href={`/dashboard/orders/${order._id}`}
                className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="font-bold text-stone-900">
                    Order #{order.orderNumber}
                  </p>
                  <p className="text-xs text-stone-500">
                    {order.customerName ?? order.customerPhone} ·{" "}
                    {order.paymentMethod.toUpperCase()}
                  </p>
                </div>
                <p className="font-bold text-emerald-700">
                  {formatPaisa(order.totalPaisa)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`rounded-2xl border-stone-200 ${highlight ? "border-amber-300 bg-amber-50" : "bg-white"}`}
    >
      <CardContent className="p-5">
        <p className="text-xs font-medium text-stone-500">{label}</p>
        <p className="mt-1 truncate text-xl font-extrabold text-stone-900">
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
