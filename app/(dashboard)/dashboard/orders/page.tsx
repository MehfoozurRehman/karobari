"use client";

import { useState } from "react";
import Link from "next/link";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPaisa } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/dates";
import { STATUS_COLORS } from "@/components/dashboard/order-status";

const STATUSES = [
  "all",
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "delivered",
  "completed",
  "cancelled",
] as const;

export default function OrdersPage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const { isAuthenticated } = useConvexAuth();
  const orders = useQuery(
    api.orders.listMine,
    isAuthenticated
      ? status === "all"
        ? {}
        : { status: status as Exclude<typeof status, "all"> }
      : "skip",
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Orders
        </h1>
        <p className="text-sm text-stone-500">
          Live order feed — updates in real time.
        </p>
      </div>

      <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <TabsList className="flex w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          {STATUSES.map((s) => (
            <TabsTrigger
              key={s}
              value={s}
              className="rounded-full border border-stone-200 bg-white px-4 py-1.5 text-xs font-semibold capitalize data-[state=active]:border-emerald-700 data-[state=active]:bg-emerald-700 data-[state=active]:text-white"
            >
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {orders === undefined ? (
        <div className="h-64 animate-pulse rounded-2xl bg-stone-200" />
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-500">
          No orders here yet.
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/dashboard/orders/${order._id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-stone-900">
                    #{order.orderNumber}
                  </p>
                  <Badge
                    className={`border-none text-[10px] capitalize ${STATUS_COLORS[order.status]}`}
                  >
                    {order.status}
                  </Badge>
                  {order.paymentStatus === "proof_submitted" && (
                    <Badge className="border-none bg-amber-100 text-[10px] text-amber-800">
                      payment proof
                    </Badge>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-stone-500">
                  {order.customerName ?? order.customerPhone} ·{" "}
                  {order.paymentMethod.toUpperCase()} ·{" "}
                  {formatDateTime(order._creationTime)}
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
  );
}
