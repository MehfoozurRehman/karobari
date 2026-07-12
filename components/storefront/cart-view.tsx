"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, cartTotalPaisa } from "@/components/storefront/cart-store";
import { formatPaisa } from "@/lib/currency";

export function CartView() {
  const { lines, setQty, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="rounded-2xl border border-black/5 bg-white py-16 text-center">
        <p className="text-4xl">🛒</p>
        <p className="mt-3 text-stone-500">Cart khali hai.</p>
        <Link
          href="/menu"
          className="mt-4 inline-block rounded-full bg-emerald-700 px-6 py-2.5 text-sm font-bold text-white"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-black/5 bg-white">
        {lines.map((line) => (
          <div
            key={line.itemId}
            className="flex items-center gap-3 border-b border-stone-100 p-4 last:border-0"
          >
            {line.imageUrl ? (
              <Image
                src={line.imageUrl}
                alt={line.name}
                width={56}
                height={56}
                className="h-14 w-14 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-stone-100 text-xl">
                🛍️
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-stone-900">{line.name}</p>
              <p className="text-sm font-semibold text-emerald-700">
                {formatPaisa(line.unitPricePaisa)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(line.itemId, line.qty - 1)}
                className="h-8 w-8 rounded-full border border-stone-200 font-bold text-stone-600 hover:bg-stone-100"
              >
                −
              </button>
              <span className="w-6 text-center font-bold">{line.qty}</span>
              <button
                onClick={() => setQty(line.itemId, line.qty + 1)}
                className="h-8 w-8 rounded-full border border-stone-200 font-bold text-stone-600 hover:bg-stone-100"
              >
                +
              </button>
            </div>
            <button
              onClick={() => remove(line.itemId)}
              className="ml-1 text-stone-400 hover:text-red-600"
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-5">
        <div>
          <p className="text-xs text-stone-500">Total</p>
          <p className="text-xl font-extrabold text-stone-900">
            {formatPaisa(cartTotalPaisa(lines))}
          </p>
        </div>
        <Link
          href="/checkout"
          className="rounded-full bg-emerald-700 px-8 py-3 font-extrabold text-white shadow-md hover:bg-emerald-800"
        >
          Checkout →
        </Link>
      </div>
    </div>
  );
}
