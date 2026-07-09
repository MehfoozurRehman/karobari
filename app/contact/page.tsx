"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Check, Send, Sparkles } from "lucide-react";

export default function ContactPage() {
  const submitQuery = useMutation(api.queries.submitQuery);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.message) return;

    setLoading(true);
    try {
      await submitQuery({
        name: form.name,
        email: form.email,
        phone: form.phone,
        businessName: form.businessName || undefined,
        message: form.message,
      });
      setSuccess(true);
      setForm({ name: "", email: "", phone: "", businessName: "", message: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-emerald-500 selection:text-black relative">
      <SharedHeader />
      
      {/* Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="flex-grow flex items-center">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8 relative z-10 w-full">
          <div className="space-y-4 text-center sm:text-left">
            <Link href="/">
              <Button variant="ghost" className="text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900 rounded-xl gap-2">
                <ArrowLeft className="h-4 w-4" /> Back to Home
              </Button>
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white pt-4">Contact Support</h1>
            <p className="text-zinc-400 text-sm">
              Have questions about setting up your WhatsApp agent or linking custom domains? Let us know.
            </p>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/40 backdrop-blur-md">
            <CardContent className="p-6 sm:p-8">
              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Submitted!</h3>
                  <p className="text-zinc-400 text-xs leading-relaxed max-w-xs mx-auto">
                    Hamari team aapse jald hi rabta karegi. Thank you for choosing Karobari!
                  </p>
                  <Button
                    onClick={() => setSuccess(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold px-4"
                  >
                    Send another message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-zinc-300 text-xs font-bold">Your Name *</Label>
                    <Input
                      id="name"
                      required
                      placeholder="Muhammad Ali"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-zinc-300 text-xs font-bold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="ali@gmail.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-zinc-300 text-xs font-bold">WhatsApp Number *</Label>
                      <Input
                        id="phone"
                        required
                        placeholder="03001234567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessName" className="text-zinc-300 text-xs font-bold">Business Name (Optional)</Label>
                    <Input
                      id="businessName"
                      placeholder="Shinwari Restaurant"
                      value={form.businessName}
                      onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                      className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-zinc-300 text-xs font-bold">Your Query *</Label>
                    <textarea
                      id="message"
                      required
                      rows={4}
                      placeholder="Apna sawaal likhein..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 p-3 text-xs leading-relaxed"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-extrabold text-xs py-5 rounded-xl flex items-center justify-center gap-2 mt-4"
                  >
                    {loading ? "Submitting..." : (
                      <>
                        Submit Query <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <SharedFooter />
    </div>
  );
}
