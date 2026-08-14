# Nova — Working Features

This is the feature catalog for the current codebase. Each section states **what the user can do**, **which files implement it**, and **what is required for it to run** (Supabase only vs Stripe / Shippo / Resend / Twilio).

Related docs:

- Setup and routes — [README.md](./README.md)
- Production deploy — [DEPLOY.md](./DEPLOY.md)
- Backend rationale (some older sections still describe the pre-Stripe checkout) — [CODE_OVERVIEW.md](./CODE_OVERVIEW.md)
- Interview talking points — [INTERVIEW_GUIDE.md](./INTERVIEW_GUIDE.md)

---

## How to read the status tags

| Tag | Meaning |
|-----|---------|
| **Works now** | Live against hosted Supabase with the current `.env.local` |
| **Needs Stripe** | UI and server path exist; Payment Element / webhooks need Stripe keys |
| **Needs Shippo** | Falls back to store-settings rates / ZIP regex without `SHIPPO_API_KEY` |
| **Needs Resend / Twilio** | Sends are skipped and logged when keys are missing |
| **UI only** | Toast or checkbox; nothing is persisted |

Demo mode (`store_settings.demo_mode`, default **on**): if Stripe is not configured, checkout still creates a pending order and immediately marks it **paid** so local demos work. Turn it off in Admin → Settings before a real boutique goes live.

---

## Architecture (current)

```
Browser (React 19, App Router)
  ├─ localStorage cart          ← productId, variant, qty only
  ├─ Server Components          ← lib/data-access (reads)
  └─ Server Actions             ← lib/actions (Zod + auth + writes)

proxy.ts → lib/supabase/middleware.ts
  ├─ refreshes auth cookies
  └─ redirects guests from /account and /admin  (NOT /checkout)

Postgres (Supabase + RLS)
  ├─ place_order()              ← pending order + variant stock reserve
  ├─ confirm_order_paid()       ← Stripe webhook / demo path
  └─ restock_order()            ← failed payment, refund, cancel

Stripe / Shippo webhooks → SUPABASE_SERVICE_ROLE_KEY client
Resend + Twilio → lib/notifications (never blocks checkout)
```

The browser never sees `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET`.

---

## 1. Storefront catalog

### 1.1 Homepage

**Status:** Works now

| | |
|-|-|
| **Route** | `/` |
| **Page** | `app/(storefront)/page.tsx` |
| **UI** | `components/home/hero-section.tsx`, `components/home/category-browse.tsx`, `components/product/product-card.tsx` |
| **Data** | `listActiveBanners()`, `getFeaturedProducts()`, `listCategories()` in `lib/data-access/products.ts` |

- Hero title, subtitle, and CTA come from `homepage_banners` when at least one **active** banner exists; otherwise hardcoded fallback copy.
- Multiple banners become a carousel (dots).
- Featured strip uses products flagged `featured`.
- Category browse uses the `categories` table (roots; children exist as subcategories in admin/filters).

### 1.2 Product listing and filters

**Status:** Works now

| | |
|-|-|
| **Route** | `/products` |
| **Page** | `app/(storefront)/products/page.tsx` |
| **UI** | `components/product/product-listing.tsx` |
| **Query** | `listProducts()` + `parseProductFilters()` |

URL query params (shareable, back-button correct):

| Param | Meaning |
|-------|---------|
| `category` | Category slug; includes child slugs via `categorySlugsForFilter()` |
| `min` / `max` | Price range |
| `rating` | Minimum rating |
| `stock` | `in-stock` / `out-of-stock` |
| `sort` | `featured`, `newest`, `price-asc`, `price-desc`, `best-selling` |
| `q` | Name / tagline / category `ilike` (wildcards stripped) |

Archived products (`archived_at`) are excluded from the storefront.

### 1.3 Product detail (PDP)

**Status:** Works now

| | |
|-|-|
| **Route** | `/products/[slug]` |
| **Page** | `app/(storefront)/products/[slug]/page.tsx` |
| **UI** | `components/product/product-detail.tsx` |

Working PDP behavior:

