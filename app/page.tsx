import React from "react";
import Image from "next/image";
import PricingCalculator from "@/components/pricing-calculator";
import ContactSection from "@/components/contact-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Globe,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Percent,
  Sparkles,
  Zap,
  Layers,
  ArrowUpRight,
  Smartphone,
  PhoneCall,
  UserCheck
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden selection:bg-emerald-400 selection:text-black">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Dynamic Glowing Accents */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse duration-[10000ms]" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-900/60 bg-zinc-950/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/karobari_logo.png"
              alt="Karobari Logo"
              width={40}
              height={40}
              quality={100}
              priority
              className="rounded-xl shadow-lg shadow-emerald-500/10 object-contain"
            />
            <span className="text-2xl font-black tracking-tight text-white">
              Karobari<span className="text-emerald-400 font-black">.</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#whatsapp" className="hover:text-emerald-400 transition-colors">WhatsApp Agent</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
            <a href="#contact" className="hover:text-emerald-400 transition-colors">Contact</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/923137178074?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="text-zinc-300 hover:text-white border border-zinc-800/80 hover:bg-zinc-900 rounded-xl px-5">
                Sign In
              </Button>
            </a>
            <a
              href="https://wa.me/923137178074?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold px-6 py-5 rounded-xl shadow-lg shadow-emerald-500/10 transition-transform duration-200 active:scale-95">
                Create Store Free
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 border-b border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Made for Pakistani Small Businesses
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Apna Karobar Online Le Kar Ayein{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Sirf Aik WhatsApp Message Se!
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-400 max-w-3xl mx-auto font-medium leading-relaxed">
            Beautiful dynamic websites, auto-generated instantly. Interact with customers and manage incoming orders using a Roman Urdu AI Agent on your own WhatsApp number.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row justify-center items-center gap-4 max-w-md mx-auto">
            <a
              href="https://wa.me/923137178074?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full"
            >
              <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-base py-7 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 transition-all duration-300 hover:translate-y-[-2px]">
                <MessageSquare className="h-5 w-5 fill-black" />
                Setup via WhatsApp
              </Button>
            </a>
            <a href="#pricing" className="w-full">
              <Button variant="ghost" className="w-full text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-900/60 py-7 rounded-xl text-base font-bold">
                Calculate Earnings
              </Button>
            </a>
          </div>

          <div className="flex justify-center items-center flex-wrap gap-x-8 gap-y-4 text-xs font-semibold text-zinc-500 pt-4">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> First 20 Orders Free</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Pay via EasyPaisa / JazzCash</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> No Technical Knowledge Required</span>
          </div>

          {/* Interactive Dual-Panel Mockup */}
          <div id="whatsapp" className="mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-6xl mx-auto text-left scroll-mt-24">
            {/* WhatsApp AI Mockup */}
            <div className="lg:col-span-5 border border-zinc-800 bg-zinc-900/40 rounded-3xl p-3 sm:p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white leading-tight">Karobari Assistant</h4>
                      <p className="text-[11px] text-zinc-500">Official Shop Agent</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] py-0.5 px-2">Roman Urdu Agent</Badge>
                </div>

                <div className="space-y-4 text-xs max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                  <div className="flex justify-end">
                    <div className="bg-emerald-950 text-emerald-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow">
                      <p className="font-semibold text-emerald-300 text-[10px] mb-1">Customer (WhatsApp)</p>
                      <p>Shinwari Tikka aur 2 plate Pulao ka total kitna hoga? Aur delivery time kya hai?</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-zinc-950 text-zinc-200 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%] border border-zinc-800 shadow">
                      <p className="font-semibold text-emerald-400 text-[10px] mb-1">Karobari AI</p>
                      <p>Khyber Shinwari me Shinwari Tikka (Rs 450) aur 2 plate Pulao (Rs 800) ka total Rs 1,250 hoga. Delivery me takreeban 30-40 mins lagenge. Kya main order confirm krdu?</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-emerald-950 text-emerald-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-[85%] shadow">
                      <p>Haan krdo, address DHA Phase 5 block Z.</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-zinc-950 text-zinc-200 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%] border border-zinc-800 shadow">
                      <p className="font-semibold text-emerald-400 text-[10px] mb-1">Karobari AI</p>
                      <p>Order #1042 confirm ho gya hai! COD select kiya gya hai. Aap is link pr check kr skte hain: <span className="text-emerald-400 underline cursor-pointer">khybershinwari.karobari.pk/track/1042</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 text-center">
                💬 AI acts as a 24/7 dedicated sales representative for your customers.
              </div>
            </div>

            {/* Generated Storefront Showcase */}
            <div className="lg:col-span-7 border border-zinc-800 bg-zinc-900/40 rounded-3xl p-5 backdrop-blur-md shadow-2xl flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-emerald-500/5 rounded-full blur-[80px]" />
              
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80">
                  <div>
                    <h4 className="text-sm font-bold text-white">Dynamic Storefront Web App</h4>
                    <p className="text-xs text-zinc-400">Beautiful templates generated matching your brand</p>
                  </div>
                </div>

                <div className="border border-zinc-800 bg-zinc-950 rounded-2xl p-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-md bg-emerald-500 flex items-center justify-center text-black font-extrabold text-xs">K</div>
                      <span className="text-xs font-bold text-white">Khyber Shinwari</span>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[9px]">Restaurant Theme</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl border border-zinc-850 bg-zinc-900/50 space-y-2">
                      <div className="h-28 bg-zinc-800 rounded-lg relative overflow-hidden">
                        <Image
                          src="/images/shinwari_tikka.png"
                          alt="Shinwari Tikka"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-2">
                          <span className="text-[10px] font-bold text-white">Shinwari Tikka</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-400">Rs. 450</span>
                        <button className="text-[9px] bg-emerald-500 text-black font-bold px-2 py-0.5 rounded">+</button>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-zinc-850 bg-zinc-900/50 space-y-2">
                      <div className="h-28 bg-zinc-800 rounded-lg relative overflow-hidden">
                        <Image
                          src="/images/shinwari_pulao.png"
                          alt="Shinwari Pulao"
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end p-2">
                          <span className="text-[10px] font-bold text-white">Shinwari Pulao</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-400">Rs. 400</span>
                        <button className="text-[9px] bg-emerald-500 text-black font-bold px-2 py-0.5 rounded">+</button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-between items-center border-t border-zinc-900">
                    <span className="text-[11px] text-zinc-500">Cart Total: <strong>Rs. 850</strong></span>
                    <button className="text-[10px] bg-emerald-500 text-zinc-950 font-extrabold px-3 py-1.5 rounded-lg">Checkout Order</button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 mt-6 relative z-10">
                <span>⚡ Hyper-fast 4G Optimized Storefronts</span>
                <span className="text-emerald-400 font-bold">100% Mobile Responsive</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grids */}
      <section id="features" className="py-16 border-b border-zinc-900/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 text-center">
          <div className="space-y-4">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold">Comprehensive Capabilities</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Features Built to Deliver Credibility
            </h2>
            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-medium">
              We provide professional tools to scale your business operations with zero tech stress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
            {/* Feature 1 */}
            <div className="p-8 border border-zinc-900 bg-zinc-900/20 rounded-3xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Custom Domain Rewrite</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Connect your custom `.com` or `.pk` domain directly. We configure SSL certificates dynamically behind the scenes so your shop looks completely professional.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 border border-zinc-900 bg-zinc-900/20 rounded-3xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Owner Agent</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Manage operations directly over WhatsApp text. Ask "Aaj kitni sales huin?" to get instant summaries, or confirm order payments on the go without visiting a dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 border border-zinc-900 bg-zinc-900/20 rounded-3xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Rider Tip & Rating Pool</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Customers can add customized tip values for delivery riders directly during checkouts. Complete customer review cards map straight back into your dashboard.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 border border-zinc-900 bg-zinc-900/20 rounded-3xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Employee Salary Ledgers</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Log employee information, base pay parameters, and payment status ledgers internally. Keep your operational financials organized in one place.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 border border-zinc-900 bg-zinc-900/20 rounded-3xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Percent className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Interactive Discounts</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Offer special discounted rates for single menu items or bulk catalog elements. System-wide marketing parameters populate onto storefront cards automatically.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 border border-zinc-900 bg-zinc-900/20 rounded-3xl hover:border-zinc-800 hover:bg-zinc-900/30 transition-all duration-300 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Image Generator</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                No high-quality pictures for your products? Simply type a prompt and let our built-in image generator construct professional-looking product photos instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Fee Section */}
      <section id="pricing" className="py-16 border-b border-zinc-900/60 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            <div className="lg:col-span-5 space-y-6 text-left">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold">No High Upfront Cost</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.1]">
                Simple Pricing. Only Pay Once You Grow.
              </h2>
              <p className="text-zinc-400 text-base leading-relaxed">
                Forget about heavy setups or subscriptions. Karobari aligns entirely with your business success.
              </p>
              
              <div className="space-y-4 pt-2">
                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">20 Free Orders</h4>
                    <p className="text-xs text-zinc-400">Setup your website and test all integrations at zero cost.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rs. 300 / Month + 2% per order</h4>
                    <p className="text-xs text-zinc-400">Flat base rate of Rs. 300/mo and a minimal 2% commission only on billable orders after the quota.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Accumulated Ledger</h4>
                    <p className="text-xs text-zinc-400">Pay your accumulated base fee and order commission balance monthly via EasyPaisa, JazzCash, or Bank Transfer.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <PricingCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Local FAQ */}
      <section id="faq" className="py-16 border-b border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 text-center">
          <div className="space-y-4">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold">Frequently Asked Questions</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything You Need To Know</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">Does the customer need a computer to place orders?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Not at all. Customers can simply message your connected shop WhatsApp number. Our Roman Urdu AI Agent behaves like a real person, shares your products, answers queries, and records their shipping data directly into the dashboard.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">How do EasyPaisa and JazzCash transfers work?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                During checkout, we display your mobile wallet account number and title. The customer manually transfers and submits their transaction number (TID). You review it side-by-side inside your admin panel before approving the order.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">What about custom domain configurations?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Simply enter your domain name in the dashboard. We will provide you with the DNS values (A Record and CNAME) to add in your domain registrar panel. Once configured, your domain will link to your storefront automatically.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-base font-bold text-white">Are there any hidden costs?</h4>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Absolutely none. What you see is what you pay: your base Rs. 300 monthly rate and the 2% commission per completed order. We believe in complete transparency to help you build and scale your brand without surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-zinc-950 to-zinc-900 relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
            Apni Online Dukaan Aaj Hi Shuru Karen!
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Setup your store and launch a premium storefront within 5 minutes. No credit card required.
          </p>
          <div className="flex justify-center">
            <a
              href="https://wa.me/923137178074?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-extrabold text-base px-8 py-6 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10">
                Launch via WhatsApp <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Contact support Section */}
      <ContactSection />

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-16 text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
          <p>© 2026 Karobari. Designed for micro-retailers in Pakistan.</p>
          <div className="flex gap-8">
            <a href="/privacy" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="/terms" className="hover:text-zinc-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
