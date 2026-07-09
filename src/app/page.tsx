import React from "react";
import Image from "next/image";
import PricingCalculator from "@/components/pricing-calculator";
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
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-black font-black text-lg">K</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
              Karobari<span className="text-emerald-400 font-black">.</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#whatsapp" className="hover:text-emerald-400 transition-colors">WhatsApp Agent</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/ourNumber?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="ghost" className="text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-900">
                Sign In
              </Button>
            </a>
            <a
              href="https://wa.me/ourNumber?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-emerald-500 text-black hover:bg-emerald-400 font-medium px-4 py-2 rounded-xl">
                Get Started Free
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 border-b border-zinc-900 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Badge className="mb-6 bg-zinc-900 text-zinc-300 border-zinc-800 px-3 py-1 text-xs uppercase tracking-wider font-semibold rounded-full">
            🚀 The Mobile-First Business Suite for Pakistan
          </Badge>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Apna Karobar Online Le Kar Ayein —{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent">
              Sirf Aik WhatsApp Message Se!
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed">
            Create a premium dynamic website for your shop, restaurant, salon, or hotel. Interact with customers automatically using a Roman Urdu AI Agent on your WhatsApp number.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
            <a
              href="https://wa.me/ourNumber?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg px-8 py-6 rounded-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/10">
                <MessageSquare className="h-5 w-5 fill-black" />
                Start via WhatsApp
              </Button>
            </a>
            <a href="#pricing" className="w-full sm:w-auto">
              <Button variant="ghost" className="w-full sm:w-auto text-zinc-300 hover:text-white border border-zinc-800 hover:bg-zinc-900 py-6 rounded-xl text-lg px-8">
                Calculate My Fee
              </Button>
            </a>
          </div>

          <div className="mt-6 flex justify-center items-center gap-8 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> First 50 orders free</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Pay via EasyPaisa / COD</span>
          </div>

          {/* Interactive Roman Urdu WhatsApp Mockup */}
          <div className="mt-20 max-w-4xl mx-auto border border-zinc-800 rounded-2xl bg-zinc-900/40 p-2 sm:p-4 backdrop-blur-md shadow-2xl shadow-emerald-500/5">
            <div className="border border-zinc-800 rounded-xl bg-zinc-950 overflow-hidden">
              {/* WhatsApp Header */}
              <div className="bg-zinc-900 px-4 py-3 flex items-center justify-between border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400 font-bold text-sm">🤖</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-white leading-tight">Karobari AI Partner</h3>
                    <p className="text-[10px] text-zinc-500">Online • Shop Assistant</p>
                  </div>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px]">Roman Urdu Support</Badge>
              </div>

              {/* Chat Thread */}
              <div className="p-6 space-y-4 text-sm text-left max-h-[300px] overflow-y-auto">
                <div className="flex justify-end">
                  <div className="bg-emerald-950 text-emerald-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-xs shadow-md">
                    <p>Assalam o Alaikum! Mujhe apna online hotel register krna hai. Name "Khyber Shinwari" hai.</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-900 text-zinc-100 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-xs shadow-md">
                    <p>Walaikum Assalam! Mubarak ho, Khyber Shinwari ko register kar liya hai. Apke main items aur pricing kya hain? (e.g. Karahi Rs 1200, Tikka Rs 350)</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-emerald-950 text-emerald-100 rounded-2xl rounded-tr-none px-4 py-2.5 max-w-xs shadow-md">
                    <p>Shinwari Karahi Rs 1400, Lamb Tikka Rs 450, Roti Rs 30.</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-zinc-900 text-zinc-100 rounded-2xl rounded-tl-none px-4 py-2.5 max-w-xs shadow-md">
                    <p>Zabardast! Shinwari Karahi (Rs 1400), Lamb Tikka (Rs 450), aur Roti (Rs 30) list me add kr diye hain. Aapka website ready hai: <strong className="text-emerald-400 font-medium">khybershinwari.karobari.pk</strong> 🎉</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section id="features" className="py-24 border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-none mb-4">Complete Solution</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Local Pakistani Businesses
          </h2>
          <p className="mt-4 text-lg text-zinc-400 max-w-2xl mx-auto">
            Everything you need to run your operations under one unified platform.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
              <CardContent className="p-8 text-left space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Instant Subdomains & Custom Domains</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Get a free default `yourname.karobari.pk` subdomain or link your private domain (e.g. `.com`, `.pk`) directly with zero downtime using Vercel.
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
              <CardContent className="p-8 text-left space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Dual WhatsApp Agents</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Auto-response customer agent answers queries in Roman Urdu and takes orders. Private owner command bot lets you check daily sales via text.
                </p>
              </CardContent>
            </Card>

            <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
              <CardContent className="p-8 text-left space-y-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <DollarSign className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Local Wallets & COD</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  Accept Cash on Delivery (COD), or have customers transfer via EasyPaisa/JazzCash and verify transaction receipts in your admin panel.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Calculator & Cost Section */}
      <section id="pricing" className="py-24 border-b border-zinc-900 bg-zinc-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <Badge className="bg-emerald-500/10 text-emerald-400 border-none">Fair Pricing</Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                No Fixed Fees. We Grow Only When Your Business Grows.
              </h2>
              <p className="text-zinc-400 text-lg">
                We believe Pakistani small businesses shouldn't pay heavy fixed monthly subscriptions. Get started for free, and then pay a small 2% commission per completed order.
              </p>
              
              <ul className="space-y-4 text-zinc-300">
                <li className="flex items-center gap-3">
                  <Percent className="h-5 w-5 text-emerald-400" />
                  <span><strong>First 50 orders are 100% Free</strong>. No questions asked.</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <span><strong>Only 2% fee</strong> applied to completed sales after the quota.</span>
                </li>
                <li className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  <span><strong>Accumulated invoice cycles:</strong> Pay at the end of the month via JazzCash, EasyPaisa, or Bank.</span>
                </li>
              </ul>
            </div>

            <div>
              <PricingCalculator />
            </div>
          </div>
        </div>
      </section>

      {/* Local Pakistani FAQ Section */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-none mb-4">FAQ</Badge>
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
            <p className="mt-4 text-zinc-400">Answers to everything you need to know about Karobari.</p>
          </div>

          <div className="space-y-8 text-left">
            <div>
              <h4 className="text-lg font-semibold text-white">Will Meta charge me for sending WhatsApp messages?</h4>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                No, as long as customers message you first, it opens a free-form 24-hour service window. Karobari leverages this window to send responses entirely for free. If you need to message users days later, paid utility templates are available.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">How do I verify customer EasyPaisa or JazzCash payments?</h4>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                During checkout, customers receive your EasyPaisa/JazzCash title and account number. They transfer manually and paste their Transaction ID (TID) or receipt screenshot. You review this in your dashboard and click "Approve" with one click.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Can I register without using a computer?</h4>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Absolutely. Text "Start Business" to our WhatsApp number. Our conversational AI assistant will interview you, generate your inventory catalog, configure a premium template, and launch your storefront—all completely on your phone.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">What happens if I don't pay the monthly 2% invoice?</h4>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                We generate your billing invoice on the 1st of every month. If unpaid after a 7-day grace period, we temporarily redirect storefront traffic to a localized status page until the balance is cleared.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 border-t border-zinc-900 bg-gradient-to-b from-zinc-950 to-zinc-900 relative">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Ready to Take Your Shop Online Today?
          </h2>
          <p className="text-zinc-400 text-lg max-w-xl mx-auto">
            Get your dynamic online store and WhatsApp assistant up and running in less than 5 minutes.
          </p>
          <div className="flex justify-center">
            <a
              href="https://wa.me/ourNumber?text=Start%20Business"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg px-8 py-6 rounded-xl flex items-center gap-2">
                Launch My Business <ArrowRight className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 text-center text-sm text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Karobari SaaS Platform. Built for small businesses in Pakistan.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms of Service</a>
            <a href="#" className="hover:text-zinc-300">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

