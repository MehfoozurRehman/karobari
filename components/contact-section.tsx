"use client";

import React, { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Send } from "lucide-react";

export default function ContactSection() {
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
    <section id="contact" className="py-16 border-b border-zinc-900/60 bg-zinc-950 relative">
      {/* Subtle Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          <div className="lg:col-span-5 space-y-6 text-left">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-none font-bold">Contact Support</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-[1.1]">
              Need Help? Send Us a Message.
            </h2>
            <p className="text-zinc-400 text-base leading-relaxed">
              Have questions about mapping your domain DNS values, setting up payment notifications, or configuring your custom WhatsApp response templates?
            </p>
            <p className="text-zinc-500 text-sm">
              Enter your details, and our local engineering team will get back to you shortly over email or WhatsApp.
            </p>
          </div>

          <div className="lg:col-span-7">
            <Card className="border-zinc-800 bg-zinc-900/60 backdrop-blur-md">
              <CardContent className="p-6 sm:p-8">
                {success ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                      <Check className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">Message Submitted!</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-sm mx-auto">
                      Hamari team aapse jald hi rabta karegi. Thank you for choosing Karobari!
                    </p>
                    <Button
                      onClick={() => setSuccess(false)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold px-4 mt-2"
                    >
                      Send another message
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name" className="text-zinc-300 text-xs font-bold">Your Name *</Label>
                      <Input
                        id="contact-name"
                        required
                        placeholder="Muhammad Ali"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact-email" className="text-zinc-300 text-xs font-bold">Email Address *</Label>
                        <Input
                          id="contact-email"
                          type="email"
                          required
                          placeholder="ali@gmail.com"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contact-phone" className="text-zinc-300 text-xs font-bold">WhatsApp Number *</Label>
                        <Input
                          id="contact-phone"
                          required
                          placeholder="03001234567"
                          value={form.phone}
                          onChange={(e) => setForm({ ...form, phone: e.target.value })}
                          className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-business" className="text-zinc-300 text-xs font-bold">Business Name (Optional)</Label>
                      <Input
                        id="contact-business"
                        placeholder="Shinwari Restaurant"
                        value={form.businessName}
                        onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        className="border-zinc-800 bg-zinc-950 text-zinc-100 placeholder:text-zinc-600 rounded-xl focus-visible:ring-emerald-500 text-xs py-5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact-message" className="text-zinc-300 text-xs font-bold">Your Query *</Label>
                      <textarea
                        id="contact-message"
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

        </div>
      </div>
    </section>
  );
}
