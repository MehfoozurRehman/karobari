# Karobari — Manual Setup Steps

Status as of the current build. Work the **Remaining** sections top to bottom to go live. Everything in **Done** is already wired and verified.

## Done ✅

**Backend / deployment**
- **Convex dev** deployment `dev:nautical-raccoon-638` live, all functions deployed, schema clean.
- **Next.js build** passes (`pnpm build`) with cacheComponents + React Compiler; lint clean.

**Auth**
- **Clerk** wired with **production (`pk_live` / `sk_live`) keys** on `clerk.karobari.shop`; `convex` JWT template configured; `CLERK_JWT_ISSUER_DOMAIN` set on Convex.
- `ADMIN_EMAILS=mehfoozijaz786@gmail.com` → that account gets the admin role and `/admin`.

**AI**
- `OPENAI_API_KEY` (chat agents, catalog import) and `GOOGLE_GENERATIVE_AI_API_KEY` (Gemini images) set on Convex. Agents / import / image gen are unblocked.

**Meta / WhatsApp**
- **Meta Business Portfolio verified** ✅ — unblocks Advanced Access / App Review and higher messaging limits.
- **Meta app** created: App ID `985534637590717`; `META_APP_SECRET` set (`.env.local` + Convex).
- **Platform number** currently uses Meta's **test number `15558873738`**: `WA_PLATFORM_PHONE_NUMBER_ID` and a `WA_PLATFORM_TOKEN` are set, so the onboarding + platform agents work end-to-end today for testing.
- **Webhook configured** ✅ — callback `https://nautical-raccoon-638.convex.site/whatsapp/webhook`, verify token `karobari-verify-2026`, subscribed to the **messages** field.
- **Businesses connect their own number via standard Meta OAuth** — no Embedded Signup / Tech Provider config needed. Fully coded:
  - `GET /api/whatsapp/oauth/start` → redirects to Meta OAuth (scopes `business_management`, `whatsapp_business_messaging`, `whatsapp_business_management`), CSRF-protected via `oauth_state` cookie.
  - `GET /api/whatsapp/oauth/callback` → exchanges code, finds the WABA + phone number, subscribes the app, registers the number, and saves it (`convex/whatsapp/connect.ts:saveBusinessAccount`, authenticated with the caller's Clerk token).
  - Dashboard **Connect WhatsApp Number** button (`/dashboard/whatsapp`) launches the flow and toasts success/error from the callback redirect.

**Billing / infra keys**
- **Resend**: `RESEND_API_KEY` set **and `karobari.shop` domain verified** ✅ — billing emails send from the domain.
- `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, `VERCEL_TEAM_ID` set (custom-domain connection).
- **Vercel project env** populated for prod/preview/dev (`NEXT_PUBLIC_*`, `CLERK_SECRET_KEY`, `META_APP_SECRET`, `CONVEX_DEPLOY_KEY`) — currently pointing at the dev Convex deployment.
- `APP_ROOT_DOMAIN=karobari.shop` set.

---

## Remaining ⏳

### 1. Meta App Review — required before real businesses can connect
The OAuth flow works today only for **app admins / developers / testers**. To let *any* business authorize their number, the app needs **Advanced Access** to `whatsapp_business_messaging` + `whatsapp_business_management` via App Review (business verification — a prerequisite — is already done). This does **not** require Tech Provider / Solution Partner status.
1. Submit App Review with a screencast of: Dashboard → Connect WhatsApp Number → Meta OAuth → number connected → agent replying.
2. Ensure `karobari.shop` (and `localhost` for dev) are listed under the app's App Domains.

### 2. Real platform number (optional — when leaving the test number)
> ⚠️ Registering a real number on the Cloud API **removes it from the normal WhatsApp app**. Use a dedicated business SIM.
1. App → WhatsApp → add the number (e.g. `+92 329 0203450`) to your WABA, verify via SMS/call.
2. `npx convex env set WA_PLATFORM_PHONE_NUMBER_ID <id>`
3. Business settings → System users → admin system user → **permanent token** with `whatsapp_business_messaging` + `whatsapp_business_management` → `npx convex env set WA_PLATFORM_TOKEN <token>`
4. Update `WA_PLATFORM_PHONE_NUMBER` / `NEXT_PUBLIC_WA_PLATFORM_PHONE_NUMBER` (Convex env + `.env.local` + Vercel).

### 3. Vercel (hosting + domains)
Project env vars are **already pushed** (via the Vercel API) for production/preview/development: the `NEXT_PUBLIC_*` app config, `CLERK_SECRET_KEY`, `META_APP_SECRET`, and `CONVEX_DEPLOY_KEY`. They currently point at the **dev** Convex deployment.
1. Import/link the repo at vercel.com (Next.js) if not already linked (project `prj_Urx2yAKoGT6yVylzVWn28pnKd0XG`).
2. When you create a **prod** Convex deployment (step 4), update `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, and `CONVEX_DEPLOY_KEY` in Vercel to the prod values.
3. Domains: add `karobari.shop` **and** `*.karobari.shop` (wildcard needs Vercel DNS — move nameservers at your registrar).

### 4. Convex production
`npx convex deploy` to create the prod deployment, then set every env var on it (mirror `npx convex env list` from dev). Repoint the Meta webhook callback URL to the prod `*.convex.site`, and re-verify the Resend domain if the sending deployment changes.

---

## First-run checklist (local)
1. `npx convex dev` + `pnpm dev`; sign up at `/sign-up` with mehfoozijaz786@gmail.com → confirm `/admin` works.
2. Create a test business via `/onboarding`; paste a menu in AI Import; generate images + site content.
3. Visit `http://<slug>.localhost:3000`, place a COD order, track it, complete it, rate + tip.
4. WhatsApp: message the platform test number "Start Business"; confirm the agent reply.
5. Connect a business number: `/dashboard/whatsapp` → Connect WhatsApp Number (works for app testers pre-App-Review).
6. Billing dry-run: run `billing:closeMonthlyLedgers` + `billing:suspendOverdue` from the Convex dashboard.

## Ongoing duties
- Review platform payment proofs in `/admin/billing`; reply to `/admin/contact` queries.
- Watch the Meta app dashboard for WABA quality/policy flags.
- Karobari collection account shown on the billing page derives from `NEXT_PUBLIC_WA_PLATFORM_PHONE_NUMBER` — update it if the number changes.