- Image gallery: click thumbnails; primary image is `images[0]`.
- Variant picker: each variant has its own **price** (null = inherit product price) and **stock**.
- Add to cart uses `variantPrice()` and the selected variant’s stock cap.
- Specs, shipping, returns copy from the product row.
- Related products: same category, excluding the current product.
- Reviews: listed from `reviews`; signed-in customers can submit (`submitReviewAction`). Product `rating` / `review_count` are maintained by a Postgres trigger.

### 1.4 Search

**Status:** Works now

| | |
|-|-|
| **Command palette** | `Ctrl/Cmd + K` → `components/navigation/search-dialog.tsx` |
| **Page** | `/search` → `app/(storefront)/search/page.tsx` |

Palette uses product summaries loaded in the storefront layout. The search page reuses `listProducts({ q })`.

### 1.5 Cart

**Status:** Works now (client-side until checkout)

| | |
|-|-|
| **State** | `lib/stores/cart-store.tsx` (`nova-cart` in `localStorage`) |
| **Pages** | `/cart`, header drawer `components/cart/cart-drawer.tsx` |

Guests can add / change qty / remove without an account. Prices shown in the cart are **preview only**. Checkout re-prices from the database and re-checks variant stock.

---

## 2. Auth and account

### 2.1 Sign up, sign in, password reset

**Status:** Works now

| Action | File |
|--------|------|
| Sign up / in / out | `lib/actions/auth.ts` |
| Login UI | `app/(storefront)/login/login-form.tsx` |
| Reset request | `/login/reset` |
| Set new password | `/auth/update-password` |
| Email link callback | `app/auth/callback/route.ts` |

- Password minimum 8 characters.
- `next` query is open-redirect guarded (`safeNextPath`).
- Session cookies via `@supabase/ssr`; `proxy.ts` refreshes tokens.
- Role lives on `profiles.role`, not Auth `user_metadata`.
- **Demo mode on:** first signup becomes admin; emails auto-confirm.
- **Demo mode off:** confirmation emails come from Supabase Auth; first user is **not** auto-promoted.

Protected routes: `/account/*` and `/admin/*`. **`/checkout` is public.**

### 2.2 Account hub

**Status:** Works now (except notification checkboxes)

| Route | What it does |
|-------|----------------|
| `/account` | Overview: recent orders, addresses |
| `/account/profile` | Update first name, last name, phone (`updateProfileAction`) |
| `/account/orders` | Order history (RLS: own rows only) |
| `/account/orders/[id]` | Timeline, items, totals, tracking link if present |
| `/account/addresses` | Create, delete, set default (`lib/actions/addresses.ts`) |
| `/account/wishlist` | Server-backed wishlist (`wishlist_items`) |
| `/account/settings` | **UI only** — preference checkboxes toast “saved”; Sign out is real |

Wishlist: optimistic UI in `lib/stores/wishlist-store.tsx`, persisted with `toggleWishlistAction`. Guests are prompted to sign in.

---

## 3. Checkout, coupons, guests

### 3.1 Checkout flow

**Status:** Works now (demo paid without Stripe; card capture needs Stripe)

| | |
|-|-|
| **Route** | `/checkout` |
| **UI** | `components/checkout/checkout-flow.tsx` (4 steps: Information → Address → Delivery → Payment) |
| **Actions** | `lib/actions/checkout.ts` |

Steps:

1. **Information** — email (required for guests and members), name, optional phone.
2. **Address** — saved-address buttons when signed in; otherwise form. ZIP validated (`validateAddressAction` → Shippo or regex).
3. **Delivery** — `quoteRatesAction` (Shippo live rates or fallback $12 / $18 / $32 and free standard above threshold).
4. **Payment** — coupon preview, then `placeOrderAction`.

`placeOrderAction`:

1. Zod-validates cart IDs + qty (no client prices).
2. Calls `public.place_order` (granted to **anon + authenticated**).
3. RPC: locks variants `FOR UPDATE`, decrements **variant stock**, applies coupon from DB, writes order as `payment_status = pending`, snapshots line prices.
4. Creates a Stripe PaymentIntent for the **DB total** (metadata `order_id`).
5. If no Stripe key and demo mode: `confirm_order_paid` + order-confirmation email.
6. Optional: save address for signed-in users.

