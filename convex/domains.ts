import {
  action,
  internalAction,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { requireOwner } from "./lib/access";
import { Id } from "./_generated/dataModel";

function vercelHeaders() {
  const token = process.env.VERCEL_TOKEN;
  if (!token) throw new Error("VERCEL_TOKEN is not set");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function vercelBase(path: string) {
  const projectId = process.env.VERCEL_PROJECT_ID;
  if (!projectId) throw new Error("VERCEL_PROJECT_ID is not set");
  const teamQuery = process.env.VERCEL_TEAM_ID
    ? `?teamId=${process.env.VERCEL_TEAM_ID}`
    : "";
  return `https://api.vercel.com${path.replace("{projectId}", projectId)}${teamQuery}`;
}

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const { business } = await requireOwner(ctx);
    return await ctx.db
      .query("customDomains")
      .withIndex("by_businessId", (q) => q.eq("businessId", business._id))
      .take(10);
  },
});

export const ownerBusinessIdInternal = internalQuery({
  args: {},
  handler: async (ctx): Promise<Id<"businesses"> | null> => {
    try {
      const { business } = await requireOwner(ctx);
      return business._id;
    } catch {
      return null;
    }
  },
});

export const insertInternal = internalMutation({
  args: {
    businessId: v.id("businesses"),
    domain: v.string(),
    vercelVerification: v.optional(v.any()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("customDomains")
      .withIndex("by_domain", (q) => q.eq("domain", args.domain))
      .unique();
    if (existing) throw new Error("Domain is already connected");
    await ctx.db.insert("customDomains", {
      businessId: args.businessId,
      domain: args.domain,
      status: "pending_dns",
      vercelVerification: args.vercelVerification,
    });
    return null;
  },
});

export const setStatusInternal = internalMutation({
  args: {
    domainId: v.id("customDomains"),
    status: v.union(
      v.literal("pending_dns"),
      v.literal("verifying"),
      v.literal("active"),
      v.literal("error"),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("customDomains", args.domainId, {
      status: args.status,
    });
    return null;
  },
});

export const pendingInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("customDomains")
      .withIndex("by_domain")
      .take(200);
    return pending.filter((d) => d.status !== "active");
  },
});

export const add = action({
  args: { domain: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const businessId = await ctx.runQuery(
      internal.domains.ownerBusinessIdInternal,
      {},
    );
    if (!businessId) throw new Error("Not authorized");
    const domain = args.domain.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      throw new Error("Invalid domain");
    }

    const res = await fetch(vercelBase("/v10/projects/{projectId}/domains"), {
      method: "POST",
      headers: vercelHeaders(),
      body: JSON.stringify({ name: domain }),
    });
    const json = await res.json();
    if (!res.ok && json?.error?.code !== "domain_already_in_use_by_project") {
      throw new Error(json?.error?.message ?? "Vercel domain API failed");
    }

    await ctx.runMutation(internal.domains.insertInternal, {
      businessId,
      domain,
      vercelVerification: json?.verification ?? undefined,
    });
    return null;
  },
});

export const checkPending = internalAction({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    if (!process.env.VERCEL_TOKEN || !process.env.VERCEL_PROJECT_ID) return null;
    const pending = await ctx.runQuery(internal.domains.pendingInternal, {});
    for (const d of pending) {
      try {
        const res = await fetch(
          vercelBase(`/v6/domains/${d.domain}/config`),
          { headers: vercelHeaders() },
        );
        const json = await res.json();
        if (res.ok && json.misconfigured === false) {
          await ctx.runMutation(internal.domains.setStatusInternal, {
            domainId: d._id,
            status: "active",
          });
        }
      } catch {
      }
    }
    return null;
  },
});
