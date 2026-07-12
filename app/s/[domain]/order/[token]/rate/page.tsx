import { Suspense } from "react";
import { RatingForm } from "@/components/storefront/rating-form";

export default async function RatePage({
  params,
}: {
  params: Promise<{ domain: string; token: string }>;
}) {
  const { token } = await params;
  return (
    <Suspense fallback={null}>
      <RatingForm token={token} />
    </Suspense>
  );
}
