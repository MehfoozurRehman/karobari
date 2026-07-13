# Karobari — Business Plan

## 1. The Idea

Karobari gives Pakistani small businesses (restaurants, hotels, salons, shops) a complete online presence in minutes, with **WhatsApp as the front door**:

- A professional storefront website at `{shop}.karobari.shop` (or the owner's custom domain), with AI-generated content and product images.
- An AI sales agent on the business's **own WhatsApp number** that answers customers in Roman Urdu, shares the menu, and takes orders 24/7.
- A private owner agent on the same number ("aaj kitni sales huin?") plus a full web dashboard: orders, catalog, payments, ratings/tips, employee salary ledgers.
- Payments that match Pakistani reality: cash on delivery and manual EasyPaisa/JazzCash transfers with TID/screenshot verification. No cards required anywhere.
- Registration works entirely over WhatsApp — a shopkeeper who has never used a computer can message "Start Business" and be live in 5 minutes.

## 2. Why Pakistan, Why Now

- ~5 million MSMEs; over 90% of retail is undocumented/offline. Most already run their business informally on WhatsApp.
- WhatsApp is the dominant communication channel (50M+ users); customers already order by messaging shops.
- Card penetration is very low but mobile wallets (JazzCash ~45M+, easypaisa ~40M+ accounts) are ubiquitous.
- Existing website builders (Shopify, Wix) are priced in USD, need cards, and assume card checkout — all non-starters here.
- Meta's WhatsApp Business Platform pricing keeps **customer-service-window messages free** — since customers always message first, Karobari's per-conversation cost is zero.

## 3. Product Pillars

1. **WhatsApp-first onboarding** — conversational Roman Urdu flow on the platform number (+92 329 0203450): name → category → description → paste menu (AI-parsed) → wallet numbers → live store + dashboard links.
2. **AI storefronts** — 3 themes (classic/modern/minimal), AI copy, Gemini-generated product/hero photos, cart, checkout, live order tracking, rating + rider tips.
3. **Agents on the business's own number** — Standard OAuth authorization from the dashboard (no Tech Provider approval needed); customer agent (menu, orders, status) and owner agent (sales summaries, order management, price/stock changes, billing status).
4. **Back office** — orders pipeline, catalog with discounts, payment proof review, employees & salary ledgers, ratings.
5. **Admin panel** — platform KPIs, business management, invoice ledger, payment-proof review and collection.

## 4. Revenue Model

- **First 20 completed orders free** per business (removes all signup friction).
- Then **Rs. 300/month base + 2% commission** on each completed order's value.
- Accrued into a monthly ledger; invoice closes on the 1st (PKT), payable in 7 days via EasyPaisa/JazzCash/bank with proof review; unpaid → automatic suspension of storefront + agent (the product's own value is the collection lever).
- Tips flow 100% to the business/rider — goodwill feature, no take.

**Unit economics (illustrative):** an active restaurant doing 300 orders/month at Rs. 1,000 average → Rs. 300 + 2% × Rs. 300,000 = **Rs. 6,300/month (~$22)**. Marginal cost per business ≈ AI tokens (a few dollars) + shared infra → gross margin >80% at scale. 100 such businesses ≈ Rs. 630,000/month.

**Costs:** Convex + Vercel (free tiers initially, then ~$45/mo), OpenAI gpt-5-mini (fractions of a cent per conversation), Gemini image gen, Clerk free tier, Resend free tier, domain. Total fixed <$100/mo until meaningful scale.

## 5. Go-to-Market

1. **Seed city, physical**: pick one food street / commercial area. Onboard 20 businesses by hand (free tier makes the pitch trivial: "20 orders free, 5 minute setup, apna WhatsApp number").
2. **Every storefront is an ad**: "Powered by Karobari" footer + the wa.me registration link.
3. **Order confirmations are viral loops**: every customer touches a karobari.shop link.
4. **WhatsApp forwards**: the registration flow itself is shareable ("is number par Start Business likho").
5. Later: rider networks, wholesale suppliers, and mosque/community noticeboards; TikTok demos in Urdu.

## 6. Competition & Moat

- Foodpanda: 25–30% commission, restaurants resent it; Karobari is 2% and the business owns the customer relationship.
- Website builders (Wix/Shopify/Zyda): USD pricing, card-first, English-first, no WhatsApp agent.
- Bykea/local super-apps: logistics-focused, not storefront/agent.
- **Moat**: Roman Urdu agent quality, WhatsApp-first onboarding (no one else lets an illiterate-in-computers shopkeeper go online from a chat), local payment rails handling, and eventually the order-history data per neighborhood.

## 7. Roadmap

**Now (MVP, this codebase)** — everything above.

**Next 3–6 months**
- Template messages (paid) for proactive order-status pushes once revenue covers it.
- Urdu-script agent option; voice-note understanding (Whisper).
- Delivery-rider assignment + rider WhatsApp notifications.
- Staff WhatsApp accounts with scoped tools (mark ready, mark delivered).
- Automatic wallet payment verification (bank/1LINK integrations or SMS-parse partnerships).
- POS-lite: dine-in QR menus for restaurants.

**6–18 months**
- Inventory with stock counts and low-stock owner alerts.
- Khata (credit ledger) for regular customers — huge in PK retail.
- Financing/working-capital referrals based on verified order history.
- Multi-branch businesses; franchise dashboards.
- Android app wrapper for the dashboard.

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Owners' numbers moving to Cloud API breaks their personal WhatsApp usage | Clear warning in UI + docs; recommend a dedicated business SIM; Meta "coexistence" is on their roadmap |
| Non-payment of invoices | Product suspension is automatic and reversible; 7-day grace; small amounts keep friction low |
| AI mistakes (wrong price/order) | Agent can only quote from the catalog; orders require explicit confirmation; owner can cancel |
| Free-tier abuse (re-registering) | Phone-number keyed; one business per number; admin panel visibility |
| Rupee cost of AI rising | gpt-5-mini class models are cheap and falling; can switch providers behind one module |

## 9. KPIs

- Businesses onboarded / weekly active businesses
- Orders per business per week; % via WhatsApp vs storefront
- Free→paid conversion (crossing 20 orders)
- Invoice collection rate within grace period
- Agent containment (conversations resolved without owner intervention)
- GMV, take rate realized, MRR
