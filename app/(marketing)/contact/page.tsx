import type { Metadata } from "next";
import { ContactForm } from "@/components/marketing/contact-form";

export const metadata: Metadata = { title: "Contact Support" };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">
          Contact Support
        </h1>
        <p className="text-stone-600">
          Sawal hai ya madad chahiye? Form bharein — hum jald jawab denge.
        </p>
      </div>
      <div className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10">
        <ContactForm />
      </div>
    </div>
  );
}
