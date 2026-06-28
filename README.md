# escrowgo

Escrow + delivery coordination for buyers and sellers who haven't met yet. Payment is locked the moment the buyer pays, and only released to the seller once delivery is confirmed by a one-time QR scan. If delivery never happens by the agreed date, the buyer is refunded automatically.

Built as a hackathon MVP — JavaScript only (no TypeScript), Next.js App Router, Tailwind, NextAuth, Prisma + Neon Postgres, Nomba TEST payments, Cloudinary uploads, QR generation/verification, deployed on Netlify.

---

## 1. How the flow works

1. **Seller** creates a secure deal: product details, 2–3 photos, seller/buyer location, estimated delivery days, and a delivery option (escrowgo Delivery or Self Delivery). A shareable payment link is generated.
2. **Buyer** opens the link, registers/logs in, reviews everything, and pays via Nomba. The deal becomes `FUNDS_HELD` — money is locked in escrow, not sent to the seller.
3. **Delivery** happens either via an escrowgo courier (accept → pick up → deliver) or the seller themselves (Self Delivery). The moment delivery is marked complete, the buyer gets a one-time QR code.
4. **Release**: the seller or the assigned courier scans that QR code on `/scanner`. escrowgo verifies the scanning account is authorized, then releases escrow → `PAYMENT_RELEASED`.
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
| QR | `qrcode` (generation) + `html5-qrcode` (camera scanning) |
| Hosting | Netlify (`@netlify/plugin-nextjs`) |
| Webhook testing | Cloudflare Tunnel |

---

## 3. Project structure

```
escrowgo/
├── app/
│   ├── page.js                      # Landing page
│   ├── layout.js                    # Root layout (fonts, SEO, providers)
│   ├── auth/login, auth/register    # Buyer/seller auth
│   ├── dashboard/                   # Selling/buying deal lists
│   ├── create-deal/                 # Seller: create a secure deal
│   ├── deal/[slug]/                 # Public deal page (pay, track, QR, self-delivery controls)
│   ├── pay/[id]/                    # Checkout / mock-checkout page
│   ├── delivery/register/           # Courier signup
│   ├── delivery/dashboard/          # Courier: available/assigned/earnings
│   ├── scanner/                     # Release-flow QR scanner
│   ├── admin/                       # Platform-wide stats + transactions
│   └── api/                         # All API routes (see section 7)
├── components/                      # Navbar, Footer, Timeline, DealCard, QRScanner, etc.
├── lib/                              # prisma client, auth config, nomba client, delivery-coverage, qr, notifications, cloudinary
├── prisma/
│   ├── schema.prisma                 # 9 models: User, Deal, Product, Payment, Delivery, DeliveryAgent, Escrow, QRCode, Notification
│   └── seed.js                       # Demo accounts + sample deals at every stage
├── middleware.js                     # Route protection
├── netlify.toml
└── .env.example
```

---

## 4. Local setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.local .env
# then fill in DATABASE_URL, NEXTAUTH_SECRET, Cloudinary keys (Nomba keys optional — see section 6)

# 3. Push the schema to your Neon database
npx prisma db push

# 4. Seed demo data (creates admin/seller/buyer/courier accounts + sample deals)
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

