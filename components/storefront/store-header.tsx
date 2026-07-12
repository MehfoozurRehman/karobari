"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/storefront/cart-store";

export function StoreHeader({
  name,
  accent = "#047857",
}: {
  name: string;
  accent?: string;
}) {
  const { lines, setTenant } = useCart();
  const count = lines.reduce((s, l) => s + l.qty, 0);

  useEffect(() => {
    setTenant(window.location.host);
  }, [setTenant]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-extrabold text-white"
            style={{ backgroundColor: accent }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="text-lg font-extrabold tracking-tight text-stone-900">
            {name}
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm font-medium text-stone-600">
          <Link href="/menu" className="hover:text-stone-900">
            Menu
          </Link>
          <Link
            href="/cart"
            className="relative flex items-center gap-1.5 rounded-full px-4 py-2 font-semibold text-white"
            style={{ backgroundColor: accent }}
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-extrabold text-black">
                {count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
