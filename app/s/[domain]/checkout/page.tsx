import { getStore } from "@/lib/storefront";
import { StoreHeader } from "@/components/storefront/store-header";
import { StoreUnavailable } from "@/components/storefront/store-unavailable";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export default async function CheckoutPage({
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
          Checkout
        </h1>
        <CheckoutForm
          businessId={data.business._id}
          paymentSettings={data.business.paymentSettings}
          whatsappNumber={data.whatsappNumber}
        />
      </div>
    </div>
  );
}
