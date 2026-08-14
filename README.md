# Nova

**Nova** is a premium consumer-electronics storefront: product discovery, cart, checkout, customer accounts, and an admin dashboard. Catalog, auth, orders, reviews, wishlist, and inventory are stored in **Supabase (Postgres)**. Next.js 16 is the application backend — Server Components read data, Server Actions mutate it, and Row Level Security protects the database.

Checkout creates a **pending** order, reserves variant stock, then Stripe (or demo mode) confirms payment. Shipping quotes and labels use Shippo when configured.

Open the site at [http://localhost:3000](http://localhost:3000) after running the dev server.

**Interview prep:** see [INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md). **Working features (code map):** [FEATURES.md](./FEATURES.md). **Production handover:** see [DEPLOY.md](./DEPLOY.md).

---

## Project overview

Nova is designed to feel like a modern direct-to-consumer tech brand (headphones, earbuds, speakers, wearables, and accessories). The UI follows a restrained, editorial aesthetic: warm paper backgrounds, ink typography, generous spacing, and product photography on soft neutral plates.

The app is split into two main areas:

| Area | Route prefix | Purpose |
|------|--------------|---------|
| **Storefront** | `/` | Public shopping experience |
| **Admin** | `/admin` | Back-office dashboard (requires `admin` role) |

---

## Features

### Storefront

- **Homepage** — Admin-managed banners, featured products, and category browse (including subcategories)
- **Product catalog** — Server-side filters (category, price, rating, availability) synced to the URL
- **Product detail** — Gallery, variants with their own price/stock, specs, live reviews, and related products
- **Search** — Command palette (`Ctrl/Cmd + K`) and dedicated search page
- **Cart** — Guest cart in `localStorage`; prices and stock re-checked at checkout
- **Checkout** — Guest or signed-in; coupons; address validation; live or fallback shipping rates; Stripe Payment Element
- **Orders** — Account history plus guest tracking at `/orders/track`
- **Account** — Profile, orders, addresses, wishlist, and settings
- **Auth** — Email/password sign up, sign in, password reset

### Admin

Requires an `admin` profile. **In demo mode, the first account that signs up is automatically made admin.** Turn demo mode off in production (see [DEPLOY.md](./DEPLOY.md)).

- **Dashboard** — Live KPIs and charts from paid orders
- **Products** — List, create, edit, archive, variant stock/price, image gallery
- **Inventory** — Per-variant stock levels and adjustment log
- **Orders** — Fulfillment, Shippo labels, refunds, tracking
- **Customers** — Profiles, notes, suspend
- **Categories / coupons / banners / reviews**
- **Analytics** — Revenue, orders, top products, CSV export
- **Settings** — Tax, shipping fallbacks, warehouse origin, demo mode

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Base UI |
| Database / Auth / Storage | [Supabase](https://supabase.com) |
| Payments | [Stripe](https://stripe.com) Payment Element + webhooks |
| Shipping | [Shippo](https://goshippo.com) rates, labels, tracking |
| Email / SMS | [Resend](https://resend.com) + [Twilio](https://www.twilio.com) |
| Validation | Zod |
| Icons | Lucide React |
| Charts | Recharts |
| Toasts | Sonner |
| Font | Instrument Sans (Google Fonts) |

---

## Getting started

### Prerequisites

- Node.js 20+
- npm
- A Supabase project (this repo is wired to one via `.env.local`)

### Install and run

```bash
npm install
cp .env.example .env.local   # then fill in your project URL and publishable key
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Environment

See [`.env.example`](./.env.example) and [DEPLOY.md](./DEPLOY.md) for the full list.

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key — never put the service role key here |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only. Webhooks, guest order lookup, payment confirmation |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | Stripe Payment Element + webhooks |
| `SHIPPO_API_KEY` | Live rates and labels (fallback rates work without it) |
| `RESEND_API_KEY` / `TWILIO_*` | Transactional email and SMS |

In the Supabase dashboard, add `http://localhost:3000/auth/callback` to **Redirect URLs**. In **demo mode**, new accounts are auto-confirmed so the first sign-up creates a session immediately. Turn demo mode off in production.

### Other scripts

```bash
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # Run ESLint
npm test        # Unit + integration tests (checkout, Stripe, stock, auth)
npm run test:watch
```

### First login

1. Visit `/login` and create an account (password at least 8 characters).
2. In demo mode, that first user is granted the `admin` role.
3. Storefront account: `/account`. Admin: `/admin`. Guest order tracking: `/orders/track`.

---

## Architecture

```
Browser  →  Next.js server (RSC + Server Actions + proxy.ts)
                 ↓
         Supabase (Postgres + RLS, Auth, Storage)
         Stripe / Shippo / Resend / Twilio
Stripe & Shippo webhooks → service-role client → confirm / restock / tracking
```

- **Reads** — Server Components in `lib/data-access/`
- **Writes** — Server Actions in `lib/actions/` (auth-checked, Zod-validated)
- **Checkout** — `place_order()` creates a **pending** order, reserves variant stock, then Stripe (or demo mode) confirms payment via webhook
- **Session** — Cookie-based via `@supabase/ssr`; `proxy.ts` refreshes tokens. `/checkout` is public for guests
- **Cart** — Client `localStorage` only; never trusted for price or stock

---

## Project structure

```
app/
├── (storefront)/          # Public shop routes
├── admin/                 # Admin dashboard (role-gated)
├── auth/                  # OAuth/email callback + password update
└── layout.tsx

lib/
├── supabase/              # Browser/server/admin clients + Database types
├── data-access/           # Server queries
├── actions/               # Server Actions
├── payments/              # Stripe PaymentIntent + webhook helpers
├── shipping/              # Shippo rates, validation, labels
├── notifications/         # Resend email + Twilio SMS
├── catalog.ts             # Category helpers
└── stores/                # Cart (localStorage) + session/wishlist UI

app/api/webhooks/          # Stripe + Shippo webhook routes
supabase/migrations/       # Schema, RLS, seed catalog
```

---

## Key routes

### Storefront

| Route | Description |
|-------|-------------|
| `/` | Homepage |
| `/products` | Full catalog with filters |
| `/products/[slug]` | Product detail page |
| `/search` | Search results |
| `/cart` | Cart page |
| `/checkout` | Guest or signed-in checkout |
| `/checkout/success` | Payment result |
| `/orders/track` | Guest order tracking |
| `/account` | Customer account hub |
| `/login` | Sign in / create account |

### Admin

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Orders, refunds, labels |
| `/admin/inventory` | Variant stock |
| `/admin/categories` | Categories and subcategories |
| `/admin/coupons` | Coupon CRUD |
| `/admin/banners` | Homepage banners |
| `/admin/settings` | Tax, shipping, demo mode |

---

## Product categories

- **Audio** — Headphones, earbuds, speakers
- **Wearables** — Watches and companions
- **Lighting** — Desk and room lighting
- **Power** — Charging and power accessories

---

## License

Private demonstration project. All Nova branding and copy are fictional.
