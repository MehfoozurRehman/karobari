import React from "react";
import { SharedHeader, SharedFooter } from "@/components/layout-wrapper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500 selection:text-black">
      <SharedHeader />

      <main className="flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
          <div className="space-y-4">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 rounded-xl gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white pt-4">Privacy Policy</h1>
            <p className="text-zinc-500 text-sm">Last Updated: July 09, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none text-zinc-300 space-y-6 leading-relaxed text-sm">
            <section className="space-y-2">
              <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when creating a store on Karobari, including your business name, mobile wallet credentials (EasyPaisa/JazzCash details for manual payment instructions display), product details, operational employee salary rosters, and store orders.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-white">2. Conversational WhatsApp Window Data</h2>
              <p>
                Karobari acts as an automated conversational agent on behalf of business owners. We process customer names, delivery location markers, and catalog order targets submitted during incoming chat queries to generate shopping cart states and calculate billing commission records. We do not sell conversational message logs.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-white">3. Localized Payment Handling</h2>
              <p>
                We do not verify bank credentials directly. EasyPaisa and JazzCash transfers are processed manually between the buyer and the seller. Transaction IDs (TID) and payment proof screenshot URLs provided during storefront checkouts are stored securely to allow owners to perform manual confirmation queues.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-xl font-bold text-white">4. Commission Ledgers</h2>
              <p>
                Order metrics are monitored to charge the flat 2% commission totals after the first 20 free orders have been exhausted. Delinquent accounts past their invoice grace period are temporarily redirected until outstanding balances are cleared.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SharedFooter />
    </div>
  );
}
