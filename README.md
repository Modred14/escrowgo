# EscrowGo

> **Escrow, not "trust me."** Secure peer-to-peer trading for buyers and sellers who've never met — money is locked the second the buyer pays and only released on proof of delivery, so no one has to go first.

Escrow + delivery coordination for buyers and sellers who haven't met yet. Payment is locked the moment the buyer pays, and only released to the seller once delivery is confirmed by a one-time QR scan. If delivery never happens by the agreed date, the buyer is refunded automatically.

Built as a hackathon MVP — JavaScript only (no TypeScript), Next.js App Router, Tailwind, NextAuth, Prisma + Neon Postgres, Nomba TEST payments, Cloudinary uploads, QR generation/verification, deployed on Netlify.

**🔗 Live demo:** `https://escrow-go.netlify.app` &nbsp;·&nbsp; **📂 Repo:** you're in it &nbsp;·&nbsp; **🎥 Demo video:** _add link here_

### Table of contents
[For judges](#-for-reviewers--access-without-signing-up) · [How it works](#1-how-the-flow-works) · [Tech stack](#2-tech-stack) · [Structure](#3-project-structure) · [Local setup](#4-local-setup) · [Demo accounts](#5-demo-accounts-after-seeding) · [Payments](#6-payments--nomba-test-mode) · [API routes](#7-api-routes) · [Testing guide](#11-manual-end-to-end-testing-guide) · [Design notes](#12-notes--design-decisions)

---

## 🔑 For reviewers — access without signing up

You do **not** need to register an account or bring your own API keys to evaluate this project. Everything below works out of the box in **mock payment mode**, which is the default.

Sign in at `/auth/login` with either of these (both share the password `password123`):

| Account | Email | State |
|---|---|---|
| Test user 1 | `testuser1@EscrowGo.test` | Blank slate — a genuinely brand-new account, identical to what `/auth/register` produces |
| Test user 2 | `testuser2@EscrowGo.test` | Blank slate — use alongside Test user 1 to trade with each other from scratch |

- Log in as Test user 1, create a deal, copy the payment link, open it as Test user 2 in another tab/incognito window, pay, deliver, scan, release — the full flow, start to finish, with no seed data in the way and without ever touching the `/auth/register` form (see **Section 11**).
- Either account can also become a courier on the fly via the **"Become a Courier"** card in the dashboard sidebar, to try the EscrowGo-Delivery path instead of Self Delivery.
- Both accounts are created by `npm run db:seed`. If you're evaluating a fresh local/self-hosted copy rather than the live demo link, run that command once after setup (see **Section 4**) and both logins will exist.
- No payment provider account is needed: `PAYMENTS_MOCK_MODE="true"` by default, so **"Pay Securely" → "Confirm Test Payment"** fully exercises the escrow flow (hold → release → refund) without touching Nomba.
- No Cloudinary account is needed to *browse* the app; it's only required if you want to upload your own product photos when creating a deal.

---

## 1. How the flow works

1. **Seller** creates a secure deal: product details, 2–3 photos, seller/buyer location, estimated delivery days, and a delivery option (EscrowGo Delivery or Self Delivery). A shareable payment link is generated.
2. **Buyer** opens the link, registers/logs in, reviews everything, and pays via Nomba. The deal becomes `FUNDS_HELD` — money is locked in escrow, not sent to the seller.
3. **Delivery** happens either via an EscrowGo courier (accept → pick up → deliver) or the seller themselves (Self Delivery). The moment delivery is marked complete, the buyer gets a one-time QR code (visible on their deal page and under **Wallet → Your purchases** on their dashboard).
4. **Release**: the seller or the assigned courier opens the **"Scan Delivery QR Code"** camera modal on their own dashboard and scans that QR (or types the code manually). EscrowGo verifies the scanning account is authorized, then releases escrow → `PAYMENT_RELEASED`.
5. **Auto-refund**: a cron-protected endpoint sweeps deals whose expected delivery date has passed without confirmation and refunds the buyer automatically.

---

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), JavaScript only |
| Styling | Tailwind CSS |
| Auth | NextAuth (Credentials provider, JWT sessions) |
| Database | PostgreSQL via Neon |
| ORM | Prisma |
| Payments | Nomba TEST Checkout API (with a built-in mock mode) |
| Images | Cloudinary (unsigned client upload) |
| PDF export | pdfkit (seller earnings report) |
| QR | `qrcode` (generation) + `jsqr` / `html5-qrcode` (camera scanning) |
| Hosting | Netlify (`@netlify/plugin-nextjs`) |
| Webhook testing | Cloudflare Tunnel |

