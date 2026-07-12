import Image from "next/image";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { formatPaisa } from "@/lib/currency";
import type { StoreData } from "@/themes/types";

export function effectivePricePaisa(item: StoreData["items"][number]): number {
  return item.discountPct
    ? Math.round(item.pricePaisa * (1 - item.discountPct / 100))
    : item.pricePaisa;
}

export function ItemGrid({
  data,
  accent,
  categoryFilter,
}: {
  data: StoreData;
  accent: string;
  categoryFilter?: string;
}) {
  const categories = data.categories.filter(
    (c) => !categoryFilter || c._id === categoryFilter,
  );
  const uncategorized = data.items.filter((i) => !i.categoryId);

  const sections: Array<{ name: string; items: StoreData["items"] }> = [
    ...categories.map((c) => ({
      name: c.name,
      items: data.items.filter((i) => i.categoryId === c._id),
    })),
    ...(uncategorized.length > 0 && !categoryFilter
      ? [{ name: "", items: uncategorized }]
      : []),
  ].filter((s) => s.items.length > 0);

  return (
    <div className="space-y-10">
      {sections.map((section) => (
        <section key={section.name || "_"}>
          {section.name && (
            <h2 className="mb-4 text-xl font-extrabold tracking-tight text-stone-900">
              {section.name}
            </h2>
          )}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {section.items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm"
              >
                <div className="relative aspect-square bg-stone-100">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-3xl">
                      🛍️
                    </div>
                  )}
                  {item.discountPct ? (
                    <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-extrabold text-black">
                      -{item.discountPct}%
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col justify-between gap-2 p-3">
                  <div>
                    <p className="text-sm font-bold leading-tight text-stone-900">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-stone-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-extrabold" style={{ color: accent }}>
                      {item.discountPct ? (
                        <>
                          <span className="mr-1 text-[10px] font-medium text-stone-400 line-through">
                            {formatPaisa(item.pricePaisa)}
                          </span>
                          {formatPaisa(effectivePricePaisa(item))}
                        </>
                      ) : (
                        formatPaisa(item.pricePaisa)
                      )}
                    </div>
                    <AddToCartButton
                      itemId={item._id}
                      name={item.name}
                      unitPricePaisa={effectivePricePaisa(item)}
                      imageUrl={item.imageUrl}
                      accent={accent}
                      disabled={!item.available}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
      {sections.length === 0 && (
        <p className="py-16 text-center text-stone-500">
          Menu abhi update ho raha hai — thori dair mein check karein.
        </p>
      )}
    </div>
  );
}
