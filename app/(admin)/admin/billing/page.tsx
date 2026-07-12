"use client";

import Image from "next/image";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatPaisa } from "@/lib/currency";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-400",
  due: "bg-amber-500/15 text-amber-400",
  proof_submitted: "bg-purple-500/15 text-purple-400",
  paid: "bg-emerald-500/15 text-emerald-400",
  waived: "bg-stone-500/15 text-stone-400",
};

export default function AdminBilling() {
  const { isAuthenticated } = useConvexAuth();
  const queue = useQuery(
    api.admin.paymentReviewQueue,
    isAuthenticated ? {} : "skip",
  );
  const ledger = useQuery(
    api.admin.ledgerOverview,
    isAuthenticated ? {} : "skip",
  );
  const review = useMutation(api.admin.reviewPlatformPayment);
  const recordManual = useMutation(api.admin.recordManualPayment);
  const waive = useMutation(api.admin.waiveLedgerEntry);

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-xl font-extrabold">Payment Proof Review</h1>
        {queue?.length === 0 && (
          <p className="rounded-2xl border border-stone-800 py-10 text-center text-sm text-stone-500">
            No payment proofs awaiting review.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {queue?.map((p) => (
            <div
              key={p._id}
              className="space-y-3 rounded-2xl border border-stone-800 bg-stone-900/50 p-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{p.businessName}</p>
                  <p className="text-xs text-stone-500">
                    {p.period} · {p.method.toUpperCase()}
                    {p.tid ? ` · TID: ${p.tid}` : ""}
                  </p>
                </div>
                <p className="text-lg font-extrabold text-emerald-400">
                  {formatPaisa(p.amountPaisa)}
                </p>
              </div>
              {p.screenshotUrl && (
                <a href={p.screenshotUrl} target="_blank" rel="noopener noreferrer">
                  <Image
                    src={p.screenshotUrl}
                    alt="Payment proof"
                    width={400}
                    height={240}
                    className="max-h-60 w-full rounded-xl border border-stone-800 object-contain"
                  />
                </a>
              )}
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-full bg-emerald-500/15 py-2 text-sm font-bold text-emerald-400 hover:bg-emerald-500/25"
                  onClick={async () => {
                    await review({ paymentId: p._id, decision: "approved" });
                    toast.success("Approved — business reactivated if suspended");
                  }}
                >
                  Approve
                </button>
                <button
                  className="flex-1 rounded-full bg-red-500/15 py-2 text-sm font-bold text-red-400 hover:bg-red-500/25"
                  onClick={async () => {
                    const note = window.prompt("Rejection note (sent context for owner):") ?? undefined;
                    await review({ paymentId: p._id, decision: "rejected", note });
                    toast.success("Rejected — invoice back to due");
                  }}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-extrabold">
          Ledger — {ledger?.period}
        </h2>
        <LedgerTable
          entries={ledger?.entries ?? []}
          onManual={async (id) => {
            await recordManual({ ledgerEntryId: id as never });
            toast.success("Recorded as paid");
          }}
          onWaive={async (id) => {
            const note = window.prompt("Waive reason:") ?? undefined;
            await waive({ ledgerEntryId: id as never, note });
            toast.success("Waived");
          }}
        />
        {ledger && ledger.overdueOther.length > 0 && (
          <>
            <h2 className="pt-4 text-lg font-extrabold text-amber-400">
              Overdue from earlier months
            </h2>
            <LedgerTable
              entries={ledger.overdueOther}
              onManual={async (id) => {
                await recordManual({ ledgerEntryId: id as never });
                toast.success("Recorded as paid");
              }}
              onWaive={async (id) => {
                const note = window.prompt("Waive reason:") ?? undefined;
                await waive({ ledgerEntryId: id as never, note });
                toast.success("Waived");
              }}
            />
          </>
        )}
      </section>
    </div>
  );
}

type LedgerRow = {
  _id: string;
  businessName: string;
  businessStatus: string;
  period: string;
  baseFeePaisa: number;
  commissionPaisa: number;
  completedOrderCount: number;
  status: string;
};

function LedgerTable({
  entries,
  onManual,
  onWaive,
}: {
  entries: LedgerRow[];
  onManual: (id: string) => void;
  onWaive: (id: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-stone-800 py-10 text-center text-sm text-stone-500">
        No ledger entries.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-800">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="border-b border-stone-800 text-xs uppercase text-stone-500">
          <tr>
            <th className="px-4 py-3">Business</th>
            <th className="px-4 py-3">Period</th>
            <th className="px-4 py-3">Orders</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e._id} className="border-b border-stone-900">
              <td className="px-4 py-3 font-semibold">
                {e.businessName}
                {e.businessStatus === "suspended" && (
                  <span className="ml-2 text-xs text-red-400">suspended</span>
                )}
              </td>
              <td className="px-4 py-3 text-stone-400">{e.period}</td>
              <td className="px-4 py-3 text-stone-400">
                {e.completedOrderCount}
              </td>
              <td className="px-4 py-3 font-bold">
                {formatPaisa(e.baseFeePaisa + e.commissionPaisa)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[e.status]}`}
                >
                  {e.status.replace("_", " ")}
                </span>
              </td>
              <td className="space-x-2 px-4 py-3">
                {(e.status === "due" || e.status === "proof_submitted") && (
                  <>
                    <button
                      className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/25"
                      onClick={() => onManual(e._id)}
                    >
                      Mark Paid
                    </button>
                    <button
                      className="rounded-full bg-stone-500/15 px-3 py-1 text-xs font-semibold text-stone-400 hover:bg-stone-500/25"
                      onClick={() => onWaive(e._id)}
                    >
                      Waive
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
