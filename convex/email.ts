import { internalAction, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";

const FROM = "Karobari <billing@karobari.shop>";

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
}

export const ownerEmailInternal = internalQuery({
  args: { businessId: v.id("businesses") },
  handler: async (ctx, args): Promise<string | null> => {
    const business = await ctx.db.get("businesses", args.businessId);
    if (!business?.ownerUserId) return null;
    const user = await ctx.db.get("users", business.ownerUserId);
    return user?.email ?? null;
  },
});

export const sendInvoiceEmail = internalAction({
  args: {
    businessId: v.id("businesses"),
    period: v.string(),
    amountPaisa: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email: string | null = await ctx.runQuery(
      internal.email.ownerEmailInternal,
      { businessId: args.businessId },
    );
    const business: Doc<"businesses"> | null = await ctx.runQuery(
      internal.businesses.getInternal,
      { businessId: args.businessId },
    );
    if (!email || !business) return null;
    const amount = `Rs. ${Math.round(args.amountPaisa / 100).toLocaleString("en-PK")}`;
    await sendEmail(
      email,
      `Karobari invoice for ${args.period} — ${amount}`,
      `<p>Assalam o Alaikum,</p>
       <p>Aap ke business <b>${business.name}</b> ka ${args.period} ka Karobari invoice tayyar hai: <b>${amount}</b>.</p>
       <p>7 din ke andar EasyPaisa, JazzCash ya bank transfer se pay karein aur dashboard ke Billing section mein proof submit karein, warna storefront aur WhatsApp agent pause ho jayenge.</p>
       <p><a href="https://karobari.shop/dashboard/billing">Billing kholen</a></p>
       <p>— Karobari</p>`,
    );
    return null;
  },
});

export const sendSuspensionEmail = internalAction({
  args: {
    businessId: v.id("businesses"),
    period: v.string(),
    amountPaisa: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email: string | null = await ctx.runQuery(
      internal.email.ownerEmailInternal,
      { businessId: args.businessId },
    );
    const business: Doc<"businesses"> | null = await ctx.runQuery(
      internal.businesses.getInternal,
      { businessId: args.businessId },
    );
    if (!email || !business) return null;
    const amount = `Rs. ${Math.round(args.amountPaisa / 100).toLocaleString("en-PK")}`;
    await sendEmail(
      email,
      `Karobari account suspended — unpaid invoice ${args.period}`,
      `<p>Assalam o Alaikum,</p>
       <p><b>${business.name}</b> ka ${args.period} ka invoice (${amount}) abhi tak pay nahi hua, is liye aap ka storefront aur WhatsApp agent pause kar diye gaye hain.</p>
       <p>Payment kar ke proof submit karein — approve hote hi sab kuch dobara live ho jayega.</p>
       <p><a href="https://karobari.shop/dashboard/billing">Abhi pay karein</a></p>
       <p>— Karobari</p>`,
    );
    return null;
  },
});
