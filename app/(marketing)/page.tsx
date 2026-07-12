import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingCalculator } from "@/components/marketing/pricing-calculator";
import { waStartBusinessLink } from "@/lib/wa-links";
import {
  MessageSquare,
  Globe,
  HandCoins,
  Users,
  Percent,
  Sparkles,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const trustBadges = [
  "First 20 Orders Free",
  "Pay via EasyPaisa / JazzCash",
  "No Technical Knowledge Required",
];

const features = [
  {
    icon: Globe,
    title: "Custom Domain Rewrite",
    body: "Connect your custom .com or .pk domain directly. We configure SSL certificates dynamically behind the scenes so your shop looks completely professional.",
  },
  {
    icon: Smartphone,
    title: "Interactive Owner Agent",
    body: 'Manage operations directly over WhatsApp text. Ask "Aaj kitni sales huin?" to get instant summaries, or confirm order payments on the go without visiting a dashboard.',
  },
  {
    icon: HandCoins,
    title: "Rider Tip & Rating Pool",
    body: "Customers can add customized tip values for delivery riders directly during checkout. Complete customer review cards map straight back into your dashboard.",
  },
  {
    icon: Users,
    title: "Employee Salary Ledgers",
    body: "Log employee information, base pay parameters, and payment status ledgers internally. Keep your operational financials organized in one place.",
  },
  {
    icon: Percent,
    title: "Interactive Discounts",
    body: "Offer special discounted rates for single menu items or bulk catalog elements. System-wide marketing parameters populate onto storefront cards automatically.",
  },
  {
    icon: Sparkles,
    title: "AI Image Generator",
    body: "No high-quality pictures for your products? Simply type a prompt and let our built-in image generator construct professional-looking product photos instantly.",
  },
];

const faqs = [
  {
    q: "Does the customer need a computer to place orders?",
    a: "Not at all. Customers can simply message your connected shop WhatsApp number. Our Roman Urdu AI Agent behaves like a real person, shares your products, answers queries, and records their shipping data directly into the dashboard.",
  },
  {
    q: "How do EasyPaisa and JazzCash transfers work?",
    a: "During checkout, we display your mobile wallet account number and title. The customer manually transfers and submits their transaction number (TID). You review it side-by-side inside your dashboard before approving the order.",
  },
  {
    q: "What about custom domain configurations?",
    a: "Simply enter your domain name in the dashboard. We will provide you with the DNS values (A Record and CNAME) to add in your domain registrar panel. Once configured, your domain will link to your storefront automatically.",
  },
  {
    q: "Are there any hidden costs?",
    a: "Absolutely none. What you see is what you pay: your base Rs. 300 monthly rate and the 2% commission per completed order. We believe in complete transparency to help you build and scale your brand without surprises.",
  },
];

export default function Home() {
  const waLink = waStartBusinessLink();

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(ellipse_at_top,rgba(16,122,87,0.08),transparent_60%)]"
        />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28">
          <Badge className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            Made for Pakistani Small Businesses
          </Badge>

          <h1 className="mx-auto mt-8 max-w-4xl text-4xl font-extrabold leading-[1.08] tracking-tight text-stone-900 sm:text-5xl lg:text-6xl">
            Apna Karobar Online Le Kar Ayein{" "}
            <span className="text-emerald-700">
              Sirf Aik WhatsApp Message Se!
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-stone-600 sm:text-lg">
            Beautiful dynamic websites, auto-generated instantly. Interact with
            customers and manage incoming orders using a Roman Urdu AI Agent on
            your own WhatsApp number.
          </p>

          <div className="mx-auto mt-10 flex max-w-md flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="h-13 w-full rounded-full bg-emerald-700 px-8 text-base font-bold text-white shadow-lg shadow-emerald-700/20 hover:bg-emerald-800 sm:w-auto">
                <MessageSquare className="h-5 w-5" />
                Setup via WhatsApp
              </Button>
            </a>
            <Link href="#pricing" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="h-13 w-full rounded-full border-stone-300 px-8 text-base font-semibold text-stone-700 hover:bg-stone-100 sm:w-auto"
              >
                Calculate Earnings
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-medium text-stone-500">
            {trustBadges.map((t) => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="whatsapp" className="scroll-mt-20 border-y border-stone-200 bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-8 px-4 py-16 sm:px-6 lg:grid-cols-12">
          <div className="flex flex-col justify-between rounded-3xl border border-stone-200 bg-[#faf9f6] p-5 shadow-sm lg:col-span-5">
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold leading-tight text-stone-900">
                      Karobari Assistant
                    </h4>
                    <p className="text-[11px] text-stone-500">
                      Official Shop Agent
                    </p>
                  </div>
                </div>
                <Badge className="border-none bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-800">
                  Roman Urdu Agent
                </Badge>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-700 px-4 py-2.5 text-emerald-50 shadow-sm">
                    <p className="mb-1 text-[10px] font-semibold text-emerald-200">
                      Customer (WhatsApp)
                    </p>
                    <p>
                      Shinwari Tikka aur 2 plate Pulao ka total kitna hoga? Aur
                      delivery time kya hai?
                    </p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-stone-200 bg-white px-4 py-2.5 text-stone-700 shadow-sm">
                    <p className="mb-1 text-[10px] font-semibold text-emerald-700">
                      Karobari AI
                    </p>
                    <p>
                      Khyber Shinwari me Shinwari Tikka (Rs 450) aur 2 plate
                      Pulao (Rs 800) ka total Rs 1,250 hoga. Delivery me
                      takreeban 30-40 mins lagenge. Kya main order confirm krdu?
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-700 px-4 py-2.5 text-emerald-50 shadow-sm">
                    <p>Haan krdo, address DHA Phase 5 block Z.</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-stone-200 bg-white px-4 py-2.5 text-stone-700 shadow-sm">
                    <p className="mb-1 text-[10px] font-semibold text-emerald-700">
                      Karobari AI
                    </p>
                    <p>
                      Order #1042 confirm ho gya hai! COD select kiya gya hai.
                      Aap is link pr check kr skte hain:{" "}
                      <span className="cursor-pointer text-emerald-700 underline">
                        khybershinwari.karobari.shop/order/1042
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-stone-200 pt-4 text-center text-[11px] text-stone-500">
              💬 AI acts as a 24/7 dedicated sales representative for your
              customers.
            </div>
          </div>

          <div className="relative flex flex-col justify-between overflow-hidden rounded-3xl border border-stone-200 bg-[#faf9f6] p-5 shadow-sm lg:col-span-7">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-stone-200 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-stone-900">
                    Dynamic Storefront Web App
                  </h4>
                  <p className="text-xs text-stone-500">
                    Beautiful templates generated matching your brand
                  </p>
                </div>
              </div>

              <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-700 text-xs font-extrabold text-white">
                      K
                    </div>
                    <span className="text-xs font-bold text-stone-900">
                      Khyber Shinwari
                    </span>
                  </div>
                  <Badge className="border-none bg-emerald-100 text-[9px] text-emerald-800">
                    Restaurant Theme
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      name: "Shinwari Tikka",
                      price: "Rs. 450",
                      img: "/images/shinwari_tikka.png",
                    },
                    {
                      name: "Shinwari Pulao",
                      price: "Rs. 400",
                      img: "/images/shinwari_pulao.png",
                    },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="space-y-2 rounded-xl border border-stone-200 bg-[#faf9f6] p-3"
                    >
                      <div className="relative h-28 overflow-hidden rounded-lg bg-stone-100">
                        <Image
                          src={item.img}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-black/5 to-transparent p-2">
                          <span className="text-[10px] font-bold text-white">
                            {item.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-700">
                          {item.price}
                        </span>
                        <button className="rounded bg-emerald-700 px-2 py-0.5 text-[9px] font-bold text-white">
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-2">
                  <span className="text-[11px] text-stone-500">
                    Cart Total: <strong className="text-stone-800">Rs. 850</strong>
                  </span>
                  <button className="rounded-lg bg-emerald-700 px-3 py-1.5 text-[10px] font-extrabold text-white">
                    Checkout Order
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4 text-xs text-stone-500">
              <span>⚡ Hyper-fast 4G Optimized Storefronts</span>
              <span className="font-bold text-emerald-700">
                100% Mobile Responsive
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl space-y-12 px-4 text-center sm:px-6">
          <div className="space-y-4">
            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800">
              Comprehensive Capabilities
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-stone-900 sm:text-4xl">
              Features Built to Deliver Credibility
            </h2>
            <p className="mx-auto max-w-2xl text-base text-stone-600 sm:text-lg">
              We provide professional tools to scale your business operations
              with zero tech stress.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 text-left md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="space-y-4 rounded-3xl border border-stone-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">{f.title}</h3>
                <p className="text-sm leading-relaxed text-stone-600">
                  {f.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="pricing"
        className="scroll-mt-20 border-y border-stone-200 bg-white py-20"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <Badge className="rounded-full border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800">
                No High Upfront Cost
              </Badge>
              <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight text-stone-900 sm:text-4xl">
                Simple Pricing. Only Pay Once You Grow.
              </h2>
              <p className="text-base leading-relaxed text-stone-600">
                Forget about heavy setups or subscriptions. Karobari aligns
                entirely with your business success.
              </p>

              <div className="space-y-5 pt-2">
                {[
                  {
                    title: "20 Free Orders",
                    body: "Setup your website and test all integrations at zero cost.",
                  },
                  {
                    title: "Rs. 300 / Month + 2% per order",
                    body: "Flat base rate of Rs. 300/mo and a minimal 2% commission only on billable orders after the quota.",
                  },
                  {
                    title: "Accumulated Ledger",
                    body: "Pay your accumulated base fee and order commission balance monthly via EasyPaisa, JazzCash, or Bank Transfer.",
                  },
                ].map((p) => (
                  <div key={p.title} className="flex gap-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">
                        {p.title}
                      </h4>
                      <p className="text-xs leading-relaxed text-stone-500">
                        {p.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <PricingCalculator />
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="scroll-mt-20 py-20">
        <div className="mx-auto max-w-6xl space-y-12 px-4 text-center sm:px-6">
          <div className="space-y-4">
            <Badge className="rounded-full border border-emerald-200 bg-emerald-50 font-semibold text-emerald-800">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">
              Everything You Need To Know
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 text-left md:grid-cols-2">
            {faqs.map((f) => (
              <div key={f.q} className="space-y-2">
                <h4 className="text-base font-bold text-stone-900">{f.q}</h4>
                <p className="text-sm leading-relaxed text-stone-600">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-emerald-900 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-7 px-4">
          <h2 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Apni Online Dukaan Aaj Hi Shuru Karen!
          </h2>
          <p className="mx-auto max-w-xl text-base text-emerald-100 sm:text-lg">
            Setup your store and launch a premium storefront within 5 minutes.
            No credit card required.
          </p>
          <div className="flex justify-center">
            <a href={waLink} target="_blank" rel="noopener noreferrer">
              <Button className="h-13 rounded-full bg-white px-8 text-base font-extrabold text-emerald-900 shadow-lg hover:bg-emerald-50">
                Launch via WhatsApp <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
