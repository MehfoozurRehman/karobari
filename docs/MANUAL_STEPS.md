# Karobari — Manual Setup Steps

Everything in this file is something **only you** can do (accounts, verifications, DNS, keys). The code is complete and waiting for these values. Work top to bottom.

---

## 1. Convex (backend)

Dev deployment already exists: `dev:nautical-raccoon-638` (team `mehfooz-ur-rehman`, project `karobari`).

1. Create the production deployment: `npx convex deploy` (run after env vars below are set on prod too).
2. Set environment variables on the deployment (dashboard → Settings → Environment Variables, or `npx convex env set KEY value`):

| Variable | Value / where to get it |
|---|---|
| `CLERK_JWT_ISSUER_DOMAIN` | From Clerk (step 2) — currently a placeholder, MUST replace |
| `OPENAI_API_KEY` | platform.openai.com → API keys (agents + catalog/content AI) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | aistudio.google.com → Get API key (image generation) |
| `META_APP_ID` / `META_APP_SECRET` | Meta app (step 3) |
| `WA_PLATFORM_PHONE_NUMBER_ID` | Cloud API number id for +92 329 0203450 (step 3) |
| `WA_PLATFORM_TOKEN` | Permanent system-user token for the platform WABA (step 3) |
| `WA_WEBHOOK_VERIFY_TOKEN` | Any random string you invent (also pasted into Meta webhook config) |
| `RESEND_API_KEY` | resend.com (step 5) |
| `ADMIN_EMAILS` | `mehfoozijaz786@gmail.com` (comma-separated for more admins) |
| `APP_ROOT_DOMAIN` | `karobari.shop` |
| `VERCEL_TOKEN` / `VERCEL_PROJECT_ID` / `VERCEL_TEAM_ID` | Vercel (step 4) — for customer custom domains |

The WhatsApp webhook URL is your Convex **site** URL + `/whatsapp/webhook`:
- Dev: `https://nautical-raccoon-638.convex.site/whatsapp/webhook`
- Prod: `https://<prod-deployment>.convex.site/whatsapp/webhook`

## 2. Clerk (auth)

1. Create an application at clerk.com (enable Email + Google; optionally Phone).
2. Create a **JWT template named exactly `convex`** (Clerk dashboard → JWT Templates → New → Convex preset).
3. Copy the template's Issuer URL → set as `CLERK_JWT_ISSUER_DOMAIN` in Convex env (replace the placeholder!).
4. Put keys in `.env.local` / Vercel env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (replace the `pk_test_...placeholder`).
5. For production: create a production Clerk instance on the `karobari.shop` domain and repeat.

## 3. Meta / WhatsApp (the big one — start immediately, verification takes days–weeks)

### 3a. Business + app
1. Create/verify a **Meta Business Portfolio** at business.facebook.com (Business Verification requires business documents — start this first, it gates everything).
2. Create a Meta app at developers.facebook.com → type **Business** → add the **WhatsApp** product.
3. Note the **App ID** and **App Secret** (`META_APP_ID`, `META_APP_SECRET`).

### 3b. Platform number (+92 329 0203450)
> ⚠️ **WARNING**: registering this number on the Cloud API **removes it from the normal WhatsApp/WhatsApp Business app**. All existing chats stay on the phone but you can no longer send from the app. Only proceed if this number is dedicated to Karobari. (Back up chats first if needed.)
1. In the app's WhatsApp setup, add the phone number to your WABA, verify via SMS/call.
2. Copy the **Phone Number ID** → `WA_PLATFORM_PHONE_NUMBER_ID`.
3. Create a **System User** (Business settings → Users → System users) with admin access to the app + WABA; generate a **permanent token** with `whatsapp_business_messaging` + `whatsapp_business_management` → `WA_PLATFORM_TOKEN`.

