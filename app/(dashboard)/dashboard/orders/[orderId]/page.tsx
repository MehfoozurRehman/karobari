"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPaisa } from "@/lib/currency";
import { formatDate, formatDateTime } from "@/lib/dates";
import { formatPkPhone } from "@/lib/phone";
import {
  NEXT_STATUS,
  STATUS_COLORS,
} from "@/components/dashboard/order-status";
import { toast } from "sonner";

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const { isAuthenticated } = useConvexAuth();
  const data = useQuery(
    api.orders.getMineById,
    isAuthenticated ? { orderId: orderId as Id<"orders"> } : "skip",
  );
  const updateStatus = useMutation(api.orders.updateStatus);
  const markPaid = useMutation(api.orders.markPaid);
  const reviewProof = useMutation(api.paymentsCustomer.reviewProof);

  if (data === undefined)
    return <div className="h-64 animate-pulse rounded-2xl bg-stone-200" />;
  if (data === null)
    return (
      <div className="py-16 text-center text-stone-500">
        Order not found.{" "}
        <Link href="/dashboard/orders" className="text-emerald-700 underline">
          Back to orders
        </Link>
      </div>
    );

  const { order, items, proofs, rating } = data;

  async function transition(status: string) {
    try {
      await updateStatus({
        orderId: order._id,
        status: status as typeof order.status,
      });
      toast.success(`Order moved to ${status}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/orders"
            className="text-xs font-semibold text-stone-500 hover:text-stone-800"
          >
            ← Orders
          </Link>
          <h1 className="flex items-center gap-3 text-2xl font-extrabold text-stone-900">
            Order #{order.orderNumber}
            <Badge
              className={`border-none capitalize ${STATUS_COLORS[order.status]}`}
            >
              {order.status}
            </Badge>
          </h1>
          <p className="text-xs text-stone-500">
            {formatDateTime(order._creationTime)} · via{" "}
            {order.source}
          </p>
        </div>
        <div className="flex gap-2">
          {NEXT_STATUS[order.status]?.map((next) => (
            <Button
              key={next}
              onClick={() => transition(next)}
              variant={next === "cancelled" ? "outline" : "default"}
              className={
                next === "cancelled"
                  ? "rounded-full border-red-200 capitalize text-red-700 hover:bg-red-50"
                  : "rounded-full bg-emerald-700 capitalize text-white hover:bg-emerald-800"
              }
            >
              Mark {next}
            </Button>
          ))}
        </div>
      </div>

      <Card className="rounded-2xl border-stone-200">
        <CardContent className="space-y-3 p-5">
          <h2 className="text-sm font-bold text-stone-900">Items</h2>
          {items.map((item) => (
            <div
              key={item._id}
              className="flex justify-between border-b border-stone-100 pb-2 text-sm last:border-0"
            >
              <span className="text-stone-700">
                {item.qty} × {item.nameSnapshot}
              </span>
              <span className="font-semibold text-stone-900">
                {formatPaisa(item.lineTotalPaisa)}
              </span>
            </div>
          ))}
          <div className="space-y-1 pt-2 text-sm">
            <div className="flex justify-between text-stone-500">
              <span>Subtotal</span>
              <span>{formatPaisa(order.subtotalPaisa)}</span>
            </div>
            {order.discountPaisa > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span>
                <span>-{formatPaisa(order.discountPaisa)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-stone-900">
              <span>Total</span>
              <span>{formatPaisa(order.totalPaisa)}</span>
            </div>
            {order.tipPaisa ? (
              <div className="flex justify-between font-semibold text-amber-700">
                <span>Tip 🎉</span>
                <span>{formatPaisa(order.tipPaisa)}</span>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card className="rounded-2xl border-stone-200">
          <CardContent className="space-y-2 p-5 text-sm">
            <h2 className="font-bold text-stone-900">Customer</h2>
            <p className="text-stone-700">{order.customerName ?? "—"}</p>
            <a
              href={`https://wa.me/${order.customerPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-emerald-700 hover:underline"
            >
              {formatPkPhone(order.customerPhone)}
            </a>
            <p className="text-stone-500">{order.customerAddress ?? "—"}</p>
            {order.note && (
              <p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">
                Note: {order.note}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-stone-200">
          <CardContent className="space-y-3 p-5 text-sm">
            <h2 className="font-bold text-stone-900">Payment</h2>
            <div className="flex items-center gap-2">
              <Badge className="border-none bg-stone-100 uppercase text-stone-700">
                {order.paymentMethod}
              </Badge>
              <Badge
                className={`border-none capitalize ${
                  order.paymentStatus === "paid"
                    ? "bg-emerald-100 text-emerald-800"
                    : order.paymentStatus === "proof_submitted"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-stone-100 text-stone-600"
                }`}
              >
                {order.paymentStatus.replace("_", " ")}
              </Badge>
            </div>
            {order.paymentStatus !== "paid" && (
              <Button
                variant="outline"
                className="rounded-full text-xs"
                onClick={async () => {
                  await markPaid({ orderId: order._id });
                  toast.success("Marked as paid");
                }}
              >
                Mark as Paid
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {proofs.length > 0 && (
        <Card className="rounded-2xl border-stone-200">
          <CardContent className="space-y-4 p-5">
            <h2 className="text-sm font-bold text-stone-900">
              Payment Proofs
            </h2>
            {proofs.map((proof) => (
              <div
                key={proof._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 p-3"
              >
                <div className="space-y-1 text-sm">
                  <p className="font-semibold uppercase text-stone-700">
                    {proof.method}
                  </p>
                  {proof.tid && (
                    <p className="text-stone-500">TID: {proof.tid}</p>
                  )}
                  <Badge
                    className={`border-none capitalize ${
                      proof.status === "accepted"
                        ? "bg-emerald-100 text-emerald-800"
                        : proof.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {proof.status}
                  </Badge>
                </div>
                {proof.screenshotUrl && (
                  <a
                    href={proof.screenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={proof.screenshotUrl}
                      alt="Payment screenshot"
                      width={80}
                      height={80}
                      className="rounded-lg border border-stone-200 object-cover"
                    />
                  </a>
                )}
                {proof.status === "submitted" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                      onClick={async () => {
                        await reviewProof({
                          proofId: proof._id,
                          decision: "accepted",
                        });
                        toast.success("Payment accepted");
                      }}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-red-200 text-red-700"
                      onClick={async () => {
                        await reviewProof({
                          proofId: proof._id,
                          decision: "rejected",
                        });
                        toast.success("Payment rejected");
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {rating && (
        <Card className="rounded-2xl border-stone-200">
          <CardContent className="space-y-1 p-5 text-sm">
            <h2 className="font-bold text-stone-900">Customer Rating</h2>
            <p className="text-amber-500">
              {"★".repeat(rating.stars)}
              {"☆".repeat(5 - rating.stars)}
            </p>
            {rating.comment && <p className="text-stone-600">{rating.comment}</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
