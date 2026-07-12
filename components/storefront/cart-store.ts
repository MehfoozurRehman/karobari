"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  itemId: string;
  name: string;
  unitPricePaisa: number;
  qty: number;
  imageUrl: string | null;
};

type CartState = {
  /** Tenant slug the cart belongs to — cleared when visiting another store. */
  tenant: string | null;
  lines: CartLine[];
  setTenant: (tenant: string) => void;
  add: (line: Omit<CartLine, "qty">) => void;
  setQty: (itemId: string, qty: number) => void;
  remove: (itemId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      tenant: null,
      lines: [],
      setTenant: (tenant) => {
        if (get().tenant !== tenant) set({ tenant, lines: [] });
      },
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.itemId === line.itemId);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.itemId === line.itemId ? { ...l, qty: l.qty + 1 } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, qty: 1 }] };
        }),
      setQty: (itemId, qty) =>
        set((state) => ({
          lines:
            qty <= 0
              ? state.lines.filter((l) => l.itemId !== itemId)
              : state.lines.map((l) =>
                  l.itemId === itemId ? { ...l, qty } : l,
                ),
        })),
      remove: (itemId) =>
        set((state) => ({
          lines: state.lines.filter((l) => l.itemId !== itemId),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "karobari-cart" },
  ),
);

export function cartTotalPaisa(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPricePaisa * l.qty, 0);
}
