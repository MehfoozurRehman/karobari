"use client";

import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquare, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function WhatsappPage() {
  const { isAuthenticated } = useConvexAuth();
  const business = useQuery(
    api.businesses.getMine,
    isAuthenticated ? {} : "skip",
  );
  const searchParams = useSearchParams();

  useEffect(() => {
    const connected = searchParams.get("connected");
    const error = searchParams.get("error");

    if (connected) {
      toast.success(`WhatsApp connected: ${connected} 🎉`);
    }
    if (error) {
      toast.error(`Connection failed: ${error}`);
    }
  }, [searchParams]);

  const handleConnect = () => {
    window.location.href = "/api/whatsapp/oauth/start";
  };

  const connected = business?.whatsapp?.status === "connected";

  return (
    <div className="mx-auto max-w-2xl space-y-6">

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          WhatsApp
        </h1>
        <p className="text-sm text-stone-500">
          Apna business WhatsApp number connect karein — AI agent customers ko
          khud jawab dega.
        </p>
      </div>

      {connected ? (
        <Card className="rounded-2xl border-emerald-200 bg-emerald-50">
          <CardContent className="flex items-center gap-4 p-6">
            <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold text-emerald-900">
                Connected: {business?.whatsapp?.displayPhoneNumber}
              </p>
              <p className="mt-1 text-sm text-emerald-700">
                AI agent live hai! Customers is number par message karke menu
                dekh sakte hain aur order de sakte hain. Aap (owner number se)
                sales poochh sakte hain — &quot;aaj kitni sales huin?&quot;
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-2xl border-stone-200">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/10 text-[#25D366]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-stone-900">
                  Connect your WhatsApp Business number
                </p>
                <p className="text-sm text-stone-500">
                  Facebook ka official popup khulega — apna Meta Business
                  account select karein aur woh number choose karein jo aap ke
                  business ke liye hai.
                </p>
              </div>
            </div>

            <ul className="space-y-2 rounded-xl bg-stone-50 p-4 text-xs text-stone-600">
              <li>• Number aap ka apna rehta hai, Karobari sirf agent chalata hai.</li>
              <li>
                • Dhyan rahe: connect hone ke baad yeh number WhatsApp app ke
                bajaye Cloud API par chalega.
              </li>
              <li>• Customers ke messages ka jawab AI turant dega, 24/7.</li>
            </ul>

            <Button
              onClick={handleConnect}
              className="w-full rounded-full bg-[#25D366] py-6 text-base font-extrabold text-white hover:bg-[#1fb857]"
            >
              Connect WhatsApp Number
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
