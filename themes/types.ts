import { api } from "@/convex/_generated/api";
import { FunctionReturnType } from "convex/server";

/** AI-generated (or default) storefront copy, stored in siteContent.content. */
export type SiteContent = {
  hero: { headline: string; subheadline: string; ctaText: string };
  about: { title: string; body: string };
  highlights: Array<{ title: string; text: string }>;
  seo: { title: string; description: string };
};

export type StoreData = NonNullable<
  FunctionReturnType<typeof api.businesses.getByTenant>
>;

export type ThemeProps = {
  data: StoreData;
  content: SiteContent;
};

export function defaultSiteContent(businessName: string, description: string): SiteContent {
  return {
    hero: {
      headline: businessName,
      subheadline: description,
      ctaText: "Order Now",
    },
    about: { title: `About ${businessName}`, body: description },
    highlights: [
      { title: "Fresh & Quality", text: "Hamesha taaza aur behtareen quality." },
      { title: "Fast Service", text: "Jaldi delivery aur turant jawab." },
      { title: "Order on WhatsApp", text: "WhatsApp par seedha order karein." },
    ],
    seo: { title: businessName, description },
  };
}
