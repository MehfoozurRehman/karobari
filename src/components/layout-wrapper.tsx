import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export function SharedHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/60 bg-zinc-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
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
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
          <Link href="/#features" className="hover:text-emerald-400 transition-colors">Features</Link>
          <Link href="/#whatsapp" className="hover:text-emerald-400 transition-colors">WhatsApp Agent</Link>
          <Link href="/#pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link>
          <Link href="/#faq" className="hover:text-emerald-400 transition-colors">FAQ</Link>
          <Link href="/#contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
        </nav>

        <div className="flex items-center gap-4">
          <a
            href="https://wa.me/ourNumber?text=Start%20Business"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" className="text-zinc-300 hover:text-white border border-zinc-800/80 hover:bg-zinc-900 rounded-xl px-5">
              Sign In
            </Button>
          </a>
          <a
            href="https://wa.me/ourNumber?text=Start%20Business"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold px-6 py-5 rounded-xl shadow-lg shadow-emerald-500/10">
              Create Store Free
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}

export function SharedFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-zinc-950 py-16 text-sm text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-6">
        <p>© 2026 Karobari. Designed for micro-retailers in Pakistan.</p>
        <div className="flex gap-8">
          <Link href="/privacy" className="hover:text-zinc-300">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-300">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
