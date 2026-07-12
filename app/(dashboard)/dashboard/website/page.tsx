"use client";

import { useEffect, useState } from "react";
import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Sparkles, ExternalLink } from "lucide-react";
import type { SiteContent } from "@/themes/types";

const THEMES = [
  { id: "classic", name: "Classic", desc: "Warm & traditional" },
  { id: "modern", name: "Modern", desc: "Bold & colorful" },
  { id: "minimal", name: "Minimal", desc: "Clean & simple" },
];

export default function WebsitePage() {
  const { isAuthenticated } = useConvexAuth();
  const business = useQuery(
    api.businesses.getMine,
    isAuthenticated ? {} : "skip",
  );
  const site = useQuery(api.siteContentAI.getMine, isAuthenticated ? {} : "skip");
  const update = useMutation(api.businesses.update);
  const generate = useAction(api.siteContentAI.generate);
  const generateHero = useAction(api.images.generateHeroImage);
  const saveContent = useMutation(api.siteContentAI.saveMine);

  const [content, setContent] = useState<SiteContent | null>(null);
  const [generating, setGenerating] = useState(false);
  const [heroBusy, setHeroBusy] = useState(false);

  useEffect(() => {
    if (site?.content && !content) setContent(site.content as SiteContent);
  }, [site, content]);

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "karobari.shop";

  async function regenerate() {
    setGenerating(true);
    try {
      const result = (await generate({})) as SiteContent;
      setContent(result);
      toast.success("Website content generated ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!content) return;
    await saveContent({ content });
    toast.success("Website content saved");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
          Website
        </h1>
        <p className="text-sm text-stone-500">
          Theme, content, aur aap ki site ka address.
        </p>
      </div>

      {business && (
        <div className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white p-5">
          <div>
            <p className="text-xs text-stone-500">Your store is live at</p>
            <a
              href={`https://${business.slug}.${rootDomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-700 hover:underline"
            >
              {business.slug}.{rootDomain}
            </a>
          </div>
          <a
            href={`https://${business.slug}.${rootDomain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="rounded-full">
              <ExternalLink className="h-4 w-4" /> Visit
            </Button>
          </a>
        </div>
      )}

      <Card className="rounded-2xl border-stone-200">
        <CardContent className="space-y-3 p-5">
          <p className="font-bold text-stone-900">Theme</p>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={async () => {
                  await update({ themeId: t.id });
                  toast.success(`Theme: ${t.name}`);
                }}
                className={`rounded-xl border-2 p-3 text-left text-sm transition-colors ${
                  business?.themeId === t.id
                    ? "border-emerald-600 bg-emerald-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <p className="font-bold text-stone-900">{t.name}</p>
                <p className="text-[11px] text-stone-500">{t.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-stone-200">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <p className="font-bold text-stone-900">Website Content</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full border-emerald-200 text-emerald-700"
                disabled={generating}
                onClick={regenerate}
              >
                <Sparkles className="h-4 w-4" />
                {generating ? "Generating..." : "Generate with AI"}
              </Button>
            </div>
          </div>

          {content ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Hero Headline</Label>
                <Input
                  value={content.hero.headline}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, headline: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Hero Subheadline</Label>
                <Textarea
                  rows={2}
                  value={content.hero.subheadline}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, subheadline: e.target.value },
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>About</Label>
                <Textarea
                  rows={3}
                  value={content.about.body}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      about: { ...content.about, body: e.target.value },
                    })
                  }
                />
              </div>
              <Button
                onClick={save}
                className="w-full rounded-full bg-emerald-700 text-white hover:bg-emerald-800"
              >
                Save Content
              </Button>
            </div>
          ) : (
            <p className="rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
              Abhi default content use ho raha hai. &quot;Generate with
              AI&quot; par click karein — aap ke business ki details se
              professional content ban jayega.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-stone-200">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="font-bold text-stone-900">Hero Banner Image</p>
            <p className="text-xs text-stone-500">
              AI se banner image generate karein (Gemini).
            </p>
          </div>
          <Button
            variant="outline"
            className="rounded-full border-emerald-200 text-emerald-700"
            disabled={heroBusy || !business}
            onClick={async () => {
              if (!business) return;
              setHeroBusy(true);
              try {
                await generateHero({ businessId: business._id });
                toast.success("Hero image generated ✨");
              } catch (e) {
                toast.error(e instanceof Error ? e.message : "Failed");
              } finally {
                setHeroBusy(false);
              }
            }}
          >
            <Sparkles className="h-4 w-4" />
            {heroBusy ? "Generating..." : "Generate"}
          </Button>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-stone-200">
        <CardContent className="space-y-2 p-5">
          <p className="font-bold text-stone-900">Custom Domain</p>
          <CustomDomainSection />
        </CardContent>
      </Card>
    </div>
  );
}

function CustomDomainSection() {
  const { isAuthenticated } = useConvexAuth();
  const domains = useQuery(api.domains.listMine, isAuthenticated ? {} : "skip");
  const addDomain = useAction(api.domains.add);
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="space-y-3">
      {domains?.map((d) => (
        <div
          key={d._id}
          className="space-y-2 rounded-xl border border-stone-200 p-3 text-sm"
        >
          <div className="flex items-center justify-between">
            <p className="font-semibold text-stone-900">{d.domain}</p>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold capitalize ${
                d.status === "active"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {d.status.replace("_", " ")}
            </span>
          </div>
          {d.status !== "active" && (
            <p className="rounded-lg bg-stone-50 p-2 text-xs text-stone-600">
              Apne domain registrar mein yeh DNS record add karein:{" "}
              <code className="font-mono">
                CNAME → cname.vercel-dns.com
              </code>{" "}
              (ya apex domain ke liye A record → 76.76.21.21). Verify hone par
              status khud active ho jayega.
            </p>
          )}
        </div>
      ))}
      <div className="flex gap-2">
        <Input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="yourshop.pk"
        />
        <Button
          variant="outline"
          className="rounded-full"
          disabled={busy || !domain}
          onClick={async () => {
            setBusy(true);
            try {
              await addDomain({ domain: domain.trim().toLowerCase() });
              setDomain("");
              toast.success("Domain added — DNS records configure karein");
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Failed");
            } finally {
              setBusy(false);
            }
          }}
        >
          Connect
        </Button>
      </div>
    </div>
  );
}
