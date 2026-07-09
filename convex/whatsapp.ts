import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

export const handleWebhookVerify = httpAction(async (ctx, request) => {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const localVerifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === localVerifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
});

export const handleIncomingMessage = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();

    if (body.object === "whatsapp_business_account") {
      const entry = body.entry?.[0];
      const change = entry?.changes?.[0];
      const value = change?.value;
      const message = value?.messages?.[0];
      const contact = value?.contacts?.[0];

      if (message && message.type === "text") {
        const text = message.text.body.trim().toLowerCase();
        const senderPhone = message.from;
        const senderName = contact?.profile?.name || "User";

        if (text === "start business" || text === "start") {
          await ctx.runMutation(api.queries.submitQuery, {
            name: senderName,
            email: "pending@karobari.pk",
            phone: senderPhone,
            businessName: "New Signup Request",
            message: "User initiated registration flow via WhatsApp",
          });
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
});
