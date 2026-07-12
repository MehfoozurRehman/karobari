import { getStore } from "@/lib/storefront";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreUnavailable } from "@/components/storefront/store-unavailable";
import { CartView } from "@/components/storefront/cart-view";

export default async function CartPage({
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
      <div className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-2xl font-extrabold text-stone-900">
          Your Cart
        </h1>
        <CartView />
      </div>
    </div>
  );
}
