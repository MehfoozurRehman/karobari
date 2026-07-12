import { Suspense } from "react";
import { OrderTracker } from "@/components/storefront/order-tracker";

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ domain: string; token: string }>;
}) {
  const { token } = await params;
  return (
    <Suspense fallback={null}>
      <OrderTracker token={token} />
    </Suspense>
  );
}
