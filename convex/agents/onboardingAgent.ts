import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import { sendText } from "../whatsapp/send";
import { parseCatalogText } from "../catalogAI";
import { generateSiteContentForBusiness } from "../siteContentAI";
import type { ActionCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";

type Draft = {
  name?: string;
  category?: "restaurant" | "hotel" | "salon" | "shop" | "other";
  description?: string;
  city?: string;
  easypaisa?: { accountName: string; number: string };
  jazzcash?: { accountName: string; number: string };
  categories?: Array<{
    name: string;
    items: Array<{
      name: string;
      description?: string;
      priceRupees: number;
      discountPct?: number;
    }>;
  }>;
};

const ROOT_DOMAIN = () => process.env.APP_ROOT_DOMAIN ?? "karobari.shop";

function detectCategory(text: string): Draft["category"] {
  const t = text.toLowerCase();
  if (/(restaurant|khaana|food|hotel\s?restaurant|cafe|dhaba|bbq|biryani)/.test(t))
    return "restaurant";
  if (/(hotel|guest\s?house|rooms?)/.test(t)) return "hotel";
  if (/(salon|barber|hair|parlou?r|beauty)/.test(t)) return "salon";
  if (/(shop|store|dukaan|dukan|mart|kiryana|garments|mobile)/.test(t))
    return "shop";
  return "other";
}

function startIntent(text: string): boolean {
  return /(start|shuru|register|business|dukaan|dukan|store|website)/i.test(
    text,
  );
}

export const run = internalAction({
  args: {
    conversationId: v.id("conversations"),
    phoneNumberId: v.string(),
    accessToken: v.string(),
    peerPhone: v.string(),
    text: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const reply = (text: string) =>
      sendText(ctx, {
        phoneNumberId: args.phoneNumberId,
        accessToken: args.accessToken,
        conversationId: args.conversationId,
        to: args.peerPhone,
        text,
      });

    const existingBusiness: Doc<"businesses"> | null = await ctx.runQuery(
      internal.agents.onboardingDb.businessByOwnerPhone,
      { peerPhone: args.peerPhone },
    );
    const session: Doc<"onboardingSessions"> | null = await ctx.runQuery(
      internal.agents.onboardingDb.getSession,
      { peerPhone: args.peerPhone },
    );

    if (existingBusiness && (!session || session.step === "done")) {
      await reply(
        `Assalam o Alaikum! Aap ka store "${existingBusiness.name}" pehle se Karobari par hai. 🎉\n\n` +
          `🌐 Store: https://${existingBusiness.slug}.${ROOT_DOMAIN()}\n` +
          `📊 Dashboard: https://${ROOT_DOMAIN()}/dashboard\n\n` +
          `Dashboard use karne ke liye isi email/number se sign in karein. Koi aur sawal ho to poochein!`,
      );
      return null;
    }

    const draft: Draft = (session?.draft as Draft) ?? {};
    const text = args.text.trim();

    if (!session) {
      if (startIntent(text)) {
        await ctx.runMutation(internal.agents.onboardingDb.upsertSession, {
          peerPhone: args.peerPhone,
          step: "name",
          draft: {},
        });
        await reply(
          "Assalam o Alaikum! Karobari mein khush aamdeed 🎉\n\n" +
            "Sirf 5 minute mein aap ka apna online store ban jayega — website + WhatsApp agent ke saath.\n\n" +
            "Pehla sawal: *Aap ke business ka naam kya hai?*",
        );
      } else {
        await reply(
          "Assalam o Alaikum! Yeh Karobari hai — hum Pakistani businesses ko free website aur WhatsApp AI agent dete hain.\n\n" +
            'Apna business register karne ke liye likhein: *"Start Business"*\n\n' +
            `Mazeed info: https://${ROOT_DOMAIN()}`,
        );
      }
      return null;
    }

    switch (session.step) {
      case "name": {
        if (text.length < 2 || text.length > 60) {
          await reply("Business ka naam thora clear likhein (2-60 characters).");
          return null;
        }
        draft.name = text;
        await saveStep(ctx, args.peerPhone, "category", draft);
        await reply(
          `Zabardast! "${text}" 👍\n\nAap ka business kis type ka hai?\n\n` +
            "1. Restaurant / Food\n2. Hotel / Guest House\n3. Salon / Barber\n4. Shop / Dukaan\n5. Kuch aur\n\n" +
            "Number likhein ya type bata dein.",
        );
        return null;
      }
      case "category": {
        const byNumber: Record<string, Draft["category"]> = {
          "1": "restaurant",
          "2": "hotel",
          "3": "salon",
          "4": "shop",
          "5": "other",
        };
        draft.category = byNumber[text] ?? detectCategory(text);
        await saveStep(ctx, args.peerPhone, "description", draft);
        await reply(
          "Perfect! Ab apne business ke baare mein 2-3 line likhein — kya bechte hain, kahan hain, kya khaas hai?\n\n" +
            "Misal: \"Lahore DHA mein asli Shinwari khaana. Tikka, karahi, pulao. Family hall aur home delivery available.\"",
        );
        return null;
      }
      case "description": {
        if (text.length < 10) {
          await reply("Thora aur detail likhein taake acchi website banayi ja sake.");
          return null;
        }
        draft.description = text;
        await saveStep(ctx, args.peerPhone, "catalog", draft);
        await reply(
          "Bohat khoob! 📝\n\nAb apne *products/menu ki list prices ke saath* bhejein — jaise bhi likhi ho, hamari AI samajh legi.\n\n" +
            "Misal:\nShinwari Tikka 450\nChicken Karahi full 1200, half 650\nPulao plate 400\nDrinks 100",
        );
        return null;
      }
      case "catalog": {
        const parsed = await parseCatalogText(text);
        const itemCount = parsed.categories.reduce(
          (s, c) => s + c.items.length,
          0,
        );
        if (itemCount === 0) {
          await reply(
            "Items samajh nahi aaye 😅 Har item ke saath price zaroor likhein, misal:\n\nShinwari Tikka 450\nPulao 400",
          );
          return null;
        }
        draft.categories = parsed.categories;
        await saveStep(ctx, args.peerPhone, "payments", draft);
        const preview = parsed.categories
          .flatMap((c) => c.items.map((i) => `• ${i.name} — Rs. ${i.priceRupees}`))
          .slice(0, 10)
          .join("\n");
        await reply(
          `${itemCount} items mil gaye! 🎉\n\n${preview}${itemCount > 10 ? "\n..." : ""}\n\n` +
            "Cash on Delivery on hoga. Kya EasyPaisa ya JazzCash bhi lena chahte hain?\n\n" +
            'Aise likhein: *"easypaisa 03001234567 Muhammad Ali"*\nYa likhein *"skip"*',
        );
        return null;
      }
      case "payments": {
        if (!/^skip$/i.test(text)) {
          const match = text.match(
            /(easypaisa|jazzcash)\s+(\+?\d[\d\s-]{9,14})\s+(.{2,40})/i,
          );
          if (match) {
            const wallet = {
              number: match[2].replace(/[\s-]/g, ""),
              accountName: match[3].trim(),
            };
            if (match[1].toLowerCase() === "easypaisa") draft.easypaisa = wallet;
            else draft.jazzcash = wallet;
          } else {
            await reply(
              'Format samajh nahi aaya. Aise likhein:\n*"easypaisa 03001234567 Muhammad Ali"*\n\nYa *"skip"* likhein.',
            );
            return null;
          }
        }
        await saveStep(ctx, args.peerPhone, "confirm", draft);
        const itemCount =
          draft.categories?.reduce((s, c) => s + c.items.length, 0) ?? 0;
        await reply(
          "Sab tayyar hai! Confirm karein:\n\n" +
            `🏪 ${draft.name} (${draft.category})\n📝 ${draft.description}\n🛒 ${itemCount} items\n` +
            `💳 COD${draft.easypaisa ? " + EasyPaisa" : ""}${draft.jazzcash ? " + JazzCash" : ""}\n\n` +
            '*"Confirm"* likhein aur aap ka store live ho jayega! 🚀',
        );
        return null;
      }
      case "confirm": {
        if (!/(confirm|haan|yes|theek|ok)/i.test(text)) {
          await reply(
            'Koi masla nahi! Kuch badalna ho to bata dein, ya *"Confirm"* likh kar store live karein.',
          );
          return null;
        }
        if (!draft.name || !draft.category || !draft.description) {
          await reply("Kuch info missing hai — dobara \"Start Business\" likhein.");
          return null;
        }
        const result: { businessId: Id<"businesses">; slug: string } =
          await ctx.runMutation(internal.agents.onboardingDb.registerBusiness, {
            peerPhone: args.peerPhone,
            name: draft.name,
            category: draft.category,
            description: draft.description,
            city: draft.city,
            easypaisa: draft.easypaisa,
            jazzcash: draft.jazzcash,
            categories: draft.categories ?? [],
          });

        await reply(
          `Mubarak ho! 🎉 "${draft.name}" ab LIVE hai!\n\n` +
            `🌐 Website: https://${result.slug}.${ROOT_DOMAIN()}\n` +
            `📊 Dashboard: https://${ROOT_DOMAIN()}/dashboard\n\n` +
            "Dashboard mein sign up karein (isi WhatsApp number ke saath) — orders, catalog, sab wahan manage hoga.\n\n" +
            "Agla step: dashboard ke WhatsApp section se apna business number connect karein taake aap ka AI agent customers ko khud jawab de. 🤖\n\n" +
            "Pehle 20 orders bilkul FREE hain!",
        );

        try {
          const content = await generateSiteContentForBusiness({
            name: draft.name,
            category: draft.category,
            description: draft.description,
            city: draft.city,
          });
          await ctx.runMutation(internal.siteContentAI.saveInternal, {
            businessId: result.businessId,
            content,
          });
        } catch {
          return null;
        }
        return null;
      }
      case "done":
      default: {
        await reply(
          `Aap ka store pehle se live hai! Dashboard: https://${ROOT_DOMAIN()}/dashboard\nKoi sawal ho to poochein.`,
        );
        return null;
      }
    }
  },
});

async function saveStep(
  ctx: ActionCtx,
  peerPhone: string,
  step: "name" | "category" | "description" | "catalog" | "payments" | "confirm" | "done",
  draft: Draft,
) {
  await ctx.runMutation(internal.agents.onboardingDb.upsertSession, {
    peerPhone,
    step,
    draft,
  });
}