---

## 3. Project structure

```
EscrowGo/
├── src/
│   ├── app/
│   │   ├── page.jsx                     # Landing page
│   │   ├── layout.js                    # Root layout (fonts, SEO, providers)
│   │   ├── auth/login, auth/register    # Buyer/seller auth
│   │   ├── dashboard/                   # Tabbed app shell: overview, wallet, delivery,
│   │   │                                 # security, settings (?tab=...). QR scanning
│   │   │                                 # and release also live here.
│   │   ├── create-deal/                 # Seller: create a secure deal
│   │   ├── deal/[slug]/                 # Public deal page (pay, track, QR, self-delivery controls)
│   │   ├── deal/[slug]/complete/        # Post-payment QR reveal page
│   │   ├── orders/[slug]/               # Order detail lookup
│   │   ├── pay/[slug]/                  # Checkout / mock-checkout page
│   │   ├── delivery/register/           # Courier signup
│   │   ├── delivery/dashboard/          # Courier: available/assigned/earnings
│   │   ├── admin/                       # Platform-wide stats + transactions
│   │   └── api/                         # All API routes (see section 7)
│   ├── components/                      # Navbar, Footer, DealCard, QRScanner, etc.
│   └── lib/                             # prisma client, auth config, nomba client,
│                                          # delivery-coverage, qrcode, notifications,
│                                          # cloudinary, payment-service, seller-report
├── prisma/
│   ├── schema.prisma                     # 9 models: User, Deal, Product, Payment,
│   │                                      # Delivery, DeliveryAgent, Escrow, QRCode, Notification
│   └── seed.js                           # Demo accounts + sample deals at every stage
├── public/
├── netlify.toml
└── .env.example
```

---

## 4. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# then fill in DATABASE_URL and NEXTAUTH_SECRET at minimum.
# Everything else has a working default (mock payments, no Cloudinary needed
# unless you want to upload your own images) — see section 6.

# 3. Push the schema to your Neon database
npm run db:push

# 4. Seed demo data (creates testuser1@EscrowGo.test / testuser2@EscrowGo.test)
npm run db:seed

# 5. Run the dev server
npm run dev
```

Visit `http://localhost:3000`.

### Getting a Neon database URL
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string into `DATABASE_URL` in `.env`.

### Generating NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

### Cloudinary (image uploads) — optional for evaluation
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. In **Settings → Upload**, create an **unsigned** upload preset (e.g. `EscrowGo-unsigned`).
3. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in `.env`. No secret key is ever exposed to the browser.
4. Only needed if you plan to create a brand-new deal with your own photos — the seeded demo deals already ship with sample images, so reviewers can skip this entirely.

---

## 5. Demo accounts (after seeding)

Both accounts use password `password123`.

| Account | Email | State |
|---|---|---|
| Test user 1 | `testuser1@EscrowGo.test` | Blank slate — no deals, exactly like a fresh signup |
| Test user 2 | `testuser2@EscrowGo.test` | Blank slate — no deals, exactly like a fresh signup |

They're `role: USER` accounts with nothing attached, produced by the exact same `prisma.user.create` shape that `/api/auth/register` uses for a real signup (see `prisma/seed.js`), so they have every feature a brand-new user has: create a deal as seller, pay as buyer, convert to a courier via the **"Become a Courier"** card in the dashboard sidebar, set a security PIN, etc.

---

## 6. Payments — Nomba TEST mode

EscrowGo ships with two modes, controlled by `PAYMENTS_MOCK_MODE` in `.env`:

### Mock mode (default, `PAYMENTS_MOCK_MODE="true"`)
No Nomba account needed. Clicking **Pay Securely** takes the buyer to an in-app test-checkout screen (`/pay/[slug]`) with a **Confirm Test Payment** button. This calls the exact same escrow/notification logic a real webhook would (`lib/payment-service.js`), so the whole flow — escrow held, delivery unlocked, QR generated, release, refund — works identically to production. This guarantees your demo works even with zero external dependencies. Mock mode also automatically kicks in if `NOMBA_CLIENT_ID`/`NOMBA_CLIENT_SECRET` are left blank, regardless of the flag.