### Cloudinary (image uploads)
1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. In **Settings → Upload**, create an **unsigned** upload preset (e.g. `escrowgo-unsigned`).
3. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` and `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` in `.env`. No secret key is ever exposed to the browser.

---

## 5. Demo accounts (after seeding)

All accounts use password `password123`.

| Role | Email |
|---|---|
| Admin | `admin@escrowgo.test` |
| Seller | `seller@escrowgo.test` |
| Buyer | `buyer@escrowgo.test` |
| Courier | `courier@escrowgo.test` |

The seed script also prints a ready-to-scan release code for one already-delivered deal so you can demo `/scanner` immediately.

---

## 6. Payments — Nomba TEST mode

escrowgo ships with two modes, controlled by `PAYMENTS_MOCK_MODE` in `.env`:

### Mock mode (default, `PAYMENTS_MOCK_MODE="true"`)
No Nomba account needed. Clicking **Pay Securely** takes the buyer to an in-app test-checkout screen (`/pay/[id]`) with a **Confirm Test Payment** button. This calls the exact same escrow/notification logic a real webhook would (`lib/payment-service.js`), so the whole flow — escrow held, delivery unlocked, QR generated, release, refund — works identically to production. This guarantees your demo works even with zero external dependencies.

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
| `/api/auth/register` | POST | Create a buyer/seller account |
| `/api/auth/[...nextauth]` | GET/POST | NextAuth credentials login |
| `/api/deals` | POST/GET | Create a deal (with delivery-coverage logic) / list my deals |
| `/api/deals/[slug]` | GET | Public deal lookup (powers the payment link) |
| `/api/deals/[slug]/self-deliver` | POST | Seller marks picked-up/delivered for Self Delivery |
| `/api/payments/initiate` | POST | Create a Payment + Nomba checkout order |
| `/api/payments/[id]` | GET | Poll payment status (used by `/pay/[id]`) |
| `/api/payments/mock-complete` | POST | Simulate a successful payment (mock mode only) |
| `/api/webhooks/nomba` | POST | Real Nomba payment webhook |
| `/api/delivery/register` | POST | Courier signup |
| `/api/delivery/available` | GET | Unassigned jobs near the courier |
| `/api/delivery/[id]/accept` \| `/pickup` \| `/deliver` | POST | Courier delivery actions |
| `/api/delivery/earnings` | GET | Courier's deliveries + earnings |
| `/api/qr/verify` | POST | Scan a release code → release escrow |
| `/api/notifications` | GET/PATCH | List / mark-all-read |
| `/api/notifications/[id]` | PATCH | Mark one notification read |
| `/api/cron/refund-check` | GET/POST | Auto-refund sweep (bearer-token protected) |
| `/api/admin/stats` \| `/api/admin/deals` | GET | Admin overview |

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

---

## 10. Deploying to Netlify

```bash
# Push your repo to GitHub, then in Netlify:
```
1. **New site from Git** → pick your repo.
2. Build command: `npm run build` (already set in `netlify.toml`). Publish directory: `.next`.
3. Add every variable from `.env.example` under **Site settings → Environment variables**. Set `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your live Netlify URL (e.g. `https://escrowgo.netlify.app`).
4. The `@netlify/plugin-nextjs` plugin (declared in `netlify.toml`) automatically converts API routes into Netlify Functions — no extra config needed.
5. After the first deploy, run `npx prisma db push` and `npm run db:seed` once locally against the **same** `DATABASE_URL` your Netlify env uses, so production has schema + demo data.

---

## 11. Manual end-to-end testing guide

Use two browser profiles (or one normal + one incognito window) to act as seller and buyer simultaneously.

1. **Register** a seller account (or log in as `seller@escrowgo.test`).
2. Go to **Create Secure Deal** → fill in a product, upload 2 images, set seller location `Lagos`, buyer location `Abuja`, delivery option `escrowgo Delivery`. Watch the live sidebar confirm coverage and show the delivery fee + 7-day buffer.
3. Try buyer location `Jos` (not in the mock coverage list) — the sidebar flips to "Not covered" and the deal will be force-created as Self Delivery.
4. Submit → copy the generated payment link.
5. Open that link as the **buyer** (register/log in as `buyer@escrowgo.test`) → review product, seller info, delivery estimate, escrow explanation → **Pay Securely**.
6. In mock mode you land on an in-app test-checkout screen → **Confirm Test Payment**. Status flips to `FUNDS_HELD` on the deal page (auto-refreshes every few seconds).
7. **Self Delivery deal**: log back in as the seller on the deal page → **Mark as picked up** → **Mark as delivered**. The buyer's view now shows their QR code.
8. **escrowgo Delivery deal**: log in as `courier@escrowgo.test` → `/delivery/dashboard` → Available tab → **Accept** → Assigned tab → **Mark picked up** → **Mark delivered**.
9. Go to `/scanner` while logged in as the seller (or the assigned courier) → scan the buyer's QR (or use the manual code field — the buyer's deal page shows the raw code value under the QR for easy copy-pasting in a demo). Escrow releases → `PAYMENT_RELEASED`.
10. Check `/dashboard` → "Released" stat updates; check `/admin` (log in as `admin@escrowgo.test`) for the platform-wide view.
11. **Auto-refund**: seed a deal with a past `expectedDeliveryDate` (or wait for a real one to lapse) and hit `/api/cron/refund-check` with your `CRON_SECRET` — status flips to `REFUNDED` and both parties get notified.

---

## 12. Notes & design decisions

- **Mock delivery coverage** (`lib/delivery-coverage.js`) is a hard-coded list of Nigerian cities for the MVP — swap this for a real logistics-partner API later without touching any calling code.
- **Escrow amount** = product price only; the delivery fee is tracked separately and credited to the courier's earnings on delivery, so admin stats cleanly separate "money owed to seller" from "money owed to courier."
- **QR codes are opaque tokens** — scanning them reveals nothing on its own; the server looks the code up against the database and checks the scanning account is the seller or the assigned courier before releasing anything.
- **Notifications** are a simple polling list (every 20s) rather than websockets, intentionally, to keep the stack within hackathon scope.
