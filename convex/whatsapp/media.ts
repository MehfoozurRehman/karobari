import type { ActionCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

const GRAPH_BASE = "https://graph.facebook.com/v23.0";

export async function storeInboundMedia(
  ctx: ActionCtx,
  args: { mediaId: string; accessToken: string },
): Promise<Id<"_storage"> | null> {
  try {
    const metaRes = await fetch(`${GRAPH_BASE}/${args.mediaId}`, {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    });
    if (!metaRes.ok) return null;
    const meta = await metaRes.json();
    const fileRes = await fetch(meta.url, {
      headers: { Authorization: `Bearer ${args.accessToken}` },
    });
    if (!fileRes.ok) return null;
    const blob = await fileRes.blob();
    return await ctx.storage.store(blob);
  } catch {
    return null;
  }
}
