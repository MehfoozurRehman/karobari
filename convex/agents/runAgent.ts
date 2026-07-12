import { generateText, stepCountIs, tool, type ToolSet } from "ai";
import { openai } from "@ai-sdk/openai";
import { internal } from "../_generated/api";
import type { ActionCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { sendText } from "../whatsapp/send";

export async function runAgent(
  ctx: ActionCtx,
  args: {
    conversationId: Id<"conversations">;
    phoneNumberId: string;
    accessToken: string;
    peerPhone: string;
    system: string;
    tools: ToolSet;
  },
): Promise<void> {
  const history: Doc<"messages">[] = await ctx.runQuery(
    internal.whatsapp.messagesDb.recentMessages,
    { conversationId: args.conversationId, limit: 20 },
  );

  const messages = history
    .filter((m) => m.text && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.text!,
    }));

  const result = await generateText({
    model: openai("gpt-5-mini"),
    system: args.system,
    messages,
    tools: args.tools,
    stopWhen: stepCountIs(6),
  });

  const reply =
    result.text.trim() ||
    "Maazrat, kuch masla ho gaya. Dobara message karein.";

  await sendText(ctx, {
    phoneNumberId: args.phoneNumberId,
    accessToken: args.accessToken,
    conversationId: args.conversationId,
    to: args.peerPhone,
    text: reply,
  });
}

export { tool, openai };
