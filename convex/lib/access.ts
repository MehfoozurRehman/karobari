import { Doc } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

/** Get the current authenticated user document, or null. */
export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;
  return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
    .unique();
}

/** Require an authenticated user with a linked business; returns both. */
export async function requireOwner(ctx: QueryCtx | MutationCtx): Promise<{
  user: Doc<"users">;
  business: Doc<"businesses">;
}> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  if (!user.businessId) throw new Error("No business linked to this account");
  const business = await ctx.db.get("businesses", user.businessId);
  if (!business) throw new Error("Business not found");
  return { user, business };
}

/** Require the current user to be a platform admin. */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) throw new Error("Not authenticated");
  if (user.role !== "admin") throw new Error("Not authorized");
  return user;
}
