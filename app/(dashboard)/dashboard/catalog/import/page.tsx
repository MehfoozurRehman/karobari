"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

type ParsedCategory = {
  name: string;
  items: Array<{
    name: string;
    description?: string;
    priceRupees: number;
    discountPct?: number;
  }>;
};

const SAMPLE = `BBQ:
Shinwari Tikka - 450
Chicken Malai Boti 400 rs
Seekh Kabab (beef) Rs. 250 per seekh

Rice:
Shinwari Pulao full plate 400, half 250

Drinks:
Soft drink 100
Fresh lime 150`;

export default function CatalogImportPage() {
  const router = useRouter();
  const importFromText = useAction(api.catalogAI.importFromText);
  const bulkImport = useMutation(api.catalog.bulkImport);

  const [text, setText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<ParsedCategory[] | null>(null);
  const [saving, setSaving] = useState(false);

  async function parse() {
    if (text.trim().length < 10) {
      toast.error("Apni products/menu ki list paste karein");
      return;
    }
    setParsing(true);
    try {
      const result = await importFromText({ text });
      setParsed(result.categories);
      if (result.categories.length === 0) {
        toast.error("Kuch samajh nahi aaya — list mein item ke saath price likhein");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI parsing failed");
    } finally {
      setParsing(false);
    }
  }

  async function save() {
    if (!parsed) return;
    setSaving(true);
    try {
      await bulkImport({ categories: parsed });
      toast.success("Catalog imported 🎉");
      router.push("/dashboard/catalog");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          AI Catalog Import
        </h1>
        <p className="text-sm text-stone-500">
          Apna poora menu ya products ki list yahan paste karein — jaise bhi
          likha ho. AI usay categories, items aur prices mein badal degi.
        </p>
      </div>

      {!parsed ? (
        <Card className="rounded-2xl border-stone-200">
          <CardContent className="space-y-4 p-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={12}
              placeholder={SAMPLE}
              className="font-mono text-sm"
            />
            <Button
              onClick={parse}
              disabled={parsing}
              className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
            >
              <Sparkles className="h-4 w-4" />
              {parsing ? "AI parsing your menu..." : "Parse with AI"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {parsed.map((cat, ci) => (
            <Card key={ci} className="rounded-2xl border-stone-200">
              <CardContent className="p-5">
                <p className="mb-3 font-bold text-stone-900">
                  {cat.name || "Uncategorized"}
                </p>
                <div className="space-y-2">
                  {cat.items.map((item, ii) => (
                    <div
                      key={ii}
                      className="flex items-center justify-between border-b border-stone-100 pb-2 text-sm last:border-0"
                    >
                      <div>
                        <p className="font-semibold text-stone-800">
                          {item.name}
                        </p>
                        {item.description && (
                          <p className="text-xs text-stone-500">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <p className="font-bold text-emerald-700">
                        Rs. {item.priceRupees.toLocaleString("en-PK")}
                        {item.discountPct ? (
                          <span className="ml-1 text-xs text-amber-600">
                            (-{item.discountPct}%)
                          </span>
                        ) : null}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => setParsed(null)}
            >
              ← Edit Text
            </Button>
            <Button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
            >
              {saving ? "Importing..." : "Looks Good — Import All"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
