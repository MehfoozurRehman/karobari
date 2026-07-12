"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useAction, useConvexAuth, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { MessageSquare, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    FB?: {
      init: (options: Record<string, unknown>) => void;
      login: (
        cb: (response: {
          authResponse?: { code?: string };
          status?: string;
        }) => void,
        options: Record<string, unknown>,
      ) => void;
    };
    fbAsyncInit?: () => void;
  }
}

export default function WhatsappPage() {
  const { isAuthenticated } = useConvexAuth();
  const business = useQuery(
    api.businesses.getMine,
    isAuthenticated ? {} : "skip",
  );
  const exchangeCode = useAction(api.whatsapp.embeddedSignup.exchangeCode);

  const [sdkReady, setSdkReady] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const sessionInfo = useRef<{ wabaId?: string; phoneNumberId?: string }>({});

  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (
        event.origin !== "https://www.facebook.com" &&
        event.origin !== "https://web.facebook.com"
      )
        return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === "WA_EMBEDDED_SIGNUP" && data.event === "FINISH") {
          sessionInfo.current = {
            wabaId: data.data?.waba_id,
            phoneNumberId: data.data?.phone_number_id,
          };
        }
      } catch {
        return;
      }
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);

  const launchSignup = useCallback(() => {
    if (!window.FB || !configId) {
      toast.error("Facebook SDK load nahi hua — page refresh karein");
      return;
    }
    setConnecting(true);
    window.FB.login(
      async (response) => {
        const code = response.authResponse?.code;
        if (!code) {
          setConnecting(false);
          toast.error("Signup cancel ho gaya");
          return;
        }
        const { wabaId, phoneNumberId } = sessionInfo.current;
        if (!wabaId || !phoneNumberId) {
          setConnecting(false);
          toast.error("WhatsApp account info nahi mili — dobara try karein");
          return;
        }
        try {
          const result = await exchangeCode({ code, wabaId, phoneNumberId });
          toast.success(`WhatsApp connected: ${result.displayPhoneNumber} 🎉`);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Connection failed");
        } finally {
          setConnecting(false);
        }
      },
      {
        config_id: configId,
        response_type: "code",
        override_default_response_type: true,
        extras: { setup: {}, featureType: "", sessionInfoVersion: "3" },
      },
    );
  }, [configId, exchangeCode]);

  const connected = business?.whatsapp?.status === "connected";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {appId && (
        <Script
          src="https://connect.facebook.net/en_US/sdk.js"
          strategy="lazyOnload"
          onLoad={() => {
            window.FB?.init({
              appId,
              autoLogAppEvents: true,
              xfbml: true,
              version: "v23.0",
            });
            setSdkReady(true);
          }}
        />
      )}

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
              onClick={launchSignup}
              disabled={!sdkReady || connecting || !appId || !configId}
              className="w-full rounded-full bg-[#25D366] py-6 text-base font-extrabold text-white hover:bg-[#1fb857]"
            >
              {connecting
                ? "Connecting..."
                : !appId || !configId
                  ? "Setup pending (Meta app config missing)"
                  : "Connect WhatsApp Number"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
