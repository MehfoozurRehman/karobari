"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatPaisa } from "@/lib/currency";

export default function RatingsPage() {
  const { isAuthenticated } = useConvexAuth();
  const ratings = useQuery(api.ratings.listMine, isAuthenticated ? {} : "skip");

  const totalTips =
    ratings?.reduce((sum, r) => sum + r.tipPaisa, 0) ?? 0;
  const avg =
    ratings && ratings.length > 0
      ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Ratings & Tips
        </h1>
        <p className="text-sm text-stone-500">
          What customers say after their orders.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:max-w-md">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-stone-500">Average Rating</p>
          <p className="mt-1 text-xl font-extrabold text-stone-900">
            {avg ? `${avg.toFixed(1)} ★` : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-xs text-stone-500">Total Tips</p>
          <p className="mt-1 text-xl font-extrabold text-emerald-700">
            {formatPaisa(totalTips)}
          </p>
        </div>
      </div>

      {ratings === undefined ? (
        <div className="h-64 animate-pulse rounded-2xl bg-stone-200" />
      ) : ratings.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white py-16 text-center text-sm text-stone-500">
          No ratings yet — they appear after customers rate delivered orders.
        </div>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => (
            <div
              key={r._id}
              className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-amber-500">
                  {"★".repeat(r.stars)}
                  <span className="text-stone-300">
                    {"★".repeat(5 - r.stars)}
                  </span>
                </p>
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  {r.tipPaisa > 0 && (
                    <span className="font-bold text-emerald-700">
                      +{formatPaisa(r.tipPaisa)} tip
                    </span>
                  )}
                  <span>Order #{r.orderNumber}</span>
                </div>
              </div>
              {r.comment && (
                <p className="mt-2 text-sm text-stone-700">{r.comment}</p>
              )}
              <p className="mt-1 text-xs text-stone-400">
                {r.customerName ?? "Customer"} ·{" "}
                {new Date(r._creationTime).toLocaleDateString("en-PK")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
