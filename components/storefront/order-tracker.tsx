"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPaisa } from "@/lib/currency";
import { toast } from "sonner";

const STEPS = ["pending", "confirmed", "preparing", "ready", "delivered"] as const;
const STEP_LABELS: Record<string, string> = {
  pending: "Order Received",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready / Out for Delivery",
  delivered: "Delivered",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function OrderTracker({ token }: { token: string }) {
  const data = useQuery(api.orders.trackByToken, { trackingToken: token });
  const generateUploadUrl = useMutation(
    api.paymentsCustomer.generateProofUploadUrl,
  );
  const submitProof = useMutation(api.paymentsCustomer.submitProof);

  const [tid, setTid] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  if (data === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <p className="animate-pulse text-stone-500">Loading order...</p>
      </div>
    );
  }
  if (data === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf7f2]">
        <p className="text-stone-500">Order nahi mila — link check karein.</p>
      </div>
    );
  }

  const { order, items, business, hasRating, proofStatus } = data;
  const currentStep = STEPS.indexOf(order.status as (typeof STEPS)[number]);
  const showProofForm =
    (order.paymentMethod === "easypaisa" || order.paymentMethod === "jazzcash") &&
    order.paymentStatus === "unpaid";
  const canRate =
    (order.status === "delivered" || order.status === "completed") && !hasRating;

  async function sendProof() {
    const file = fileRef.current?.files?.[0];
    if (!tid && !file) {
      toast.error("TID ya screenshot dein");
      return;
    }
    setSubmitting(true);
    try {
      let screenshotStorageId: string | undefined;
      if (file) {
        const uploadUrl = await generateUploadUrl({ trackingToken: token });
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = await res.json();
        screenshotStorageId = json.storageId;
      }
      await submitProof({
        trackingToken: token,
        method: order.paymentMethod as "easypaisa" | "jazzcash",
        tid: tid || undefined,
        screenshotStorageId: screenshotStorageId as never,
      });
      toast.success("Payment proof submit ho gaya!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] px-4 py-10">
      <div className="mx-auto max-w-lg space-y-5">
        <div className="rounded-3xl border border-black/5 bg-white p-6 text-center shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
            {business?.name}
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-stone-900">
            Order #{order.orderNumber}
          </h1>
          <p
            className={`mt-1 text-sm font-bold ${order.status === "cancelled" ? "text-red-600" : "text-emerald-700"}`}
          >
            {STEP_LABELS[order.status]}
          </p>

          {order.status !== "cancelled" && (
            <div className="mt-6 flex items-center justify-between">
              {STEPS.map((step, i) => (
                <div key={step} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div
                      className={`h-1 flex-1 ${i === 0 ? "opacity-0" : i <= currentStep || order.status === "completed" ? "bg-emerald-600" : "bg-stone-200"}`}
                    />
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        i <= currentStep || order.status === "completed"
                          ? "bg-emerald-600 text-white"
                          : "bg-stone-200 text-stone-500"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div
                      className={`h-1 flex-1 ${i === STEPS.length - 1 ? "opacity-0" : i < currentStep || order.status === "completed" ? "bg-emerald-600" : "bg-stone-200"}`}
                    />
                  </div>
                  <p className="mt-1.5 hidden text-center text-[9px] font-medium text-stone-500 sm:block">
                    {STEP_LABELS[step]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <p className="mb-3 font-bold text-stone-900">Order Summary</p>
          {items.map((item, i) => (
            <div
              key={i}
              className="flex justify-between border-b border-stone-100 py-2 text-sm last:border-0"
            >
              <span className="text-stone-600">
                {item.qty} × {item.name}
              </span>
              <span className="font-semibold">
                {formatPaisa(item.lineTotalPaisa)}
              </span>
            </div>
          ))}
          <div className="mt-3 flex justify-between text-base font-extrabold text-stone-900">
            <span>Total ({order.paymentMethod.toUpperCase()})</span>
            <span>{formatPaisa(order.totalPaisa)}</span>
          </div>
        </div>

        {showProofForm && business && (
          <div className="space-y-3 rounded-3xl border border-amber-200 bg-amber-50 p-6">
            <p className="font-bold text-amber-900">Payment Pending</p>
            <p className="text-sm text-amber-800">
              {order.paymentMethod === "easypaisa" &&
                business.paymentSettings.easypaisa &&
                `EasyPaisa: ${business.paymentSettings.easypaisa.accountName} — ${business.paymentSettings.easypaisa.number}`}
              {order.paymentMethod === "jazzcash" &&
                business.paymentSettings.jazzcash &&
                `JazzCash: ${business.paymentSettings.jazzcash.accountName} — ${business.paymentSettings.jazzcash.number}`}
            </p>
            <p className="text-xs text-amber-700">
              Paisay bhejne ke baad TID ya screenshot yahan submit karein:
            </p>
            <Input
              value={tid}
              onChange={(e) => setTid(e.target.value)}
              placeholder="Transaction ID (TID)"
              className="bg-white"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="w-full text-xs text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold"
            />
            <Button
              onClick={sendProof}
              disabled={submitting}
              className="w-full rounded-full bg-amber-600 text-white hover:bg-amber-700"
            >
              {submitting ? "Submitting..." : "Submit Payment Proof"}
            </Button>
          </div>
        )}

        {proofStatus === "submitted" && (
          <div className="rounded-3xl border border-blue-200 bg-blue-50 p-5 text-center text-sm font-medium text-blue-800">
            Payment proof review ho raha hai — shop jald confirm karegi.
          </div>
        )}
        {order.paymentStatus === "paid" && (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-center text-sm font-medium text-emerald-800">
            ✓ Payment received
          </div>
        )}

        {canRate && (
          <Link
            href={`./${token}/rate`}
            className="block rounded-3xl bg-emerald-700 p-5 text-center font-extrabold text-white shadow-md hover:bg-emerald-800"
          >
            ⭐ Rate Your Experience {order.status === "delivered" ? "& Tip" : ""}
          </Link>
        )}
        {hasRating && (
          <p className="text-center text-sm text-stone-500">
            Shukriya — aap ki rating mil gayi! 💚
          </p>
        )}
      </div>
    </div>
  );
}
