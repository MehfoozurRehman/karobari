"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const CATEGORIES = ["restaurant", "hotel", "salon", "shop", "other"] as const;

export default function SettingsPage() {
  const { isAuthenticated } = useConvexAuth();
  const business = useQuery(
    api.businesses.getMine,
    isAuthenticated ? {} : "skip",
  );
  const update = useMutation(api.businesses.update);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("restaurant");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (business && !loaded) {
      setName(business.name);
      setCategory(business.category);
      setDescription(business.description);
      setCity(business.city ?? "");
      setAddress(business.address ?? "");
      setHours(business.hours ?? "");
      setDeliveryInfo(business.deliveryInfo ?? "");
      setOwnerPhone(business.ownerPhone);
      setLoaded(true);
    }
  }, [business, loaded]);

  async function save() {
    try {
      await update({
        name,
        category: category as (typeof CATEGORIES)[number],
        description,
        city: city || undefined,
        address: address || undefined,
        hours: hours || undefined,
        deliveryInfo: deliveryInfo || undefined,
        ownerPhone,
      });
      toast.success("Settings saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Business Settings
        </h1>
        <p className="text-sm text-stone-500">
          This info powers your storefront and the WhatsApp agent&apos;s
          answers.
        </p>
      </div>

      <Card className="rounded-2xl border-stone-200">
        <CardContent className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "other")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Owner WhatsApp Number</Label>
              <Input
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="03xx xxxxxxx"
              />
              <p className="text-[11px] text-stone-400">
                This number gets the owner agent — sales summaries and order
                management over WhatsApp.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Opening Hours</Label>
              <Input
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="11am – 11pm, Friday closed"
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery Info</Label>
              <Input
                value={deliveryInfo}
                onChange={(e) => setDeliveryInfo(e.target.value)}
                placeholder="30-40 min, DHA & Clifton"
              />
            </div>
          </div>
          <Button
            onClick={save}
            className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
          >
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
