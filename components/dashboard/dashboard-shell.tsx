"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { UserButton } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SyncUser } from "@/components/dashboard/sync-user";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  UtensilsCrossed,
  Globe,
  MessageSquare,
  Wallet,
  Users,
  Star,
  Receipt,
  Settings,
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
  { href: "/dashboard/catalog", label: "Catalog", icon: UtensilsCrossed },
  { href: "/dashboard/website", label: "Website", icon: Globe },
  { href: "/dashboard/whatsapp", label: "WhatsApp", icon: MessageSquare },
  { href: "/dashboard/payments", label: "Payments", icon: Wallet },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/ratings", label: "Ratings", icon: Star },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const me = useQuery(api.users.getMe, isAuthenticated ? {} : "skip");

  const needsOnboarding =
    me !== undefined && me !== null && me.business === null;

  useEffect(() => {
    if (needsOnboarding && me?.user.role !== "admin") {
      router.replace("/onboarding");
    }
  }, [needsOnboarding, me, router]);

  const suspended = me?.business?.status === "suspended";

  return (
    <div className="flex min-h-screen bg-[#faf9f6]">
      <SyncUser />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-stone-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-stone-200 px-5">
          <Image
            src="/karobari_logo.webp"
            alt="Karobari"
            width={30}
            height={30}
            className="rounded-lg object-contain"
          />
          <span className="text-lg font-extrabold tracking-tight text-stone-900">
            Karobari<span className="text-emerald-600">.</span>
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-emerald-50 text-emerald-800"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                )}
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        {me?.business && (
          <div className="border-t border-stone-200 p-4">
            <p className="truncate text-sm font-bold text-stone-900">
              {me.business.name}
            </p>
            <a
              href={`https://${me.business.slug}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "karobari.shop"}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-emerald-700 hover:underline"
            >
              {me.business.slug}.
              {process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "karobari.shop"}
            </a>
          </div>
        )}
      </aside>

      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-stone-200 bg-white/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3 lg:hidden">
            <Image
              src="/karobari_logo.webp"
              alt="Karobari"
              width={28}
              height={28}
              className="rounded-lg object-contain"
            />
            <span className="font-extrabold text-stone-900">Karobari.</span>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            {me?.user.role === "admin" && (
              <Link
                href="/admin"
                className="rounded-full border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Admin Panel
              </Link>
            )}
            <UserButton />
          </div>
        </header>

        {suspended && (
          <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm font-medium text-red-800">
            Your account is suspended due to an unpaid invoice. Your storefront
            and WhatsApp agent are paused.{" "}
            <Link href="/dashboard/billing" className="font-bold underline">
              Pay now to reactivate →
            </Link>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {isLoading || me === undefined ? (
            <div className="space-y-4">
              <div className="h-8 w-48 animate-pulse rounded-lg bg-stone-200" />
              <div className="h-64 animate-pulse rounded-2xl bg-stone-200" />
            </div>
          ) : (
            children
          )}
        </main>

        <nav className="sticky bottom-0 z-30 flex justify-around border-t border-stone-200 bg-white py-2 lg:hidden">
          {nav.slice(0, 5).map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[10px] font-medium",
                  active ? "text-emerald-700" : "text-stone-500",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
