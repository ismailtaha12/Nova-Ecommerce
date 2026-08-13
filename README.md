# Nova

**Nova** is a premium consumer-electronics storefront: product discovery, cart, checkout, customer accounts, and an admin dashboard. Catalog, auth, orders, reviews, wishlist, and inventory are stored in **Supabase (Postgres)**. Next.js 16 is the application backend — Server Components read data, Server Actions mutate it, and Row Level Security protects the database.

Payment is still simulated. Placing an order writes a real paid order and decrements real stock.

Open the site at [http://localhost:3000](http://localhost:3000) after running the dev server.

**Interview prep:** see [INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md) for architecture, three core flows, demo script, and common Q&A.

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

- **Homepage** — Hero, featured products, and category browse
- **Product catalog** — Server-side filters (category, price, rating, availability) synced to the URL
- **Product detail** — Gallery, variants, specs, live reviews, and related products
- **Search** — Command palette (`Ctrl/Cmd + K`) and dedicated search page
- **Cart** — Guest cart in `localStorage`; prices and stock re-checked at checkout
- **Checkout** — Sign-in required; mock payment; real order + stock decrement via `place_order()`
- **Account** — Profile, orders, addresses, wishlist, and settings
- **Auth** — Email/password sign up, sign in, password reset

### Admin

Requires an `admin` profile. **The first account that signs up is automatically made admin.**

- **Dashboard** — Live KPIs and charts from real orders
- **Products** — List, create, edit, archive
- **Inventory** — Stock levels and adjustment log
- **Orders** — Status updates with timeline events
- **Customers** — Profiles with order counts and spend
- **Categories, reviews** — Supporting catalog views
- **Analytics** — Revenue, orders, and top products from the database

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

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key — never put the service role key here |

In the Supabase dashboard, add `http://localhost:3000/auth/callback` to **Redirect URLs**. New accounts are auto-confirmed so the first sign-up creates a session immediately.

### Other scripts

```bash
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # Run ESLint
```

### First login

1. Visit `/login` and create an account (password at least 8 characters).
2. That first user is granted the `admin` role.
3. Storefront account: `/account`. Admin: `/admin`.

---

## Architecture

```
Browser  →  Next.js server (RSC + Server Actions + proxy.ts)
                 ↓
         Supabase (Postgres + RLS, Auth, Storage)
```

- **Reads** — Server Components in `lib/data-access/`
- **Writes** — Server Actions in `lib/actions/` (auth-checked, Zod-validated)
- **Checkout** — `place_order()` Postgres function: validates stock, snapshots prices, writes the order, decrements inventory in one transaction
- **Session** — Cookie-based via `@supabase/ssr`; `proxy.ts` refreshes tokens
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
├── supabase/              # Browser/server clients + Database types
├── data-access/           # Server queries
├── actions/               # Server Actions
├── catalog.ts             # Static category navigation
└── stores/                # Cart (localStorage) + session/wishlist UI

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
| `/checkout` | Checkout (signed in) |
| `/account` | Customer account hub |
| `/login` | Sign in / create account |

### Admin

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Orders |
| `/admin/inventory` | Stock |

---

## Product categories

- **Audio** — Headphones, earbuds, speakers
- **Wearables** — Watches and companions
- **Lighting** — Desk and room lighting
- **Power** — Charging and power accessories

---

## License

Private demonstration project. All Nova branding and copy are fictional.
