import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";

async function sendWhatsAppMessage(to: string, text: string, phoneNumberId: string, accessToken: string) {
  try {
    await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        type: "text",
        text: { body: text },
      }),
    });
  } catch (err) {
    console.error("Error sending message", err);
  }
}

async function getAIResponse(prompt: string, apiKey: string) {
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("OpenAI call error", err);
    return "Error getting response.";
  }
}

export const handleWebhookVerify = httpAction(async (ctx, request) => {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
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
      const metadata = value?.metadata;

      if (message && message.type === "text" && metadata) {
        const text = message.text.body.trim();
        const lowerText = text.toLowerCase();
        const senderPhone = message.from;
        const senderName = contact?.profile?.name || "User";
        const phoneNumberId = metadata.phone_number_id;

        const whatsappToken = process.env.WHATSAPP_ACCESS_TOKEN || "";
        const openaiKey = process.env.OPENAI_API_KEY || "";

        const session = await ctx.runQuery(api.onboarding.getSession, { phone: senderPhone });

        if (lowerText === "start business" || lowerText === "start") {
          await ctx.runMutation(api.onboarding.createOrUpdateSession, {
            phone: senderPhone,
            step: "awaiting_name",
          });
          const reply = "Welcome to Karobari! Hum aapka online setup 2 minutes me ready krdein ge. Apni shop/business ka naam bataein?";
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
          return new Response("OK", { status: 200 });
        }

        if (!session || session.step === "idle") {
          const prompt = `Write a short friendly message in Roman Urdu explaining what "Karobari" is. Keep it under 60 words. Mention that users can create their online storefront and manage their orders, payments, and salary rosters automatically over WhatsApp. Advise them to reply with "start business" to launch their store right now. The user's query was: "${text}"`;
          const reply = await getAIResponse(prompt, openaiKey);
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
          return new Response("OK", { status: 200 });
        }

        if (session.step === "awaiting_name") {
          await ctx.runMutation(api.onboarding.createOrUpdateSession, {
            phone: senderPhone,
            step: "awaiting_industry",
            businessName: text,
          });
          const reply = "Aapka business kis category/industry me hai? (e.g., Restaurant, Salon, Kiryana, Retail, Services)";
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
        } else if (session.step === "awaiting_industry") {
          await ctx.runMutation(api.onboarding.createOrUpdateSession, {
            phone: senderPhone,
            step: "awaiting_city",
            industry: text,
          });
          const reply = "Aap kis city se belong krte hain? (e.g. Karachi, Lahore, Islamabad, Peshawar)";
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
        } else if (session.step === "awaiting_city") {
          await ctx.runMutation(api.onboarding.createOrUpdateSession, {
            phone: senderPhone,
            step: "awaiting_payment_gateway",
            city: text,
          });
          const reply = "Aap customer se advance payment kis gateway pe receive krna chahte hain? (e.g. EasyPaisa, JazzCash, Meezan Bank)";
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
        } else if (session.step === "awaiting_payment_gateway") {
          await ctx.runMutation(api.onboarding.createOrUpdateSession, {
            phone: senderPhone,
            step: "awaiting_payment_number",
            paymentGatewayName: text,
          });
          const reply = `Aapka select kiya gya gateway ${text} hai. Apka is wallet/bank account ka number kya hai?`;
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
        } else if (session.step === "awaiting_payment_number") {
          await ctx.runMutation(api.onboarding.createOrUpdateSession, {
            phone: senderPhone,
            step: "awaiting_payment_title",
            paymentGatewayNumber: text,
          });
          const reply = "Payment details verification ke liye, account title (naam) kya hai?";
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
        } else if (session.step === "awaiting_payment_title") {
          const finalTitle = text;
          const slug = (session.businessName || "shop").toLowerCase().replace(/[^a-z0-9]+/g, "-");

          await ctx.runMutation(api.onboarding.registerBusiness, {
            name: session.businessName || "My Shop",
            slug: slug,
            industry: session.industry || "retail",
            ownerName: senderName,
            ownerPhone: senderPhone,
            paymentGatewayName: session.paymentGatewayName || "EasyPaisa",
            paymentGatewayNumber: session.paymentGatewayNumber || "",
            paymentGatewayTitle: finalTitle,
          });

          await ctx.runMutation(api.onboarding.deleteSession, { phone: senderPhone });

          const reply = `Mubarak ho! Aapki online dukaan create ho chuki hai. Aap is link pr details check kr skte hain:\n\n${slug}.karobari.pk\n\nAb aap orders receive krne ke liye ready hain!`;
          await sendWhatsAppMessage(senderPhone, reply, phoneNumberId, whatsappToken);
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    return new Response("Internal Server Error", { status: 500 });
  }
});
