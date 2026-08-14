# Nova — Interview Guide

Use this document to **understand**, **explain**, and **demo** Nova in technical interviews. For the current working-feature map, read [FEATURES.md](./FEATURES.md). For deep backend rationale, also read [CODE_OVERVIEW.md](./CODE_OVERVIEW.md). For setup and routes, see [README.md](./README.md).

---

## 1. Elevator pitch (30 seconds)

> **Nova** is a full-stack e-commerce app: Next.js 16 storefront + admin dashboard, Supabase (Postgres, Auth, Storage) as the system of record. The browser never owns prices, stock, or roles — `place_order` reserves variant stock on a **pending** order; Stripe (or demo mode) confirms payment. Cart is localStorage for guest UX. Guest checkout and `/orders/track` are supported.

**Stack:** Next.js App Router, React 19, TypeScript, Tailwind, Supabase, Zod, Server Actions.

---

## 2. The one diagram to remember

```
Browser
  ├─ Client stores (cart, wishlist UI)     ← fast UX, NOT source of truth
  ├─ Server Components → lib/data-access   ← READ (queries + mappers)
  └─ Server Actions    → lib/actions       ← WRITE (Zod + auth + DB)

proxy.ts (Next.js convention)
  └─ refreshes auth cookies + redirects guests from /account and /admin
     (/checkout is public for guest checkout)

Supabase
  ├─ Auth (sessions in cookies)
  ├─ Postgres + RLS (who can see/change which rows)
  └─ place_order RPC (atomic checkout)
```

**BFF pattern:** Next.js is the only app server. The client uses the **publishable** Supabase key, never the service role.

---

## 3. Folder map — what lives where

| Path | Role | Interview phrase |
|------|------|----------------|
| `app/(storefront)/` | Public shop pages | URL routes, mostly Server Components |
| `app/admin/` | Back office | `requireAdmin()` in layout |
| `app/auth/` | Email callback, password reset | No storefront chrome |
| `proxy.ts` | Next.js **Proxy** (was middleware) | Runs before every page; not imported anywhere |
| `lib/supabase/middleware.ts` | Helper for proxy | Session refresh + route redirects |
| `lib/supabase/server.ts` | Server Supabase client | Cookie-bound, used in RSC + actions |
| `lib/supabase/client.ts` | Browser client | Rare direct use |
| `lib/supabase/database.types.ts` | Generated TS from schema | `Tables<"products">`, etc. |
| `lib/data-access/` | **Reads** | Queries + call mappers |
| `lib/data-access/mappers.ts` | DB row → domain type | Anti-corruption layer |
| `lib/actions/` | **Writes** | Server Actions, Zod, revalidate |
| `lib/types.ts` | Domain types for UI | `Product`, `Order`, camelCase |
| `lib/stores/` | Client context | Cart (localStorage), wishlist, auth mirror |
| `supabase/migrations/` | Schema, RLS, RPCs, seeds | Source of truth for DB |

---

## 4. Core concepts (plain English)

### Server Component vs Client Component

- **Server Component** (default): runs on the server, can call `lib/data-access`, no `useState`. Pages like `app/(storefront)/account/orders/page.tsx`.
- **Client Component** (`"use client"`): runs in the browser, can use hooks and stores. Examples: `checkout-flow.tsx`, `cart-store.tsx`, `login-form.tsx`.

### Server Action

Function in `lib/actions/*` with `"use server"`. The browser calls it like a function; it runs on the server with access to cookies and the DB. Always: **auth → Zod validate → mutate → revalidatePath**.

### proxy.ts

Next.js 16 **file convention** at the project root. You never import it — the framework runs `export async function proxy()` on matching requests. It delegates to `updateSession()` in `lib/supabase/middleware.ts`.

### Mappers

Postgres returns `snake_case` (`review_count`, `placed_at`). React uses `camelCase` (`reviewCount`, `date`). Mappers translate once in `mappers.ts` so components stay clean. **Interview line:** “Anti-corruption layer between schema and UI.”

### database.types.ts vs lib/types.ts

| File | Shape | Used by |
|------|--------|---------|
| `database.types.ts` | DB columns, generated | Supabase client, mappers |
| `types.ts` | App domain | Pages, components, stores |

### Stores (lib/stores)

| Store | Purpose | Source of truth |
|-------|---------|-----------------|
| `cart-store` | Bag, drawer, display totals | **localStorage** until checkout |
| `wishlist-store` | Heart toggle | DB if logged in, localStorage if guest |
| `auth-store` | Passes `user` to client | Server `getSessionUser()` in root layout |

### RLS (Row Level Security)

Postgres policies: e.g. “users can only SELECT their own orders.” Last line of defense if you forget a check in app code.

### Role

Stored in **`profiles.role`**, not JWT `user_metadata` (user-editable). First signup → `admin` via DB trigger; everyone else → `customer`.

---

## 5. Three flows to know cold

Study these in order. For each, you should trace **UI → action/data-access → DB** without opening the repo.

---

### Flow A — Sign in → account

