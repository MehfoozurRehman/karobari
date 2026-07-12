"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function WebsitePage() {
  const { isAuthenticated } = useConvexAuth();
  const business = useQuery(
    api.businesses.getMine,
    isAuthenticated ? {} : "skip",
  );
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "karobari.shop";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Website
        </h1>
        <p className="text-sm text-stone-500">
          Your storefront theme, content, and domains.
        </p>
      </div>
      {business && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <p className="text-sm text-stone-500">Your store is live at</p>
          <a
            href={`https://${business.slug}.${rootDomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-bold text-emerald-700 hover:underline"
          >
            {business.slug}.{rootDomain}
          </a>
        </div>
      )}
      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
        Theme picker, AI content editor, and custom domain connection are
        coming in this build — next sections.
      </div>
    </div>
  );
}
