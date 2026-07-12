"use client";

import { useCart } from "@/components/storefront/cart-store";
import { toast } from "sonner";

export function AddToCartButton({
  itemId,
  name,
  unitPricePaisa,
  imageUrl,
  accent = "#047857",
  disabled,
}: {
  itemId: string;
  name: string;
  unitPricePaisa: number;
  imageUrl: string | null;
  accent?: string;
  disabled?: boolean;
}) {
  const add = useCart((s) => s.add);
  return (
    <button
      disabled={disabled}
      onClick={() => {
        add({ itemId, name, unitPricePaisa, imageUrl });
        toast.success(`${name} added to cart`);
      }}
      className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-transform active:scale-95 disabled:opacity-40"
      style={{ backgroundColor: accent }}
    >
      {disabled ? "Unavailable" : "Add +"}
    </button>
  );
}
