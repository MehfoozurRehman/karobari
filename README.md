# Karobari

A multi-tenant ordering platform for restaurants: each business gets its own storefront, menu, order tracking and owner dashboard, with AI-assisted setup and WhatsApp connectivity.

**Status:** In progress. The storefront, owner dashboard, admin console and AI agents are implemented, and the Convex backend is deployed to a dev deployment, but `docs/MANUAL_STEPS.md` lists go-live blockers (WhatsApp Meta App Review, a production platform number) and the repo has no tests.

## The problem

The code is built for small restaurant owners who need to take orders online without building their own site. An owner signs up, describes the business, gets a storefront on a subdomain (or a custom domain), manages the menu and orders from a dashboard, and talks to customers over WhatsApp.

## What it does

- **Per-business storefront.** `proxy.ts` rewrites requests from a business subdomain or custom domain to `app/s/[domain]`. Customers browse a menu, use a cart and checkout, track an order by token, and leave a rating. Three storefront themes (classic, modern, minimal) are selectable through `themes/registry.tsx`.
- **Owner dashboard.** Pages for catalog (including a bulk import page), orders, payments, employees, ratings, website settings, billing and WhatsApp, all under `app/(dashboard)`.
- **AI features.** `convex/agents` holds an onboarding agent and an owner agent. `catalogAI.ts` and `siteContentAI.ts` handle AI catalog import and content generation, and `images.ts` covers image generation. These use the Vercel AI SDK with OpenAI and Google models.
- **WhatsApp connection.** Owners connect their own number through a Meta OAuth flow (`app/api/whatsapp/oauth/*`). Inbound messages arrive at a Convex webhook (`convex/whatsapp/webhook.ts`), and replies are sent through `convex/whatsapp/send.ts`.
- **Admin console.** `app/(admin)` lists businesses, billing and contact submissions.

## How it's built

- Next.js 16 App Router with React 19 and TypeScript, styled with Tailwind CSS v4 and shadcn-style components on Base UI.
- Convex is the backend and database. `convex/schema.ts` defines the data model, and queries, mutations, actions, HTTP routes and cron jobs live in `convex/`.
- Clerk handles authentication. The Convex auth configuration accepts Clerk JWTs, and the proxy protects `/dashboard`, `/admin` and `/onboarding`.
- Architecture decision: multi-tenancy is resolved at the edge in `proxy.ts` from the host name. The storefront code then works on one `/s/[domain]` route, so every business shares the same codebase.
- Architecture decision: the Vercel build command runs `npx convex deploy` before `pnpm run build`, so backend and frontend deploy together.
- Email goes through Resend (`convex/email.ts`), and product analytics through PostHog.

## Running it locally

Install dependencies:

```bash
pnpm install
```

Create `.env.local` in the project root. These are the variables the README and code expect:

```env
NEXT_PUBLIC_CONVEX_URL=your-convex-deployment-url
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
OPENAI_API_KEY=your-openai-api-key
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key
RESEND_API_KEY=your-resend-api-key
```

Start the Convex backend and the Next.js app in separate terminals:

```bash
npx convex dev
pnpm dev
```

Other scripts: `pnpm build`, `pnpm start`, `pnpm lint`. The app runs at `http://localhost:3000`. Local subdomain storefronts use `*.localhost`.

## What's left

- `docs/MANUAL_STEPS.md` lists the remaining go-live work. The main item is Meta App Review, which the WhatsApp connection needs before businesses other than app testers can connect.
- The platform WhatsApp number is documented as Meta's test number, not a production number.
- There are no automated tests in the repository.
- The Convex, Meta and Vercel settings (for example `META_APP_SECRET` and `CLERK_JWT_ISSUER_DOMAIN`) are set in those services, not in the repo. The local setup above lists only the core variables.
