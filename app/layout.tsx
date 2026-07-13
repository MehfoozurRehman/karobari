import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { ConvexClientProvider } from "@/components/providers/convex-client-provider";
import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { PostHogProvider } from "@/components/providers/posthog-provider";
import { Toaster } from "@/components/ui/sonner";
import { AutoSync } from "@/components/providers/auto-sync";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Karobari — Apna Karobar Online",
    template: "%s | Karobari",
  },
  description:
    "Beautiful dynamic websites, auto-generated instantly. Manage your business and customers with a Roman Urdu AI Agent on your own WhatsApp number.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${nunito.className} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <ConvexClientProvider>
            <AutoSync />
            <PostHogProvider>{children}</PostHogProvider>
          </ConvexClientProvider>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
