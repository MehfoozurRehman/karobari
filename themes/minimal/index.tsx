import Link from "next/link";
import Image from "next/image";
import { StoreHeader } from "@/components/storefront/store-header";
import { ItemGrid } from "@/components/storefront/item-grid";
import { StoreFooter } from "@/themes/classic";
import type { ThemeProps } from "@/themes/types";

const ACCENT = "#0f172a";

export function MinimalHome({ data, content }: ThemeProps) {
  const { business, heroImageUrl } = data;
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <StoreHeader name={business.name} accent={ACCENT} />

      <section className="border-b border-slate-100">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:grid-cols-2 sm:py-24">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {business.city ?? "Pakistan"} · {business.category}
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {content.hero.headline}
            </h1>
            <p className="mt-4 leading-relaxed text-slate-500">
              {content.hero.subheadline}
            </p>
            <Link
              href="/menu"
              className="mt-8 inline-block border-b-2 border-slate-900 pb-0.5 text-base font-semibold hover:opacity-70"
            >
              {content.hero.ctaText} →
            </Link>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={business.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">
                {business.name.charAt(0)}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-14">
        <ItemGrid data={data} accent={ACCENT} />
      </section>

      <section className="border-t border-slate-100 py-16">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h2 className="text-xl font-bold">{content.about.title}</h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-500">
            {content.about.body}
          </p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-slate-500">
            {content.highlights.map((h) => (
              <div key={h.title}>
                <p className="font-bold text-slate-900">{h.title}</p>
                <p className="mt-1">{h.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <StoreFooter name={business.name} whatsappNumber={data.whatsappNumber} />
    </div>
  );
}