Guest fields on `orders`: `guest_email`, `guest_name`, `guest_phone`. `user_id` is nullable.

### 3.2 Coupons

**Status:** Works now

Seeded codes:

| Code | Rule |
|------|------|
| `WELCOME10` | 10% off, no minimum |
| `SAVE25` | $25 off when subtotal ≥ $100 |

- Checkout “Apply” is a **preview** (`previewCouponAction` + `applyCouponDiscount` in `lib/commerce.ts`).
- Authoritative discount is inside `place_order` (active, dates, max uses, min subtotal). Stored on the order as `discount` + `coupon_code`.
- Admin CRUD: `/admin/coupons` → `upsertCouponAction` / `deleteCouponAction`.

### 3.3 Guest order tracking

**Status:** Works now (needs `SUPABASE_SERVICE_ROLE_KEY` to load guest orders)

| | |
|-|-|
| **Route** | `/orders/track` |
| **UI** | `components/account/order-track-form.tsx` |
| **Action** | `trackOrderAction(number, email)` |

Looks up by order number; email must match `guest_email` / customer email (or the caller is the owner / admin). Footer “Order status” links here.

### 3.4 Success / failure

**Status:** Works now

`/checkout/success` thanks the shopper and links to track. If Stripe redirects with `redirect_status=failed`, the same page shows a failure message and a return-to-checkout link. Payment **paid** is never set from this page.

---

## 4. Stripe payments

**Status:** Needs Stripe for live cards; demo path works without keys

| Piece | File |
|-------|------|
| Server SDK | `lib/payments/stripe.ts` — `createPaymentIntent`, `refundPayment` |
| Event helpers | `lib/payments/stripe-webhook.ts` |
| Payment Element | `components/checkout/stripe-pay-form.tsx` |
| Webhook | `POST /api/webhooks/stripe` |
| Admin refund | `refundOrderAction` in `lib/actions/admin.ts` |

Flow:

1. Order is **pending**, stock already reserved.
2. Client confirms with Stripe.js (`redirect: if_required`). Card data never hits Nova.
3. Webhook verifies `stripe-signature`, inserts `stripe_events.id` (idempotent), then:
   - `payment_intent.succeeded` → `confirm_order_paid` + payment email
   - `payment_intent.payment_failed` → `failed` / cancelled + `restock_order`
   - `charge.refunded` → `refunded` / cancelled + restock (idempotent via `stock_released_at`)
4. If processing throws, the event row is deleted so Stripe can retry.

Admin **Refund** calls `stripe.refunds.create` when a PaymentIntent exists, then restocks.

Tests: `lib/payments/stripe-webhook.test.ts`, `lib/commerce.test.ts`.

---

## 5. Shippo shipping

**Status:** Needs Shippo for live rates/labels; ZIP + fallback rates work without it

| Piece | File |
|-------|------|
| REST client | `lib/shipping/shippo.ts` |
| Webhook | `POST /api/webhooks/shippo` |
| Buy label | `buyShippingLabelAction` |

Without `SHIPPO_API_KEY`:

- ZIP/postal must match `^[A-Za-z0-9][A-Za-z0-9\s-]{2,10}$`.
- Rates come from `store_settings` (`fallbackStandardShipping` 12, express 18, overnight 32; free standard at `freeShippingThreshold`, default 75).

With Shippo:

- Address validation API.
- Shipment rates for warehouse origin (Admin → Settings) → destination.
- Admin **Buy shipping label** after payment if `shipping_rate_id` is stored.
- Persisted: `carrier`, `shipping_service`, `tracking_number`, `tracking_url`, `label_url`, `shippo_transaction_id`, `shipping_rate_id`.
- Tracking webhook: `TRANSIT` → shipped + timeline; `DELIVERED` → delivered. Optional `?token=` / `x-shippo-token` vs `SHIPPO_WEBHOOK_TOKEN`.

