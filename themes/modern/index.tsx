import Link from "next/link";
import Image from "next/image";
import { StoreHeader } from "@/components/storefront/store-header";
import { ItemGrid } from "@/components/storefront/item-grid";
import { StoreFooter } from "@/themes/classic";
import type { ThemeProps } from "@/themes/types";

const ACCENT = "#7c3aed";

export function ModernHome({ data, content }: ThemeProps) {
  const { business, heroImageUrl } = data;
  return (
    <div className="min-h-screen bg-white text-stone-900">
      <StoreHeader name={business.name} accent={ACCENT} />

      <section className="mx-auto max-w-5xl px-4 pt-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 text-white">
          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              alt={business.name}
              fill
              className="object-cover opacity-30 mix-blend-overlay"
              priority
            />
          )}
          <div className="relative px-6 py-16 text-center sm:px-14 sm:py-24">
            <span className="rounded-full bg-white/15 px-4 py-1 text-xs font-bold uppercase tracking-widest">
              {business.category}
            </span>
            <h1 className="mx-auto mt-5 max-w-2xl text-4xl font-black leading-tight sm:text-6xl">
              {content.hero.headline}
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-violet-100">
              {content.hero.subheadline}
            </p>
            <Link
              href="/menu"
              className="mt-8 inline-block rounded-full bg-white px-8 py-3.5 text-base font-black text-violet-700 shadow-xl transition-transform hover:scale-105"
            >
              {content.hero.ctaText} →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-4 py-10 sm:grid-cols-3">
        {content.highlights.map((h, i) => (
          <div
            key={h.title}
            className={`rounded-3xl p-6 ${
              ["bg-violet-50", "bg-amber-50", "bg-emerald-50"][i % 3]
            }`}
          >
            <p className="font-extrabold text-stone-900">{h.title}</p>
            <p className="mt-1 text-sm text-stone-600">{h.text}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-14">
        <h2 className="mb-6 text-3xl font-black tracking-tight">
          Shop the Menu
        </h2>
        <ItemGrid data={data} accent={ACCENT} />
      </section>

      <section className="bg-stone-950 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="text-2xl font-black">{content.about.title}</h2>
          <p className="mt-3 leading-relaxed text-stone-300">
            {content.about.body}
          </p>
        </div>
      </section>

      <StoreFooter name={business.name} whatsappNumber={data.whatsappNumber} />
    </div>
  );
}
