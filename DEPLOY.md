# Production deployment and handover

Nova is a Next.js 16 App Router storefront with Supabase (Postgres, Auth, Storage), Stripe, Shippo, Resend, and Twilio.

## Hosting

1. Create a Vercel project from this repository.
2. Use the hosted Supabase project already configured in `.env.local`.
3. Apply SQL in `supabase/migrations/` if the remote database is behind (Nova Store project `wrrtsmknzdnzjwrwkyed` already has the boutique commerce migration).

## Environment variables

Copy `.env.example` into Vercel and local `.env.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET` with a `NEXT_PUBLIC_` prefix.

Required for a live boutique:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (webhooks, guest order lookup, payment confirmation)
- Stripe keys + webhook secret
- `SHIPPO_API_KEY` (live rates and labels; fallback flat rates work without it)
- `RESEND_API_KEY` (order emails)
- Twilio vars (shipment SMS)

## Webhooks

After the first production deploy, add:

- Stripe: `https://YOUR_DOMAIN/api/webhooks/stripe`  
  Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
- Shippo: `https://YOUR_DOMAIN/api/webhooks/shippo?token=SHIPPO_WEBHOOK_TOKEN`  
  Tracking updates mark orders shipped/delivered

Use Stripe CLI for local testing:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Production auth

In Admin → Settings, turn **Demo mode** off before going live.

That disables:

- Auto-confirm on signup (Supabase will send confirmation emails)
- Auto-promoting the first user to admin

Promote a known operator in SQL:

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'owner@example.com';
```

## Payments and shipping

- Cards are collected with Stripe Payment Element. Card data never hits this server.
- If Stripe keys are missing and demo mode is on, checkout still creates a pending order and marks it paid so local demos work.
- Shippo is used for address validation, live rates, and labels. Without `SHIPPO_API_KEY`, checkout uses the fallback rates in store settings.
- Admins refund paid orders from the order page (Stripe refund + restock).
- Admins buy a Shippo label when the order has a stored rate id.

## Notifications

Transactional email (Resend): order/payment confirmation, status, shipped, delivered.  
SMS (Twilio): shipment and delivery when a phone was collected at checkout.  
WhatsApp is intentionally out of scope for US/EU.

## First-run checklist

- [ ] Seed or confirm an admin user
- [ ] Upload catalog images / set banners
- [ ] Create at least one coupon (`WELCOME10` is seeded)
- [ ] Place a test order with Stripe test card `4242…`
- [ ] Confirm webhook marks the order paid
- [ ] Buy a Shippo test label (or mark shipped manually)
- [ ] Confirm email arrives
- [ ] Export analytics CSV
- [ ] Turn demo mode off

## Knowledge transfer

Walk through:

1. Storefront: browse → variant cart → guest checkout → track order
2. Admin: products, variants, inventory, coupons, banners, orders, refunds
3. Supabase dashboard: tables, RLS, `place_order`, storage bucket `product-images`
4. Stripe / Shippo dashboards and webhook logs
