"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatDate } from "@/lib/dates";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-400",
  suspended: "bg-red-500/15 text-red-400",
  grace: "bg-amber-500/15 text-amber-400",
  onboarding: "bg-blue-500/15 text-blue-400",
};

export default function AdminBusinesses() {
  const { isAuthenticated } = useConvexAuth();
  const businesses = useQuery(
    api.admin.listBusinesses,
    isAuthenticated ? {} : "skip",
  );
  const setStatus = useMutation(api.admin.setBusinessStatus);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold">Businesses</h1>
      <div className="overflow-x-auto rounded-2xl border border-stone-800">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-stone-800 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Business</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Via</th>
              <th className="px-4 py-3">WhatsApp</th>
              <th className="px-4 py-3">Orders</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses?.map((b) => (
              <tr key={b._id} className="border-b border-stone-900">
                <td className="px-4 py-3">
                  <p className="font-bold">{b.name}</p>
                  <a
                    href={`https://${b.slug}.karobari.shop`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-400 hover:underline"
                  >
                    {b.slug}.karobari.shop
                  </a>
                  <p className="text-xs text-stone-500">
                    {b.category} · {b.city ?? "—"} · {b.ownerPhone}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[b.status]}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-400">{b.createdVia}</td>
                <td className="px-4 py-3">
                  {b.whatsappConnected ? "✅" : "—"}
                </td>
                <td className="px-4 py-3 text-stone-300">
                  {b.lifetimeCompletedOrders}
                  <span className="text-xs text-stone-500">
                    {" "}
                    ({b.freeOrdersUsed}/20 free)
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-stone-500">
                  {formatDate(b.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      b.status === "suspended"
                        ? "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                        : "bg-red-500/15 text-red-400 hover:bg-red-500/25"
                    }`}
                    onClick={async () => {
                      await setStatus({
                        businessId: b._id,
                        status:
                          b.status === "suspended" ? "active" : "suspended",
                      });
                      toast.success("Status updated");
                    }}
                  >
                    {b.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {businesses?.length === 0 && (
          <p className="py-12 text-center text-sm text-stone-500">
            No businesses yet.
          </p>
        )}
      </div>
    </div>
  );
}