### 3c. Webhook
1. App → WhatsApp → Configuration → Webhook: URL = Convex site URL + `/whatsapp/webhook`, Verify token = your `WA_WEBHOOK_VERIFY_TOKEN`.
2. Subscribe to the **messages** webhook field.

### 3d. Embedded Signup (businesses connecting their own numbers)
1. Complete **Business Verification**, then apply as a **Tech Provider** (WhatsApp → Embedded Signup in the app dashboard walks you through it).
2. Request **Advanced Access** for `whatsapp_business_messaging` and `whatsapp_business_management` (App Review — record a screencast of the dashboard WhatsApp page → Connect button → agent replying).
3. Create an **Embedded Signup configuration** (Facebook Login for Business → Configurations) → copy the **Configuration ID** → `NEXT_PUBLIC_META_CONFIG_ID`.
4. Add your domains (karobari.shop, localhost for testing) to the app's allowed domains / Facebook Login settings (Valid OAuth Redirect not needed for popup flow, but App Domains + Website platform are).
5. Set `NEXT_PUBLIC_META_APP_ID` in Vercel/`.env.local`.

### 3e. Testing before approval
- Use Meta's **test number** (free) against your dev webhook; message it and watch the agent reply.
- Simulate webhooks locally: POST a sample payload with the correct `X-Hub-Signature-256` (HMAC-SHA256 of raw body with your App Secret).

## 4. Vercel (hosting + domains)

1. `vercel` → link the repo, or import via vercel.com. Framework: Next.js.
2. Set env vars (everything in `.env.example` top section, with real values; `NEXT_PUBLIC_CONVEX_URL` = your **prod** Convex URL).
3. Domains: add `karobari.shop` **and** `*.karobari.shop` (wildcard requires using **Vercel DNS** for the domain — change nameservers at your registrar to Vercel's).
4. Create an access token (Account → Tokens) → `VERCEL_TOKEN`; get `VERCEL_PROJECT_ID` from Project → Settings; `VERCEL_TEAM_ID` from team settings (skip if personal account). Put these in **Convex** env — they power customer custom-domain connection.

## 5. Resend (email)

1. Sign up at resend.com, add + verify the `karobari.shop` domain (DNS records — easy since DNS is on Vercel).
2. Create API key → `RESEND_API_KEY` in Convex env. Sender is `billing@karobari.shop` (change in `convex/email.ts` if needed).

## 6. PostHog (analytics)

1. Create a project at posthog.com (US cloud is fine).
2. Copy the project API key → `NEXT_PUBLIC_POSTHOG_KEY` in Vercel/`.env.local`. Autocapture + pageviews work immediately.

## 7. First-run checklist (after all keys are in)

1. `pnpm install && npx convex dev` in one terminal, `pnpm dev` in another.
2. Sign up at `/sign-up` with your admin email → you get the `admin` role automatically (`ADMIN_EMAILS`) → `/admin` works.
3. Create a test business via `/onboarding`, paste a menu in AI Import, generate images and site content.
4. Visit `http://<slug>.localhost:3000` — your storefront. Place a test order (COD), track it, complete it in the dashboard, rate + tip it.
5. WhatsApp: message the platform number "Start Business" and complete a registration end-to-end.
6. In the dashboard → WhatsApp, connect a business number via the Meta popup; message it from another phone; from the owner phone ask "aaj kitni sales huin?".
7. Billing dry-run: in the Convex dashboard run `billing:closeMonthlyLedgers` then `billing:suspendOverdue` manually and watch statuses.

## 8. Ongoing operational duties

- Review platform payment proofs in `/admin/billing` (approve → auto-reactivation).
- Reply to `/admin/contact` queries (WhatsApp deep links provided).
- Watch the Meta app dashboard for quality-rating/policy flags on WABAs.
- Keep the Karobari EasyPaisa/JazzCash collection account details up to date (currently shown on the billing page as 0329 0203450 — edit `app/(dashboard)/dashboard/billing/page.tsx` if it changes).