**Story:** User submits login → session cookie set → every page knows who they are → account shows orders.

| Step | What happens | File |
|------|----------------|------|
| 1 | User submits form | `app/(storefront)/login/login-form.tsx` |
| 2 | `signInAction` validates email/password (Zod), calls Supabase | `lib/actions/auth.ts` |
| 3 | Supabase sets **session cookies** | Supabase Auth |
| 4 | Redirect to `next` or `/account` | `signInAction` |
| 5 | Every request: `proxy.ts` → `getClaims()`, refresh cookies | `lib/supabase/middleware.ts` |
| 6 | Root layout loads user + wishlist | `app/layout.tsx` → `getSessionUser()`, `listWishlistIds()` |
| 7 | `getSessionUser`: JWT id → load/create `profiles` row | `lib/data-access/auth.ts` |
| 8 | User passed to client via `AuthProvider` | `lib/stores/providers.tsx` |
| 9 | Account page loads orders | `listMyOrders()` in `lib/data-access/orders.ts` |
| 10 | Rows mapped to `Order` | `mapOrder()` in `mappers.ts` |

**Sign-up extra:** `handle_new_user` trigger on `auth.users` INSERT creates `profiles`; first user gets `admin`.

**Two gates for protected routes:**

1. **proxy** — “Is there a session?” (guest → `/login`)
2. **requireUser / requireAdmin** — in server code (role, data access)

**Say in interview:** “Middleware-style proxy only knows JWT presence; admin role is checked again in `requireAdmin()` because role lives in Postgres, not the token alone.”

---

### Flow B — Add to cart → checkout → order

**Story:** Cart is local; checkout sends ids only; Postgres prices, checks stock, writes order atomically.

| Step | What happens | File |
|------|----------------|------|
| 1 | Add to bag | `cart-store.tsx` → `localStorage` key `nova-cart` |
| 2 | Stored: `productId`, `variant`, `qty`, display price | **Price in cart is not trusted** |
| 3 | User on `/checkout` (must be signed in — proxy) | `checkout-flow.tsx` |
| 4 | User completes steps, clicks place order | `placeOrder()` in checkout-flow |
| 5 | Calls `placeOrderAction` with items **without** prices | `lib/actions/checkout.ts` |
| 6 | `requireUser()` + Zod on address, delivery, items | same file |
| 7 | `supabase.rpc("place_order", …)` | Postgres function |
| 8 | Inside RPC: `FOR UPDATE` on products, stock check, decrement, insert order + line snapshots + timeline | `20260813120000_init_schema.sql` |
| 9 | Returns `orderId`; cart cleared; redirect | checkout-flow |
| 10 | Customer sees order | `/account/orders/[id]` → `getOrderById` → RLS ensures own orders only |

**Why RPC?** Customers cannot INSERT into `orders` via RLS. The definer function runs privileged writes **after** stock checks, still as the authenticated user.

**Attack you can mention:** Changing cart price in DevTools does not change charged amount — server reads `products.price`.

**Sequence one-liner:** UI → Action → RPC → lock rows → validate → write → commit or rollback all.

---

### Flow C — Admin fulfills order

**Story:** Admin opens order → marks fulfilled/shipped/delivered → customer timeline updates.

| Step | What happens | File |
|------|----------------|------|
| 1 | `/admin` layout runs | `app/admin/layout.tsx` → `requireAdmin()` |
| 2 | Order detail page loads order + customer | `getAdminOrderById()` |
| 3 | Admin clicks “Mark fulfilled” | `order-fulfillment-actions.tsx` |
| 4 | `updateFulfillmentAction({ orderId, step })` | `lib/actions/admin.ts` |
| 5 | Updates `orders.status` / `fulfillment_status` | Supabase update |
| 6 | Marks matching `order_events` row complete + timestamp | same action |
| 7 | `revalidatePath` for admin + account | cache refresh |
| 8 | Customer refreshes order page | timeline shows new step |

**Cancel path (bonus):** `cancelOrderAction` restocks items (idempotent) — mention if asked about inventory integrity.

---

## 6. Security layers (memorize the table)

| Layer | Mechanism | Stops |
|-------|-----------|-------|
| Edge | `proxy.ts` | Anonymous `/account`, `/checkout`, `/admin` |
| App | `requireUser()`, `requireAdmin()` | Missing session, non-admin admin actions |
| Validation | Zod in actions | Malformed payloads |
| Database | RLS | Cross-user data access via API |
| Transaction | `place_order` | Overselling, wrong totals, partial orders |
| Schema | Triggers | Role escalation, review rating sync |

**Never in client env:** `service_role` key. Only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

---

## 7. Data model highlights

**Identity:** `auth.users` (Supabase) 1:1 `profiles` (app: name, phone, role).

**Catalog:** `products`, `product_variants`, soft delete via `archived_at`.

**Orders:** `orders`, `order_items` (price **snapshot** at purchase), `order_events` (timeline).

**Why snapshot line items?** If admin changes product price tomorrow, old orders still show what customer paid.