Customer and admin order pages show the tracking URL; admin can download the label PDF.

---

## 6. Notifications

**Status:** Needs Resend / Twilio; otherwise skipped + logged

| Event | Email | SMS |
|-------|-------|-----|
| Order confirmation (demo paid path) | Yes | No |
| Payment confirmation (Stripe webhook) | Yes | No |
| Shipped (Shippo webhook) | Yes | Yes (if phone) |
| Delivered | Yes | Yes (if phone) |

Implementation: `lib/notifications/index.ts` → `notifyOrderEvent()`. Attempts are written to `notification_logs`. Missing keys do not fail checkout.

**WhatsApp** is out of scope (US/EU boutique).

**Not wired:** footer newsletter (`components/layout/newsletter-form.tsx`) and account “Order updates / Product news” checkboxes — toasts only.

---

## 7. Admin back office

All `/admin` routes require `profiles.role = 'admin'` (`app/admin/layout.tsx` + `requireAdmin()`). Nav: `components/admin/admin-nav.tsx`.

### 7.1 Dashboard

**Route:** `/admin`  
**Data:** `getAdminDashboard()` — KPIs from **paid** orders, recent orders, low-stock products.

### 7.2 Analytics + CSV

**Route:** `/admin/analytics`  
Ranges: 30d / 90d / all. Charts from Recharts. **Export CSV** (`exportOrdersCsvAction`) downloads paid orders: number, date, payment, status, total, email, coupon.

### 7.3 Products

**Routes:** `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`  
**Form:** `components/admin/product-form.tsx`

Working:

- Create / edit / archive / restore.
- Category picker from `categories` (UUID `category_id`).
- Multi-image gallery: upload to Storage bucket `product-images`, reorder, remove, first image is primary (`uploadProductImageAction`, `updateProductImagesAction`).
- Variants: name, sku key, price override, stock, optional size/color options (`saveProductVariantsAction`). Product `stock` is the sum of variant stock (trigger).

### 7.4 Inventory

**Route:** `/admin/inventory`  
Per-variant rows; +/- adjustments with reason (`adjustStockAction`) → `inventory_logs`. Filters: search, low stock, out of stock.

### 7.5 Categories

**Route:** `/admin/categories`  
Create / edit / archive / restore. `parent_id` = subcategory. Storefront filter includes children when a parent slug is selected.

### 7.6 Coupons and banners

| Route | Table | Actions |
|-------|-------|---------|
| `/admin/coupons` | `coupons` | percent/fixed, min subtotal, max uses, dates, active |
| `/admin/banners` | `homepage_banners` | title, subtitle, image, CTA, sort, active, optional start/end |

### 7.7 Orders

**Routes:** `/admin/orders`, `/admin/orders/[id]`

- Filter by status / search.
- Manual timeline: fulfill → ship → deliver (`updateFulfillmentAction`).
- Buy Shippo label, refund, cancel + restock.
- Shows guest vs account customer, coupon, tracking, label URL.

### 7.8 Customers

**Routes:** `/admin/customers`, `/admin/customers/[id]`

Search, order count, spend. Internal **notes** and **suspend** (`disabled_at`) via `updateCustomerNotesAction`. Role changes are **not** exposed in the UI (SQL only) so operators cannot accidentally promote someone.

### 7.9 Reviews

**Route:** `/admin/reviews` — list + delete (`deleteReviewAdminAction`).

### 7.10 Settings

**Route:** `/admin/settings`  
`updateStoreSettingsAction`: store name, support email, tax rate, free-shipping threshold, fallback shipping amounts, warehouse origin (Shippo `address_from`), **demo mode**.

---

## 8. Database objects that make features work

Schema lives in `supabase/migrations/`. Boutique layers are in `20260814150000_boutique_commerce.sql`.

