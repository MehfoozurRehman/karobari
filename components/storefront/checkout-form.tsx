"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useCart, cartTotalPaisa } from "@/components/storefront/cart-store";
import { formatPaisa } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type PaymentSettings = {
  codEnabled: boolean;
  easypaisa?: { accountName: string; number: string };
  jazzcash?: { accountName: string; number: string };
  bank?: { bankName: string; accountTitle: string; iban: string };
};

export function CheckoutForm({
  businessId,
  paymentSettings,
  whatsappNumber,
}: {
  businessId: string;
  paymentSettings: PaymentSettings;
  whatsappNumber: string | null;
}) {
  const router = useRouter();
  const { lines, clear } = useCart();
  const createOrder = useMutation(api.orders.createFromStorefront);

  const methods = [
    ...(paymentSettings.codEnabled
      ? [{ id: "cod" as const, label: "Cash on Delivery", detail: "Order milne par cash dein" }]
      : []),
    ...(paymentSettings.easypaisa
      ? [{
          id: "easypaisa" as const,
          label: "EasyPaisa",
          detail: `${paymentSettings.easypaisa.accountName} · ${paymentSettings.easypaisa.number}`,
        }]
      : []),
    ...(paymentSettings.jazzcash
      ? [{
          id: "jazzcash" as const,
          label: "JazzCash",
          detail: `${paymentSettings.jazzcash.accountName} · ${paymentSettings.jazzcash.number}`,
        }]
      : []),
  ];

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState<"cod" | "easypaisa" | "jazzcash">(
    methods[0]?.id ?? "cod",
  );
  const [placing, setPlacing] = useState(false);

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white py-16 text-center text-stone-500">
        Cart khali hai — pehle items add karein.
      </div>
    );
  }

  async function placeOrder() {
    if (!name || !phone || !address) {
      toast.error("Name, phone aur address zaroori hain");
      return;
    }
    setPlacing(true);
    try {
      const result = await createOrder({
        businessId: businessId as Id<"businesses">,
        customerName: name,
        customerPhone: phone,
        customerAddress: address,
        note: note || undefined,
        paymentMethod: method,
        items: lines.map((l) => ({
          catalogItemId: l.itemId as Id<"catalogItems">,
          qty: l.qty,
        })),
      });
      clear();
      if (whatsappNumber) {
        window.open(
          `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
            `Order #${result.orderNumber} confirm karna hai`,
          )}`,
          "_blank",
        );
      }
      router.push(`/order/${result.trackingToken}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Order failed");
      setPlacing(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="space-y-4 rounded-2xl border border-black/5 bg-white p-5">
        <div className="space-y-2">
          <Label>Your Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp Number</Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="03xx xxxxxxx"
            inputMode="tel"
          />
        </div>
        <div className="space-y-2">
          <Label>Delivery Address</Label>
          <Textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
          />
        </div>
        <div className="space-y-2">
          <Label>Note (optional)</Label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Extra raita, no onions..."
          />
        </div>
      </div>

      <div className="space-y-3 rounded-2xl border border-black/5 bg-white p-5">
        <p className="font-bold text-stone-900">Payment Method</p>
        {methods.map((m) => (
          <label
            key={m.id}
            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-3.5 transition-colors ${
              method === m.id
                ? "border-emerald-600 bg-emerald-50"
                : "border-stone-200"
            }`}
          >
            <div>
              <p className="text-sm font-bold text-stone-900">{m.label}</p>
              <p className="text-xs text-stone-500">{m.detail}</p>
            </div>
            <input
              type="radio"
              checked={method === m.id}
              onChange={() => setMethod(m.id)}
              className="h-4 w-4 accent-emerald-700"
            />
          </label>
        ))}
        {(method === "easypaisa" || method === "jazzcash") && (
          <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
            Order place karne ke baad upar diye gaye account par paisay bhejein,
            phir tracking page par TID ya screenshot submit karein.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5">
        <div>
          <p className="text-xs text-stone-500">Total</p>
          <p className="text-xl font-extrabold text-stone-900">
            {formatPaisa(cartTotalPaisa(lines))}
          </p>
        </div>
        <Button
          onClick={placeOrder}
          disabled={placing}
          className="rounded-full bg-emerald-700 px-8 py-6 text-base font-extrabold text-white hover:bg-emerald-800"
        >
          {placing ? "Placing order..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
