import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-stone-500">Last Updated: July 12, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-stone-700">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            1. Account Registration
          </h2>
          <p>
            You may register a business on Karobari through our website or by
            messaging our WhatsApp number. You are responsible for the accuracy
            of your business information, catalog, pricing, and the payment
            account details you display to customers. You must be legally
            entitled to operate the business you register.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            2. SaaS Billing — Commission Tier
          </h2>
          <p>
            Your first 20 completed orders are free. After that, a flat base
            rate of Rs. 300 per month plus a 2% commission on each completed
            order&apos;s value is accumulated in your monthly ledger. Invoices
            close on the 1st of each month and are payable within 7 days via
            EasyPaisa, JazzCash, or bank transfer with proof submission. If an
            invoice remains unpaid after the 7-day grace period, your
            storefront and WhatsApp agent may be suspended until the balance is
            settled.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            3. Platform Domain Mapping
          </h2>
          <p>
            Every business receives a free subdomain under karobari.shop
            (e.g. yourshop.karobari.shop). You may additionally connect a
            custom domain you own by configuring the DNS records we provide.
            SSL certificates are provisioned automatically. Domains hosting
            illegal or fraudulent content will be disconnected and the account
            suspended.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-stone-900">
            4. Acceptable Use
          </h2>
          <p>
            The WhatsApp AI agent must be used for genuine customer service and
            commerce for your registered business. Spam, harassment,
            misleading offers, or the sale of prohibited goods will result in
            immediate termination without refund of accrued fees.
          </p>
        </section>
      </div>
    </div>
  );
}
