import type { Metadata } from "next";
import { getStore } from "@/lib/storefront";
import { resolveTheme } from "@/themes/registry";
import { defaultSiteContent, type SiteContent } from "@/themes/types";
import { StoreUnavailable } from "@/components/storefront/store-unavailable";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const data = await getStore(decodeURIComponent(domain));
  if (!data) return { title: "Store not found" };
  const content = (data.siteContent as SiteContent | null) ?? null;
  return {
    title: content?.seo.title ?? data.business.name,
    description: content?.seo.description ?? data.business.description,
  };
}

export default async function StoreHomePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const data = await getStore(decodeURIComponent(domain));
  if (!data) return <StoreUnavailable />;
  if (data.business.status === "suspended")
    return <StoreUnavailable name={data.business.name} />;

  const content =
    (data.siteContent as SiteContent | null) ??
    defaultSiteContent(data.business.name, data.business.description);
  const { Home } = resolveTheme(data.business.themeId);
  return <Home data={data} content={content} />;
}
