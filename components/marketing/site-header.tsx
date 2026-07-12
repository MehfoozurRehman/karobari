import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { waStartBusinessLink } from "@/lib/wa-links";

const nav = [
  { href: "/#features", label: "Features" },
  { href: "/#whatsapp", label: "WhatsApp Agent" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#faf9f6]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/karobari_logo.png"
            alt="Karobari"
            width={34}
            height={34}
            priority
            className="rounded-lg object-contain"
          />
          <span className="text-xl font-extrabold tracking-tight text-stone-900">
            Karobari<span className="text-emerald-600">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-emerald-700"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="hidden sm:block">
            <Button
              variant="ghost"
              className="rounded-full px-5 font-semibold text-stone-700"
            >
              Sign In
            </Button>
          </Link>
          <a href={waStartBusinessLink()} target="_blank" rel="noopener noreferrer">
            <Button className="rounded-full bg-emerald-700 px-5 font-semibold text-white shadow-sm hover:bg-emerald-800">
              Create Store Free
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}
