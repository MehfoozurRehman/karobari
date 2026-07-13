# Karobari — Manual Setup Steps

Remaining steps only — Clerk (dev), PostHog, Meta app creation, and dev-deployment env wiring are already done. Work top to bottom.

## Already done ✅ (for reference)

- **Convex dev** deployment `dev:nautical-raccoon-638` live, all functions deployed.
- **Clerk dev instance** (`climbing-finch-10.clerk.accounts.dev`): keys in `.env.local`, `convex` JWT template exists, issuer domain wired into Convex.
- **Meta app created**: App ID `985534637590717`, secret stored in `.env.local` + Convex env.
- **PostHog** project key in `.env.local`.
- Convex dev env vars set: `CLERK_JWT_ISSUER_DOMAIN`, `META_APP_SECRET`, `NEXT_PUBLIC_META_APP_ID`, `WA_WEBHOOK_VERIFY_TOKEN` (= `karobari-verify-2026`), `ADMIN_EMAILS`, `APP_ROOT_DOMAIN`.

## 1. AI keys (5 min — unblocks agents, catalog import, images)

```bash
npx convex env set OPENAI_API_KEY <key>            # platform.openai.com → API keys
npx convex env set GOOGLE_GENERATIVE_AI_API_KEY <key>  # aistudio.google.com → Get API key
```

## 2. Meta / WhatsApp (start business verification NOW — it takes days–weeks)

### 2a. Business verification
Verify your **Meta Business Portfolio** at business.facebook.com (business documents required). This gates Embedded Signup approval — start first.

### 2b. Platform number (+92 329 0203450)
> ⚠️ Registering this number on the Cloud API **removes it from the normal WhatsApp app**. Only proceed if it's dedicated to Karobari.
1. App dashboard → WhatsApp → add the number to your WABA, verify via SMS/call.
2. Copy the **Phone Number ID** → `npx convex env set WA_PLATFORM_PHONE_NUMBER_ID <id>`
3. Business settings → System users → create admin system user → generate **permanent token** with `whatsapp_business_messaging` + `whatsapp_business_management` → `npx convex env set WA_PLATFORM_TOKEN <token>`

### 2c. Webhook
App → WhatsApp → Configuration:
- Callback URL: `https://nautical-raccoon-638.convex.site/whatsapp/webhook` (prod: your prod convex.site URL)
- Verify token: `karobari-verify-2026`
- Subscribe to the **messages** field.

### 2d. Embedded Signup (businesses connecting their own numbers)
1. After business verification: apply as **Tech Provider**; request Advanced Access for `whatsapp_business_messaging` + `whatsapp_business_management` (App Review needs a screencast of Dashboard → WhatsApp → Connect → agent replying).
2. Facebook Login for Business → Configurations → create Embedded Signup config → put the Configuration ID in `.env.local` as `NEXT_PUBLIC_META_CONFIG_ID` (currently empty) and in Vercel env.
3. Add karobari.shop + localhost to the app's App Domains / Website platform.

### 2e. Testing before approval
Use Meta's free **test number** against the dev webhook; message it and watch the agent reply.

## 3. Vercel (hosting + domains)

1. Import the repo at vercel.com (Next.js). Copy all `.env.local` values into Vercel env — but set `NEXT_PUBLIC_CONVEX_URL` to your **prod** Convex URL (create it: `npx convex deploy`, then set the prod deployment's env vars same as dev).
2. Domains: add `karobari.shop` **and** `*.karobari.shop` (wildcard requires Vercel DNS — change nameservers at your registrar).
3. Account → Tokens → create token; Project → Settings → copy project ID:
```bash
npx convex env set VERCEL_TOKEN <token>
npx convex env set VERCEL_PROJECT_ID <id>
npx convex env set VERCEL_TEAM_ID <id>   # skip if personal account
```
(Powers customer custom-domain connection.)

## 4. Resend (billing emails)

1. resend.com → add + verify `karobari.shop` domain (DNS on Vercel makes this easy).
2. `npx convex env set RESEND_API_KEY <key>`

## 5. Clerk production (when deploying)

Create a production Clerk instance on karobari.shop, add the `convex` JWT template there too, put its keys in Vercel env, and set its issuer domain on the **prod** Convex deployment.

## 6. First-run checklist

1. `npx convex dev` + `pnpm dev`, sign up at `/sign-up` with mehfoozijaz786@gmail.com → admin role → `/admin` works.
2. Create a test business via `/onboarding`, paste a menu in AI Import (needs step 1 keys), generate images + site content.
3. Visit `http://<slug>.localhost:3000`, place a COD order, track it, complete it, rate + tip.
4. WhatsApp end-to-end after step 2: message the platform number "Start Business".
5. Billing dry-run: run `billing:closeMonthlyLedgers` + `billing:suspendOverdue` from the Convex dashboard.

## 7. Ongoing duties

- Review platform payment proofs in `/admin/billing`; reply to `/admin/contact` queries.
- Watch Meta app dashboard for WABA quality/policy flags.
- Karobari collection account shown on the billing page is 0329 0203450 — edit `app/(dashboard)/dashboard/billing/page.tsx` if it changes.
