# Nova

**Nova** is a premium consumer-electronics storefront built as a frontend-only demonstration project. It presents a complete shopping experience — product discovery, cart, checkout, customer account, and an admin dashboard — using mock data and client-side state. There is no real backend, payment processor, or database.

Open the site at [http://localhost:3000](http://localhost:3000) after running the dev server.

---

## Project overview

Nova is designed to feel like a modern direct-to-consumer tech brand (headphones, earbuds, speakers, wearables, and accessories). The UI follows a restrained, editorial aesthetic: warm paper backgrounds, ink typography, generous spacing, and product photography on soft neutral plates.

The app is split into two main areas:

| Area | Route prefix | Purpose |
|------|--------------|---------|
| **Storefront** | `/` | Public shopping experience |
| **Admin** | `/admin` | Back-office dashboard for managing catalog and orders |

All product, order, and customer data lives in static TypeScript files under `lib/data/`. Cart, wishlist, auth, and admin edits persist in the browser via `localStorage`.

---

## Features

### Storefront

- **Homepage** — Hero, featured products, and category browse
- **Product catalog** — Filterable listing with category, price, color, rating, and availability filters
- **Product detail** — Gallery, variants, color swatches, specs, reviews, and related products
- **Search** — Command palette (`Ctrl/Cmd + K`) and dedicated search page
- **Cart** — Slide-out drawer with quantity controls
- **Checkout** — Multi-step mock checkout flow
- **Account** — Profile, orders, addresses, wishlist, and settings (requires mock login)
- **Login** — Sign in with any email to use the demo account

### Admin

- **Dashboard** — KPIs and charts (revenue, orders, top products)
- **Products** — List, create, edit, and delete products
- **Inventory** — Stock levels and adjustment log
- **Orders** — Order management table
- **Customers** — Customer list
- **Categories, coupons, reviews** — Supporting catalog views
- **Analytics & settings** — Additional admin screens

---

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Base UI |
| Icons | Lucide React |
| Charts | Recharts |
| Toasts | Sonner |
| Font | Instrument Sans (Google Fonts) |

---

## Design system

| Token | Value | Usage |
|-------|-------|--------|
| Paper | `#F6F4F0` | Page background |
| Ink | `#0C0C0C` | Primary text and buttons |
| Ember | `#C45C26` | Accent / brand highlight |
| Muted | `#ECE8E1` | Cards, plates, secondary surfaces |

Typography uses **Instrument Sans** with tight tracking on headings and uppercase eyebrow labels for section headers.

---

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Install and run

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build   # Production build
npm run start   # Serve production build
npm run lint    # Run ESLint
```

### Demo login

Visit `/login` and enter any email address. Auth is mocked and stored locally — no password or API is required.

Admin is available at `/admin` without a separate login gate in this demo.

---

## Project structure

```
app/
├── (storefront)/          # Public shop routes
│   ├── page.tsx           # Homepage
│   ├── products/          # Catalog + product detail
│   ├── cart/
│   ├── checkout/
│   ├── account/
│   ├── search/
│   └── login/
├── admin/                 # Admin dashboard routes
├── layout.tsx             # Root layout + fonts
└── globals.css            # Design tokens + utilities

components/
├── home/                  # Homepage sections (hero, category browse)
├── product/               # Cards, listing, PDP, filters
├── cart/                  # Cart drawer and line items
├── checkout/              # Checkout flow
├── account/               # Account navigation and guards
├── admin/                 # Admin UI (charts, forms, sidebar)
├── layout/                # Header, footer, container
├── navigation/            # Logo, search dialog
└── ui/                    # shadcn/ui primitives

lib/
├── data/                  # Mock catalog (products, orders, reviews, …)
├── stores/                # Cart, wishlist, auth, admin (localStorage)
├── filter-products.ts     # Catalog filtering and sort logic
├── types.ts               # Shared TypeScript types
└── format.ts              # Price and display helpers
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
| `/checkout` | Checkout flow |
| `/account` | Customer account hub |
| `/login` | Mock sign-in |

### Admin

| Route | Description |
|-------|-------------|
| `/admin` | Dashboard |
| `/admin/products` | Product management |
| `/admin/orders` | Orders |
| `/admin/inventory` | Stock |
| `/admin/customers` | Customers |

---

## State and data

### Mock data (`lib/data/`)

- **`products.ts`** — Product catalog, categories, and helpers
- **`catalog.ts`** — Orders, reviews, coupons, customers, browse categories, and analytics seed data

### Client stores (`lib/stores/`)

| Store | Persists | Purpose |
|-------|----------|---------|
| `cart-store` | Yes | Cart items and drawer UI |
| `wishlist-store` | Yes | Saved products |
| `auth-store` | Yes | Mock customer session |
| `admin-store` | Yes | Admin product CRUD overrides |

Cart and wishlist survive page reloads. Admin product edits merge with the seed catalog in memory and local storage.

---

## Product categories

Nova organizes products into four catalog categories:

- **Audio** — Headphones, earbuds, speakers
- **Wearables** — Watches and companions
- **Lighting** — Desk and room lighting
- **Power** — Charging and power accessories

The homepage category browse also surfaces **Phones**, **Tablets**, and **Home** as navigation entry points mapped to relevant product filters.

---

## Configuration

`next.config.ts` includes:

- Remote image support for Unsplash
- Turbopack root configuration
- `allowedDevOrigins` for local network dev access

Product images may be served from `/public/products/` (local assets) or Unsplash URLs defined in the seed data.

---

## Limitations

This is a **demonstration project**, not production e-commerce software:

- No real payments, shipping, or email
- No server-side API or database
- Admin changes are local to the browser
- Inventory and orders are static mock records

---

## License

Private demonstration project. All Nova branding and copy are fictional.