### Live Nomba TEST mode
1. Get TEST credentials from the [Nomba developer dashboard](https://nomba.com/business/developers): `NOMBA_CLIENT_ID`, `NOMBA_CLIENT_SECRET`, `NOMBA_ACCOUNT_ID`.
2. Set `PAYMENTS_MOCK_MODE="false"` and fill in those values plus `NOMBA_WEBHOOK_SECRET`.
3. `lib/nomba.js` will exchange credentials for a bearer token, create a hosted checkout order, and redirect the buyer to Nomba's sandbox checkout page.
4. After payment, Nomba calls your webhook at `/api/webhooks/nomba` (see section 8 for exposing this locally).

Either way, `lib/payment-service.js` is the single source of truth for what happens on a successful payment — escrow creation, delivery record setup, expected-delivery-date calculation, and notifications. The webhook and the mock-completion endpoint both call into it, so there's no duplicated logic to drift out of sync.

**Duplicate-payment protection:** `/api/payments/initiate` checks for an existing successful or pending payment on the deal before creating a new one, and a deal whose status isn't `PENDING_PAYMENT` is rejected outright.

---

## 7. API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/register` | POST | Create a buyer/seller (or courier) account |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth credentials login |
| `/api/create-deal` | POST | Seller: create a deal + Nomba checkout order (multipart form, handles image upload) |
| `/api/deals/[slug]` | GET | Public deal lookup (powers the deal/payment page) |
| `/api/deals/[slug]/complete` | GET | Post-payment verification; generates/returns the buyer's release QR |
| `/api/deals/[slug]/self-deliver` | POST | Seller marks picked-up/delivered for Self Delivery |
| `/api/orders/[slug]` | GET | Authenticated order detail lookup |
| `/api/payments/initiate` | POST | Create a Payment + Nomba checkout order (buyer-initiated flow) |
| `/api/payments/[id]` | GET | Poll payment status (used by `/pay/[slug]`) |
| `/api/payments/mock-complete` | POST | Simulate a successful payment (mock mode only) |
| `/api/webhooks/nomba` | POST | Real Nomba payment webhook |
| `/api/qr/verify` | POST | Scan/submit a release code → release escrow |
| `/api/delivery/register` | POST | Courier signup (adds `DeliveryAgent` profile) |
| `/api/delivery/become-courier` | POST | Convert an existing account into a courier |
| `/api/delivery/available` | GET | Unassigned EscrowGo-Delivery jobs for the logged-in courier |
| `/api/delivery-agents/availability` | GET | Checks courier coverage for a buyer/seller city pair |
| `/api/delivery/[id]/accept` \| `/pickup` \| `/deliver` | POST | Courier delivery actions |
| `/api/delivery/earnings` | GET | Courier's deliveries + earnings |
| `/api/wallet/summary` | GET | Seller's released-escrow balance |
| `/api/wallet/transactions` | GET | Full buyer/seller transaction + purchase history, including release QR codes |
| `/api/dashboard` | GET | Overview stats for the logged-in user's dashboard home tab |
| `/api/notifications` | GET/PATCH | List / mark-all-read |
| `/api/notifications/[id]` | PATCH | Mark one notification read |
| `/api/profile` | PATCH | Update name/location/avatar |
| `/api/profile/report` | GET | Download a PDF earnings report (seller) |
| `/api/security/status` | GET | Whether a PIN/password have been set, last-changed dates |
| `/api/security/password` | POST | Change account password |
| `/api/security/pin` | POST | Set/change a 4-digit transaction PIN |
| `/api/cron/refund-check` | GET/POST | Auto-refund sweep (bearer-token protected) |
| `/api/cron/courier-timeout` | GET/POST | Reassigns/flags jobs a courier hasn't acted on in time (bearer-token protected) |
| `/api/admin/stats` \| `/api/admin/deals` | GET | Admin overview (requires `role: ADMIN`) |

---

## 8. Testing webhooks locally with Cloudflare Tunnel

If you're running live Nomba TEST payments, Nomba needs a public URL to send webhooks to.

```bash
# 1. Install cloudflared
brew install cloudflared        # macOS
# or download from https://github.com/cloudflare/cloudflared/releases

# 2. Run your app
npm run dev

# 3. In another terminal, open a tunnel to your local server
cloudflared tunnel --url http://localhost:3000
```

Cloudflare prints a public URL like `https://random-words.trycloudflare.com`. In the Nomba dashboard, set your webhook URL to:

```
https://random-words.trycloudflare.com/api/webhooks/nomba
```

Also update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` in `.env` to that tunnel URL while testing, so checkout callback links point somewhere reachable.

---

## 9. Auto-refund cron

`/api/cron/refund-check` checks for any deal still awaiting delivery whose `expectedDeliveryDate` has passed, and refunds the buyer. It's protected by a bearer token:

```bash
curl -X POST https://your-app-url/api/cron/refund-check \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

Point any scheduler at it — a free [cron-job.org](https://cron-job.org) ping every 15 minutes, a GitHub Actions scheduled workflow, or a Netlify Scheduled Function wrapper that calls this URL. For the hackathon demo, calling it manually with the `curl` command above (after seeding a deal with a past `expectedDeliveryDate`) is the fastest way to show the refund flow live.

`/api/cron/courier-timeout` follows the same bearer-token pattern and sweeps courier-assigned deliveries that have stalled.

---

## 10. Deploying to Netlify

1. **New site from Git** → pick your repo.
2. Build command: `npm run build` (already set in `netlify.toml`). Publish directory: `.next`.
3. Add every variable from `.env.example` under **Site settings → Environment variables**. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your live Netlify URL (e.g. `https://escrow-go.netlify.app`).
4. The `@netlify/plugin-nextjs` plugin (declared in `netlify.toml`) automatically converts API routes into Netlify Functions — no extra config needed.
5. After the first deploy, run `npm run db:push` and `npm run db:seed` once locally against the **same** `DATABASE_URL` your Netlify env uses, so production has schema + demo data.

---

## 11. Manual end-to-end testing guide

Use two browser profiles (or one normal + one incognito window) — one for each test account.

1. **Log in** as `testuser1@EscrowGo.test` (password `password123`).
2. Go to **Create Secure Deal** → fill in a product, upload 2 images, set seller location `Lagos`, buyer location `Abuja`, delivery option `EscrowGo Delivery`. Watch the live sidebar confirm coverage and show the delivery fee + buffer.
3. Try buyer location `Jos` (not in the mock coverage list) — the sidebar flips to "Not covered" and the deal will be force-created as Self Delivery.
4. Submit → copy the generated payment link.
5. Open that link in the other profile as the **buyer** (log in as `testuser2@EscrowGo.test`) → review product, seller info, delivery estimate, escrow explanation → **Pay Securely**.
6. In mock mode you land on an in-app test-checkout screen (`/pay/[slug]`) → **Confirm Test Payment**. Status flips to `FUNDS_HELD` on the deal page (auto-refreshes every few seconds), and you land on `/deal/[slug]/complete` showing your release QR code.
7. **Self Delivery deal**: log back in as `testuser1` (the seller) on the deal page → **Mark as picked up** → **Mark as delivered**. The buyer's QR is now active for scanning.
8. **EscrowGo Delivery deal**: in a third profile (or reuse either account), use the **"Become a Courier"** card in the dashboard sidebar to activate a courier profile, then go to **Dashboard → Delivery tab** → Available → **Accept** → Assigned → **Mark picked up** → **Mark delivered**.
9. Log in as `testuser1` (the seller, or whichever account is the assigned courier) → on the dashboard home tab, click **"Scan Delivery QR Code"** → allow camera access and scan the buyer's QR, or use the manual code field (the buyer's `Wallet` tab and deal page both show the raw code value for easy copy-pasting in a demo). Escrow releases → `PAYMENT_RELEASED`.
10. As `testuser2` (the buyer), check **Dashboard → Wallet** — the completed purchase and its (now used) QR appear under "Your purchases."
11. As `testuser1` (the seller), check **Dashboard → Wallet** — the "Available balance" stat updates with the released escrow.
12. **Auto-refund**: create a deal, pay for it, then hit `/api/cron/refund-check` with your `CRON_SECRET` after its `expectedDeliveryDate` has passed — status flips to `REFUNDED` and both parties get notified.

---

## 12. Notes & design decisions

- **Mock delivery coverage** (`lib/delivery-coverage.js`) is a hard-coded list of Nigerian cities for the MVP — swap this for a real logistics-partner API later without touching any calling code.
- **Escrow amount** = product price only; the delivery fee is tracked separately and credited to the courier's earnings on delivery, so admin stats cleanly separate "money owed to seller" from "money owed to courier."
- **QR codes are opaque tokens** — scanning them reveals nothing on its own; the server looks the code up against the database and checks the scanning account is the seller or the assigned courier before releasing anything.
- **Notifications** are a simple polling list rather than websockets, intentionally, to keep the stack within hackathon scope.