# Karobari

WhatsApp-first commerce platform for Pakistani small businesses: AI storefronts on `{slug}.karobari.shop`, Roman Urdu AI agents on each business's own WhatsApp number, COD + EasyPaisa/JazzCash payments, and a full management dashboard.

## Stack

Next.js 16 (cacheComponents + React Compiler, `proxy.ts`) · Convex · Clerk · WhatsApp Cloud API (Embedded Signup) · OpenAI (agents) · Gemini (images) · Resend · PostHog · Tailwind v4 + shadcn/ui · Vercel

## Develop

```bash
pnpm install
npx convex dev        # terminal 1
pnpm dev              # terminal 2
```

Storefronts locally: `http://<slug>.localhost:3000`

## Docs

- [docs/MANUAL_STEPS.md](docs/MANUAL_STEPS.md) — every account/key/DNS step you must do by hand (Meta verification, Clerk, Vercel wildcard domain, etc.)
- [docs/BUSINESS_PLAN.md](docs/BUSINESS_PLAN.md) — market, pricing (20 free orders → Rs. 300/mo + 2%), GTM, roadmap

## Layout

- `app/(marketing)` landing · `app/(dashboard)` owner dashboard · `app/(admin)` admin panel · `app/s/[domain]` multi-tenant storefronts (rewritten by `proxy.ts`) · `app/onboarding` web wizard
- `convex/` backend: `whatsapp/` (webhook, send, Embedded Signup), `agents/` (customer, owner, onboarding), `billing.ts` + `crons.ts` (ledger, suspension), `admin.ts`
- `themes/` storefront themes (classic, modern, minimal)