| Object | Role |
|--------|------|
| `categories` | Hierarchical catalog (`parent_id`) |
| `products.category_id` | FK; `category` text slug kept in sync |
| `product_variants.price / stock / options / sort_order` | Variant commerce |
| `homepage_banners` | CMS hero |
| `coupons` | Authoritative discounts |
| `orders.payment_status` default `pending` | Stripe-first checkout |
| `orders.guest_*`, shipping/Stripe columns | Guests + carriers + PI id |
| `stripe_events` | Webhook idempotency |
| `notification_logs` | Email/SMS audit |
| `store_settings.demo_mode` | Auto-confirm + first-user admin |
| `place_order(...)` | Pending + reserve variant stock + coupon |
| `confirm_order_paid(uuid)` | Mark paid (service_role / admin) |
| `restock_order(uuid)` | Return stock once (`stock_released_at`) |

RLS still applies: customers cannot insert orders directly; only the RPC can. Catalog is public read for non-archived products. Admin writes use authenticated admin policies.

---

## 9. File map (feature → code)

| Feature | Read | Write / API | UI |
|---------|------|-------------|-----|
| Homepage / banners | `data-access/products.ts` | `actions/catalog.ts` | `hero-section.tsx`, `admin/banners` |
| Catalog filters | `data-access/products.ts`, `filter-products.ts` | — | `product-listing.tsx` |
| Variants / gallery | mappers + product select | `actions/admin.ts`, `catalog.ts` | `product-detail.tsx`, `product-form.tsx` |
| Cart | — | — | `cart-store.tsx` |
| Auth | `data-access/auth.ts` | `actions/auth.ts` | `login-form.tsx` |
| Checkout | `getStoreSettings` | `actions/checkout.ts`, `place_order` | `checkout-flow.tsx` |
| Stripe | — | `payments/stripe.ts`, `api/webhooks/stripe` | `stripe-pay-form.tsx` |
| Shippo | — | `shipping/shippo.ts`, `api/webhooks/shippo` | checkout delivery step, order admin |
| Coupons | `getCouponByCode` | `place_order`, `catalog.ts` | checkout + `/admin/coupons` |
| Guest track | service-role select | `trackOrderAction` | `/orders/track` |
| Notifications | — | `lib/notifications/index.ts` | (email/SMS, no UI) |
| Inventory | `listInventoryLogs` | `adjustStockAction` | `inventory-panel.tsx` |
| Analytics CSV | `getAnalytics` | `exportOrdersCsvAction` | `/admin/analytics` |
| Customers | `getAdminCustomerById` | `updateCustomerNotesAction` | `customer-manage-form.tsx` |

---

## 10. What is intentionally not built

These are **not** bugs relative to the boutique brief; they are out of scope or UI placeholders:

| Item | Reality |
|------|---------|
| Server-side cart sync across devices | Cart stays `localStorage` |
| Personalized recommendations | Related = same category |
| Stripe Tax | Tax rate from `store_settings` (default 8.5%) |
| WhatsApp | Documented out of scope |
| Newsletter list | Toast only |
| Account notification prefs | Toast only |
| Optional “create account” on guest checkout | Guests check out with email; they can sign up separately |
| Auto-buy Shippo label on paid | Admin buys the label (or marks shipped manually) |
| Dedicated `/categories/[slug]` | `/products?category=` is the storefront URL |

---

## 11. How to verify a feature locally

1. `npm run dev` → [http://localhost:3000](http://localhost:3000)
2. Browse `/products`, open a PDP, switch variants, add to bag.
3. Checkout as guest (`/checkout`) with `WELCOME10`.
4. Without Stripe: demo mode marks the order paid; track at `/orders/track`.
5. With Stripe test keys + `stripe listen --forward-to localhost:3000/api/webhooks/stripe`: pay with `4242…`; confirm admin order is `paid`.
6. Admin: edit a product gallery/variant, change a banner, export analytics CSV.
7. `npm test` — unit + integration tests for coupons, checkout validation, guest tracking, Stripe webhooks (signature, idempotency, paid/fail/refund), demo vs PaymentIntent, admin refunds, Shippo fallback, open-redirect guard.
8. `npm run build` — typecheck + production compile.

Env template: [`.env.example`](./.env.example). Go-live checklist: [DEPLOY.md](./DEPLOY.md).
