"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export default function PaymentsPage() {
  const { isAuthenticated } = useConvexAuth();
  const business = useQuery(
    api.businesses.getMine,
    isAuthenticated ? {} : "skip",
  );
  const update = useMutation(api.businesses.update);

  const [cod, setCod] = useState(true);
  const [epName, setEpName] = useState("");
  const [epNumber, setEpNumber] = useState("");
  const [jcName, setJcName] = useState("");
  const [jcNumber, setJcNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankTitle, setBankTitle] = useState("");
  const [bankIban, setBankIban] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (business && !loaded) {
      const p = business.paymentSettings;
      setCod(p.codEnabled);
      setEpName(p.easypaisa?.accountName ?? "");
      setEpNumber(p.easypaisa?.number ?? "");
      setJcName(p.jazzcash?.accountName ?? "");
      setJcNumber(p.jazzcash?.number ?? "");
      setBankName(p.bank?.bankName ?? "");
      setBankTitle(p.bank?.accountTitle ?? "");
      setBankIban(p.bank?.iban ?? "");
      setLoaded(true);
    }
  }, [business, loaded]);

  async function save() {
    try {
      await update({
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
          bank:
            bankName && bankTitle && bankIban
              ? { bankName, accountTitle: bankTitle, iban: bankIban }
              : undefined,
        },
      });
      toast.success("Payment settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Payments
        </h1>
        <p className="text-sm text-stone-500">
          These accounts are shown to customers at checkout and by the WhatsApp
          agent.
        </p>
      </div>

      <Card className="rounded-2xl border-stone-200">
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-stone-900">Cash on Delivery</p>
              <p className="text-xs text-stone-500">
                Accept cash when the order is delivered.
              </p>
            </div>
            <Switch
              checked={cod}
              onCheckedChange={(c) => setCod(c === true)}
            />
          </div>

          <div className="space-y-3 border-t border-stone-100 pt-5">
            <p className="font-bold text-stone-900">EasyPaisa</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Account Title</Label>
                <Input
                  value={epName}
                  onChange={(e) => setEpName(e.target.value)}
                  placeholder="Muhammad Ali"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Account Number</Label>
                <Input
                  value={epNumber}
                  onChange={(e) => setEpNumber(e.target.value)}
                  placeholder="03xx xxxxxxx"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-stone-100 pt-5">
            <p className="font-bold text-stone-900">JazzCash</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Account Title</Label>
                <Input
                  value={jcName}
                  onChange={(e) => setJcName(e.target.value)}
                  placeholder="Muhammad Ali"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Account Number</Label>
                <Input
                  value={jcNumber}
                  onChange={(e) => setJcNumber(e.target.value)}
                  placeholder="03xx xxxxxxx"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 border-t border-stone-100 pt-5">
            <p className="font-bold text-stone-900">Bank Account (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Bank Name</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Meezan Bank"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Account Title</Label>
                <Input
                  value={bankTitle}
                  onChange={(e) => setBankTitle(e.target.value)}
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">IBAN</Label>
                <Input
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                  placeholder="PK00XXXX0000000000000000"
                />
              </div>
            </div>
          </div>

          <Button
            onClick={save}
            className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Save Payment Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
