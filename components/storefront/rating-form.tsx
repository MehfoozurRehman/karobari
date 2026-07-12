"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const TIP_PRESETS = [0, 50, 100, 200];

export function RatingForm({ token }: { token: string }) {
  const router = useRouter();
  const submit = useMutation(api.ratings.submit);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [tip, setTip] = useState(0);
  const [customTip, setCustomTip] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (stars === 0) {
      toast.error("Pehle stars select karein");
      return;
    }
    setSending(true);
    try {
      const tipRupees = customTip ? Number(customTip) : tip;
      await submit({
        trackingToken: token,
        stars,
        comment: comment || undefined,
        tipRupees: tipRupees > 0 ? tipRupees : undefined,
      });
      toast.success("Shukriya! 💚");
      router.push(`../${token}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf7f2] px-4 py-10">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">
            Kaisa raha experience?
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Aap ki rating shop ko behtar hone mein madad deti hai.
          </p>
        </div>

        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStars(s)}
              className={`text-4xl transition-transform hover:scale-110 ${
                s <= stars ? "grayscale-0" : "grayscale opacity-40"
              }`}
            >
              ⭐
            </button>
          ))}
        </div>

        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Koi comment? (optional)"
        />

        <div className="space-y-3 rounded-2xl bg-[#faf7f2] p-4 text-left">
          <p className="text-sm font-bold text-stone-900">
            Rider ke liye tip? 🛵 (optional)
          </p>
          <div className="flex flex-wrap gap-2">
            {TIP_PRESETS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTip(t);
                  setCustomTip("");
                }}
                className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold ${
                  tip === t && !customTip
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                    : "border-stone-200 text-stone-600"
                }`}
              >
                {t === 0 ? "No tip" : `Rs. ${t}`}
              </button>
            ))}
            <Input
              value={customTip}
              onChange={(e) => setCustomTip(e.target.value)}
              placeholder="Custom"
              type="number"
              className="h-9 w-24 rounded-full bg-white text-sm"
            />
          </div>
          <p className="text-[11px] text-stone-400">
            Tip ki raqam aap COD ke saath ya wallet transfer mein shamil kar
            sakte hain — shop isay rider tak pohnchaegi.
          </p>
        </div>

        <Button
          onClick={send}
          disabled={sending}
          className="w-full rounded-full bg-emerald-700 py-6 text-base font-extrabold text-white hover:bg-emerald-800"
        >
          {sending ? "Submitting..." : "Submit Rating"}
        </Button>
      </div>
    </div>
  );
}
