import Link from "next/link";
import Image from "next/image";
import { StoreHeader } from "@/components/storefront/store-header";
import { ItemGrid } from "@/components/storefront/item-grid";
import type { ThemeProps } from "@/themes/types";
import { Clock, MapPin, Truck } from "lucide-react";

const ACCENT = "#047857";

export function ClassicHome({ data, content }: ThemeProps) {
  const { business, heroImageUrl } = data;
  return (
    <div className="min-h-screen bg-[#faf7f2] text-stone-900">
      <StoreHeader name={business.name} accent={ACCENT} />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-black/5 bg-emerald-950 text-white">
        {heroImageUrl && (
          <Image
            src={heroImageUrl}
            alt={business.name}
            fill
            className="object-cover opacity-40"
            priority
          />
        )}
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:py-28">
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {content.hero.headline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-emerald-100 sm:text-lg">
            {content.hero.subheadline}
          </p>
          <Link
            href="/menu"
            className="mt-8 inline-block rounded-full bg-amber-400 px-8 py-3 text-base font-extrabold text-black shadow-lg transition-transform hover:scale-105"
          >
            {content.hero.ctaText}
          </Link>
        </div>
      </section>

      {/* Info strip */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-6 text-sm text-stone-600 sm:grid-cols-3">
          {business.hours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-700" /> {business.hours}
            </div>
          )}
          {business.address && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-700" />
              {business.address}
              {business.city ? `, ${business.city}` : ""}
            </div>
          )}
          {business.deliveryInfo && (
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-emerald-700" />
              {business.deliveryInfo}
            </div>
          )}
        </div>
      </section>

      {/* Catalog */}
      <section className="mx-auto max-w-5xl px-4 py-12">
        <ItemGrid data={data} accent={ACCENT} />
      </section>

      {/* About + highlights */}
      <section className="border-t border-black/5 bg-white py-14">
        <div className="mx-auto max-w-5xl space-y-10 px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-extrabold text-stone-900">
              {content.about.title}
            </h2>
            <p className="mt-3 leading-relaxed text-stone-600">
              {content.about.body}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {content.highlights.map((h) => (
              <div
                key={h.title}
                className="rounded-2xl border border-black/5 bg-[#faf7f2] p-6 text-center"
              >
                <p className="font-bold text-stone-900">{h.title}</p>
                <p className="mt-1.5 text-sm text-stone-600">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoreFooter name={business.name} whatsappNumber={data.whatsappNumber} />
    </div>
  );
}

export function StoreFooter({
  name,
  whatsappNumber,
}: {
  name: string;
  whatsappNumber: string | null;
}) {
  return (
    <footer className="border-t border-black/5 bg-white py-10 text-center text-sm text-stone-500">
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Assalam o Alaikum! Menu bhejein.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-4 inline-block rounded-full bg-[#25D366] px-6 py-2.5 font-bold text-white shadow-md"
        >
          💬 Order on WhatsApp
        </a>
      )}
      <p>
        © {new Date().getFullYear()} {name} · Powered by{" "}
        <a
          href={`https://${process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "karobari.shop"}`}
          className="font-semibold text-emerald-700 hover:underline"
        >
          Karobari
        </a>
      </p>
    </footer>
  );
}
