"use client";

import { useRef, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPaisa } from "@/lib/currency";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  due: "bg-amber-100 text-amber-800",
  proof_submitted: "bg-purple-100 text-purple-800",
  paid: "bg-emerald-100 text-emerald-800",
  waived: "bg-stone-100 text-stone-600",
};

export default function BillingPage() {
  const { isAuthenticated } = useConvexAuth();
  const ledger = useQuery(api.billing.myLedger, isAuthenticated ? {} : "skip");
  const generateUploadUrl = useMutation(api.billing.generatePaymentUploadUrl);
  const submitPayment = useMutation(api.billing.submitPlatformPayment);

  const [payingEntry, setPayingEntry] = useState<string | null>(null);
  const [method, setMethod] = useState<string>("easypaisa");
  const [tid, setTid] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(entryId: string) {
    const file = fileRef.current?.files?.[0];
    if (!tid && !file) {
      toast.error("TID ya screenshot dein");
      return;
    }
    setSubmitting(true);
    try {
      let screenshotStorageId: Id<"_storage"> | undefined;
      if (file) {
        const uploadUrl = await generateUploadUrl({});
        const res = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = await res.json();
        screenshotStorageId = json.storageId;
      }
      await submitPayment({
        ledgerEntryId: entryId as Id<"ledgerEntries">,
        method: method as "easypaisa" | "jazzcash" | "bank",
        tid: tid || undefined,
        screenshotStorageId,
      });
      toast.success("Payment proof submit ho gaya — review ke baad account active rahega");
      setPayingEntry(null);
      setTid("");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Billing
        </h1>
        <p className="text-sm text-stone-500">
          20 free orders, phir Rs. 300/month + 2% per completed order.
        </p>
      </div>

      {ledger && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          Free orders used:{" "}
          <strong>
            {ledger.freeOrdersUsed} / {ledger.freeOrderQuota}
          </strong>
          {ledger.freeOrdersUsed < ledger.freeOrderQuota &&
            " — abhi tak sab kuch bilkul free hai!"}
        </div>
      )}

      <div className="space-y-3">
        {ledger?.entries.length === 0 && (
          <Card className="rounded-2xl border-stone-200">
            <CardContent className="py-12 text-center text-sm text-stone-500">
              Abhi tak koi invoice nahi. Free quota ke baad monthly invoices
              yahan aayenge.
            </CardContent>
          </Card>
        )}
        {ledger?.entries.map((entry) => {
          const total = entry.baseFeePaisa + entry.commissionPaisa;
          const payable =
            entry.status === "due" || entry.status === "proof_submitted";
          return (
            <Card key={entry._id} className="rounded-2xl border-stone-200">
              <CardContent className="space-y-3 p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-stone-900">{entry.period}</p>
                    <p className="text-xs text-stone-500">
                      Base {formatPaisa(entry.baseFeePaisa)} + 2% commission{" "}
                      {formatPaisa(entry.commissionPaisa)} on{" "}
                      {entry.completedOrderCount} orders (
                      {formatPaisa(entry.completedVolumePaisa)} volume)
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-extrabold text-stone-900">
                      {formatPaisa(total)}
                    </p>
                    <Badge
                      className={`border-none capitalize ${STATUS_STYLES[entry.status]}`}
                    >
                      {entry.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {entry.status === "due" && (
                  <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                    Pay to Karobari: EasyPaisa / JazzCash{" "}
                    <strong>0329 0203450</strong> (Karobari) — phir yahan proof
                    submit karein.
                  </div>
                )}

                {payable && payingEntry !== entry._id && (
                  <Button
                    variant="outline"
                    className="rounded-full border-emerald-200 text-emerald-700"
                    onClick={() => setPayingEntry(entry._id)}
                  >
                    {entry.status === "proof_submitted"
                      ? "Resubmit Proof"
                      : "Submit Payment Proof"}
                  </Button>
                )}

                {payingEntry === entry._id && (
                  <div className="space-y-3 rounded-xl border border-stone-200 p-4">
                    <Select value={method} onValueChange={(v) => setMethod(v ?? "easypaisa")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                        <SelectItem value="jazzcash">JazzCash</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      value={tid}
                      onChange={(e) => setTid(e.target.value)}
                      placeholder="Transaction ID (TID)"
                    />
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="w-full text-xs text-stone-600 file:mr-3 file:rounded-full file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-xs file:font-semibold"
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="rounded-full"
                        onClick={() => setPayingEntry(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={submitting}
                        className="flex-1 rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                        onClick={() => submit(entry._id)}
                      >
                        {submitting ? "Submitting..." : "Submit Proof"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
