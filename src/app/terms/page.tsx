import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500 selection:text-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="space-y-4">
          <a href="/">
            <Button variant="ghost" className="text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 rounded-xl gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Button>
          </a>
          <h1 className="text-4xl font-extrabold tracking-tight text-white pt-4">Terms of Service</h1>
          <p className="text-zinc-500 text-sm">Last Updated: July 09, 2026</p>
        </div>

        <div className="prose prose-invert max-w-none text-zinc-300 space-y-6 leading-relaxed text-sm">
          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">1. Account Registration</h2>
            <p>
              By utilizing the Karobari setup pipeline (either conversational onboarding via WhatsApp or web dashboards), you agree to represent your business credentials accurately.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">2. SaaS Billing Commission Tier</h2>
            <p>
              Karobari accounts receive 20 free orders to start. Exceeding this quota triggers a monthly base service fee of Rs. 300, plus a flat 2% commission per completed order value.
            </p>
            <p>
              Invoices are issued on the 1st of every month. Unpaid accounts past a 7-day grace period will have their storefront traffic temporarily redirected to a localized platform maintenance screen.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-bold text-white">3. Platform Domain Mapping</h2>
            <p>
              Subdomains are provided default under the `*.karobari.pk` wildcard. Custom domains are mapped by pointing the owner's registrar DNS values (CNAME / A Records) to our dynamic server routes.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
