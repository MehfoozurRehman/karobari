import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-stone-500">Last Updated: July 12, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-stone-700">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            1. Information We Collect
          </h2>
          <p>
            When you register a business on Karobari, we collect your business
            name, category, owner name, WhatsApp phone number, email address,
            product catalog details, and payment account information
            (EasyPaisa / JazzCash / bank account title and number) that you
            choose to display to your customers. Customers placing orders share
            their name, phone number, and delivery address, which is stored on
            behalf of the business they order from.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            2. Conversational WhatsApp Window Data
          </h2>
          <p>
            Our AI agents operate on WhatsApp conversations initiated by
            customers and business owners. Message content is processed to
            answer queries, take orders, and provide business summaries, and is
            stored so that conversations remain consistent. We reply only
            within WhatsApp&apos;s customer service window that opens when a
            person messages first. We never send unsolicited marketing
            messages.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            3. Localized Payment Handling
          </h2>
          <p>
            Karobari does not process card payments. Customer payments to
            businesses happen via cash on delivery or direct EasyPaisa /
            JazzCash transfers to the business&apos;s own account. When a
            customer submits a transaction ID (TID) or a payment proof
            screenshot, we store it so the business can verify the payment.
            Platform fees owed by businesses are similarly settled by manual
            transfer with proof review.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            4. Commission Ledgers
          </h2>
          <p>
            To calculate platform fees (2% per completed order after the first
            20 free orders, plus the Rs. 300 monthly base), we maintain ledgers
            of completed order counts and amounts per business per month. This
            data is visible to the business in its dashboard and to Karobari
            administrators for billing review.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">5. Contact</h2>
          <p>
            For any privacy questions or data deletion requests, contact us via
            the contact page or on WhatsApp at +92 329 0203450.
          </p>
        </section>
      </div>
    </div>
  );
}
