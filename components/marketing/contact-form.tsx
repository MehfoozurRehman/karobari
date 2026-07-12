"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ContactForm() {
  const submit = useMutation(api.contact.submit);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setSending(true);
    try {
      await submit({
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? "") || undefined,
        businessName: String(data.get("businessName") ?? "") || undefined,
        message: String(data.get("message") ?? ""),
      });
      setSent(true);
      form.reset();
    } catch {
      toast.error("Message send nahi hui — dobara koshish karein.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <p className="text-lg font-bold text-emerald-800">Shukriya!</p>
        <p className="mt-2 text-sm text-emerald-700">
          Aap ka message mil gaya hai. Hum jald hi aap se raabta karenge —
          usually 24 ghanton ke andar.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required placeholder="Aap ka naam" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">WhatsApp Number</Label>
          <Input id="phone" name="phone" placeholder="03xx xxxxxxx" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name (optional)</Label>
          <Input id="businessName" name="businessName" placeholder="Aap ka karobar" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          name="message"
          required
          rows={5}
          placeholder="Hum aap ki kaise madad kar sakte hain?"
        />
      </div>
      <Button
        type="submit"
        disabled={sending}
        className="rounded-full bg-emerald-700 px-8 font-semibold text-white hover:bg-emerald-800"
      >
        {sending ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
