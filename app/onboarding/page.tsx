"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SyncUser } from "@/components/dashboard/sync-user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect } from "react";

const CATEGORIES = [
  { value: "restaurant", label: "Restaurant / Food" },
  { value: "hotel", label: "Hotel / Guest House" },
  { value: "salon", label: "Salon / Barber" },
  { value: "shop", label: "Shop / Retail" },
  { value: "other", label: "Other" },
] as const;

const THEMES = [
  { id: "classic", name: "Classic", desc: "Warm & traditional — great for restaurants" },
  { id: "modern", name: "Modern", desc: "Bold & colorful — great for shops" },
  { id: "minimal", name: "Minimal", desc: "Clean & simple — great for services" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated } = useConvexAuth();
  const me = useQuery(api.users.getMe, isAuthenticated ? {} : "skip");
  const create = useMutation(api.businesses.create);

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("restaurant");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [cod, setCod] = useState(true);
  const [epName, setEpName] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [jcName, setJcName] = useState("");
  const [jcNumber, setJcNumber] = useState("");
  const [themeId, setThemeId] = useState("classic");

  useEffect(() => {
    if (me?.business) router.replace("/dashboard");
  }, [me, router]);

  async function finish() {
    setBusy(true);
    try {
      await create({
        name,
        category: category as "restaurant" | "hotel" | "salon" | "shop" | "other",
        description,
        city: city || undefined,
        ownerPhone,
        themeId,
        paymentSettings: {
          codEnabled: cod,
          easypaisa:
            epName && epNumber
              ? { accountName: epName, number: epNumber }
              : undefined,
          jazzcash:
            jcName && jcNumber
              ? { accountName: jcName, number: jcNumber }
              : undefined,
        },
      });
      toast.success("Mubarak ho! Aap ka store ban gaya 🎉");
      router.replace("/dashboard/catalog/import");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setBusy(false);
    }
  }

  const steps = ["Business", "Payments", "Theme"];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] p-4">
      <SyncUser />
      <Card className="w-full max-w-xl rounded-3xl border-stone-200 shadow-sm">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div>
            <div className="mb-3 flex gap-2">
              {steps.map((s, i) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-emerald-600" : "bg-stone-200"}`}
                />
              ))}
            </div>
            <h1 className="text-xl font-extrabold text-stone-900">
              {step === 0 && "Apne business ke baare mein batayen"}
              {step === 1 && "Payment kaise lenge?"}
              {step === 2 && "Website ka style chunein"}
            </h1>
            <p className="text-sm text-stone-500">
              Step {step + 1} of {steps.length}
            </p>
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Khyber Shinwari"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v ?? "other")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Lahore"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Short Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Asli Shinwari khaana — tikka, karahi, pulao. Family hall available."
                />
              </div>
              <div className="space-y-2">
                <Label>Your WhatsApp Number (owner)</Label>
                <Input
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  placeholder="03xx xxxxxxx"
                />
                <p className="text-[11px] text-stone-400">
                  Is number par aap ko owner agent milega — sales summaries,
                  orders, sab WhatsApp par.
                </p>
              </div>
              <Button
                className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                onClick={() => {
                  if (!name || !description || !ownerPhone) {
                    toast.error("Name, description aur WhatsApp number zaroori hain");
                    return;
                  }
                  setStep(1);
                }}
              >
                Continue
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="flex items-center justify-between rounded-xl border border-stone-200 p-4">
                <div>
                  <p className="font-bold text-stone-900">Cash on Delivery</p>
                  <p className="text-xs text-stone-500">
                    Order deliver hone par cash
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={cod}
                  onChange={(e) => setCod(e.target.checked)}
                  className="h-5 w-5 accent-emerald-700"
                />
              </label>
              <div className="space-y-3 rounded-xl border border-stone-200 p-4">
                <p className="font-bold text-stone-900">EasyPaisa (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={epName}
                    onChange={(e) => setEpName(e.target.value)}
                    placeholder="Account title"
                  />
                  <Input
                    value={epNumber}
                    onChange={(e) => setEpNumber(e.target.value)}
                    placeholder="03xx xxxxxxx"
                  />
                </div>
              </div>
              <div className="space-y-3 rounded-xl border border-stone-200 p-4">
                <p className="font-bold text-stone-900">JazzCash (optional)</p>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    value={jcName}
                    onChange={(e) => setJcName(e.target.value)}
                    placeholder="Account title"
                  />
                  <Input
                    value={jcNumber}
                    onChange={(e) => setJcNumber(e.target.value)}
                    placeholder="03xx xxxxxxx"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setStep(0)}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                  onClick={() => setStep(2)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-3">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setThemeId(t.id)}
                    className={`rounded-xl border-2 p-4 text-left transition-colors ${
                      themeId === t.id
                        ? "border-emerald-600 bg-emerald-50"
                        : "border-stone-200 hover:border-stone-300"
                    }`}
                  >
                    <p className="font-bold text-stone-900">{t.name}</p>
                    <p className="text-xs text-stone-500">{t.desc}</p>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                <Button
                  disabled={busy}
                  className="flex-1 rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
                  onClick={finish}
                >
                  {busy ? "Creating your store..." : "Create My Store 🚀"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
