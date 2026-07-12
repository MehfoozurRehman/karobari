import { getStore } from "@/lib/storefront";
import { StoreHeader } from "@/components/storefront/store-header";
import { ItemGrid } from "@/components/storefront/item-grid";
import { StoreUnavailable } from "@/components/storefront/store-unavailable";
import { StoreFooter } from "@/themes/classic";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const data = await getStore(decodeURIComponent(domain));
  if (!data || data.business.status === "suspended")
    return <StoreUnavailable name={data?.business.name} />;

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <StoreHeader name={data.business.name} />
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-stone-900">
          Full Menu
        </h1>
        <ItemGrid data={data} accent="#047857" />
      </div>
      <StoreFooter
        name={data.business.name}
        whatsappNumber={data.whatsappNumber}
      />
    </div>
  );
}
