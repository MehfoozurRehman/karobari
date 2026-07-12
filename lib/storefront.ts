import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import {
  unstable_cacheLife as cacheLife,
  unstable_cacheTag as cacheTag,
} from "next/cache";

export async function getStore(tenant: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag(`store-${tenant}`);
  return await fetchQuery(api.businesses.getByTenant, { tenant });
}