**Derived data:** `products.rating` / `review_count` updated by trigger on `reviews` insert/update/delete.

---

## 8. Live demo script (~3 minutes)

1. **Home** → `/products` → open a PDP → add to bag.
2. **Checkout** (signed in) → place order → “payment simulated.”
3. **Account** → `/account/orders` → open order → show timeline.
4. **Admin** → `/admin/orders` → same order → Mark fulfilled → shipped.
5. Back to **account order** → timeline updated.

**While demoing, say once:** “Cart is client-side for UX; checkout re-prices from the database in one transaction.”

---

## 9. Common interview questions & answers

### “Walk me through the architecture.”

Next.js BFF: Server Components read via `data-access`, mutations via Server Actions, Supabase for Auth + Postgres + Storage. Proxy refreshes sessions. Checkout integrity is in `place_order`, not the React cart.

### “Why not trust the cart?”

Browser state can be edited. Checkout sends only product id, variant, quantity. Prices, tax, shipping, stock come from Postgres at order time.

### “Why Supabase instead of a custom API?”

Postgres + Auth + RLS + RPC in one place; Next.js Server Actions avoid a separate Express layer. Tradeoff: less control over connection pooling at extreme scale.

### “How do you prevent overselling?”

`SELECT … FOR UPDATE` on product rows inside `place_order`, check `stock >= quantity`, decrement in same transaction. Concurrent checkouts serialize on that row.

### “How is admin authorization done?”

`profiles.role = 'admin'`, set by trigger on first user only. `requireAdmin()` on layout and every admin action. RLS limits what customers can write. Role is not in user-editable JWT metadata.

### “What are Server Actions vs API routes?”

Server Actions: typed functions called from components, colocated with UI, automatic POST to the route. API routes used here mainly for `/auth/callback` (OAuth/email code exchange).

### “Why mappers?”

Separate DB shape from UI shape; one place for `Number(price)`, timeline assembly, JSON address parsing. Components stay readable.

### “What would you add for production?”

Stripe webhooks (payment separate from stock), email notifications, rate limiting, tests on `place_order`, CI/CD, observability, real email confirmation, idempotency keys on checkout.

### “What’s mocked vs real?”

| Mocked | Real |
|--------|------|
| Payment UI | Orders, order_items, events |
| — | Stock decrement |
| — | Auth, profiles, RLS |
| — | Reviews, wishlist, addresses |
| — | Admin CRUD, analytics from DB |

### “Biggest limitation?”

Payment and order placement happen together — fine for demo; production would separate authorize/capture and handle webhook failures without double-charging or orphan stock.

---

## 10. File cheat sheet (quick lookup)

| I need to understand… | Open |
|------------------------|------|
| Session refresh + redirects | `proxy.ts`, `lib/supabase/middleware.ts` |
| Login/signup | `lib/actions/auth.ts`, `app/auth/callback/route.ts` |
| Who is logged in | `lib/data-access/auth.ts` |
| Product listing | `lib/data-access/products.ts`, `lib/filter-products.ts` |
| Checkout write | `lib/actions/checkout.ts` |
| Checkout RPC | `supabase/migrations/20260813120000_init_schema.sql` → `place_order` |
| My orders | `lib/data-access/orders.ts` |
| Admin fulfillment | `lib/actions/admin.ts` → `updateFulfillmentAction` |
| Cart (client) | `lib/stores/cart-store.tsx` |
| Domain types | `lib/types.ts` |
| DB types | `lib/supabase/database.types.ts` |

---

## 11. Study plan (6–8 hours)

| Session | Focus | Done when |
|---------|--------|-----------|
| 1 | Flow A (auth) + §4 concepts | Explain login without reading code |
| 2 | Flow B (checkout) + RPC skim | Explain why cart price doesn’t matter |
| 3 | Flow C (admin) + demo §8 | Run demo smoothly once |
| 4 | §9 Q&A out loud | Answer 5 questions confidently |

Then: deploy, add 3–5 tests on checkout/stock, CI on `npm run build`.

---

## 12. Phrases that sound senior (use sparingly)

- “Defense in depth: proxy, app auth, RLS, and transactional RPC.”
- “Anti-corruption layer between Postgres and the UI domain model.”
- “Fail closed on protected routes; publishable key only on the client.”
- “Order lines snapshot commercial terms at purchase time.”
- “Optimistic UI on wishlist; cart stays local until a authenticated checkout.”

---

## 13. Honesty policy for interviews

If you did not write every line: **own the architecture and the three flows**, not every helper. Say: “I’d open `orders.ts` for the exact query, but checkout goes through `place_order` because…” Interviewers respect accurate boundaries.

---

## 14. Related docs

| Document | Best for |
|----------|----------|
| [README.md](./README.md) | Setup, routes, stack |
| [CODE_OVERVIEW.md](./CODE_OVERVIEW.md) | Backend design, ER diagram, tradeoffs |
| This file | Interview prep, flows, Q&A |

Good luck. If you can explain **Flow B (checkout)** for two minutes without notes, you are ready for most “tell me about your project” rounds.
