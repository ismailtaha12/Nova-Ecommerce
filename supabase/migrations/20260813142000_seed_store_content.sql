-- Storefront and admin filler: reviews, coupons, inventory history,
-- plus demo orders/addresses/wishlist for the first admin account.

INSERT INTO public.reviews (product_id, author, rating, title, body, verified, created_at) VALUES
  ('arc-pro', 'Dana Wu', 5, 'The street disappeared.', 'Transparency is the first one I have trusted on a bike. Seal is firmer than Arc, which is the point.', true, '2026-07-11'),
  ('arc-pro', 'Luis Ortega', 4, 'Heavy ANC, light in the ear.', 'Case is bulkier. Sound is denser. I keep them for the office and Arc for everything else.', true, '2026-06-03'),
  ('pulse-studio', 'Greta Holm', 5, 'Desk reference that does not fatigue.', 'Open-back is honest. I mix on them for four hours and do not want to take them off, which is rare.', true, '2026-05-19'),
  ('pulse-studio', 'Ben Idris', 4, 'Needs a quiet room.', 'If the HVAC is loud you will hear it. In a still room they are the best Pulse makes.', true, '2026-04-27'),
  ('halo-mini', 'Sofia Reed', 4, 'Kitchen speaker, finally.', 'Handle is not a gimmick. IPX5 survived steam. It does not try to be Halo, and that is correct.', true, '2026-08-02'),
  ('halo-mini', 'Patrick Cho', 3, 'Smaller voice than I hoped.', 'Fine on a nightstand. I wanted more low end. Pair it or buy Halo.', true, '2026-07-15'),
  ('orbit-sport', 'Amelia Knox', 5, 'GPS that does not hunt.', 'Dual-frequency locked on a tree-lined loop. Recovery notes are useful and not theatrical.', true, '2026-06-29'),
  ('orbit-sport', 'Diego Vargas', 4, 'Lighter than Orbit, louder about training.', 'I switch to Classic on weeknights. Sport is the weekend watch.', true, '2026-05-08'),
  ('orbit-band', 'Claire Nguyen', 5, 'The strap the watch wanted.', 'Mesh sits flatter than the polymer. Clasp is sure. No snagging on cuffs.', true, '2026-07-22'),
  ('orbit-band', 'Tomás Silva', 4, 'Gets hair. Looks right.', 'If you have a lot of arm hair, know that. Otherwise it is the default strap now.', true, '2026-06-14'),
  ('veil', 'Harper Lin', 4, 'I can still hear the kitchen.', 'Open-ear is the feature. Bass is modest. For cycling it replaced earbuds I should not have been wearing.', true, '2026-08-05'),
  ('veil', 'Noah Barrett', 3, 'Winds up loud.', 'On a descent the wind noise wins. In the grocery store it is perfect.', true, '2026-07-01'),
  ('beam-floor', 'Ines Moreau', 5, 'Two lights, one object.', 'Uplight and reading head mean I retired a second lamp. Dimming is even.', true, '2026-04-02'),
  ('beam-floor', 'Kyle Brennan', 4, 'Tall, stable, a little slow to arrive.', 'Packaging is serious. Color temp is the same as Beam. Worth the wait.', true, '2026-03-19'),
  ('beam-pendant', 'Yara Haddad', 5, 'Dinner looks like dinner.', '2700 K and it stays there. Disc is the right size for a four-top.', true, '2026-07-09'),
  ('beam-pendant', 'Felix Brown', 4, 'Install was the only work.', 'Once hung, we have not touched it. Drop is generous.', true, '2026-06-25'),
  ('dusk', 'Leah Park', 5, 'Hallway without a spotlight.', 'Up/down throw is enough. It looks like it belongs to the wall.', true, '2026-05-21'),
  ('dusk', 'Omar Farid', 4, 'Warm, shallow, done.', 'Junction box lined up. Dimmer on the existing switch works.', true, '2026-04-30'),
  ('charge-hub', 'Nina Patel', 5, 'Nightstand, cleared.', 'Phone, Orbit, Arc case. Nothing slides. The wells are the product.', true, '2026-06-18'),
  ('charge-hub', 'Chris Adeyemi', 4, 'Qi2 as promised.', 'Third coil is slower, which is fine for the case. Pad stays cool.', true, '2026-05-12'),
  ('charge-travel', 'Elena Voss', 5, 'Weekend kit that actually fits.', 'GaN brick plus the 10k is the whole pocket. Sleeve is not decorative.', true, '2026-07-04'),
  ('charge-travel', 'Sam Ortiz', 4, 'Cables are the right length.', 'I stopped packing extras. Battery inspection note on returns is fair.', true, '2026-06-09'),
  ('charge-car', 'Priya Nair', 4, 'Two ports, one socket.', '60 W shared is enough for phone and Orbit. Body sits flush. Buy the cable set.', true, '2026-08-03'),
  ('charge-car', 'Jonah Ellis', 5, 'Stopped using the cigarette-lighter octopus.', 'Looks like it belongs in the car. Does not wobble.', true, '2026-07-17'),
  ('charge-cables', 'Maya Chen', 5, 'Three lengths, argument over.', 'The 0.5 m is the one I did not know I needed. Wrap keeps them a set.', true, '2026-08-06'),
  ('charge-cables', 'Alex Romero', 4, 'Braided, 60 W, boring.', 'Which is the brief. Replaced three mystery cables.', true, '2026-07-20'),
  ('pulse', 'Rae Kim', 5, 'Still the daily.', 'Six months in, cups have not flattened. ANC on the train is the reason I do not take the car.', true, '2026-08-04'),
  ('arc', 'Jordan Hale', 4, 'Calls from the sidewalk.', 'People stopped asking me to repeat myself. Fit is the story.', true, '2026-07-27'),
  ('halo', 'Ivy Laurent', 5, 'Furniture that plays music.', 'Guests do not ask what speaker it is. That is the highest compliment in this apartment.', true, '2026-06-11'),
  ('orbit', 'Theo Grant', 5, 'Week-long battery is not a slogan.', 'I charge on Sundays with the Hub. Notifications stay off. Correct.', true, '2026-07-13'),
  ('beam', 'Mina Costa', 4, 'Afternoon shift is real.', 'I notice when it is unplugged. Color tracking is the feature I would miss.', true, '2026-08-07');

INSERT INTO public.coupons (code, description, discount, status, uses, limit_count) VALUES
  ('AUDIO15', '15% off Pulse, Arc, and Halo', '15%', 'active', 96, 1500),
  ('LOOP10', '10% off Nova Loop', '10%', 'active', 41, 400),
  ('DESK25', '$25 off Charge Desk', '$25', 'scheduled', 0, 300),
  ('FREESHIP', 'Free standard shipping', 'Free ship', 'active', 640, 8000),
  ('HOLIDAY25', 'Holiday bundle, 20% off', '20%', 'expired', 1188, 1200),
  ('VIP30', 'VIP lighting preview', '30%', 'scheduled', 0, 150)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.inventory_logs (product_id, sku, change, reason, created_at) VALUES
  ('pulse', 'NV-PULSE', 24, 'Restock', '2026-07-12'),
  ('arc', 'NV-ARC', 40, 'Restock', '2026-07-12'),
  ('arc-pro', 'NV-ARC-PRO', -6, 'Order batch', '2026-07-20'),
  ('halo', 'NV-HALO', -3, 'Order NV-90004', '2026-04-22'),
  ('halo-pair', 'NV-HALO-PAIR', 8, 'Inbound', '2026-08-01'),
  ('pulse-lite', 'NV-PULSE-LITE', 30, 'Restock', '2026-07-28'),
  ('veil', 'NV-VEIL', -11, 'Sold through', '2026-08-06'),
  ('orbit', 'NV-ORBIT', -2, 'Order NV-90003', '2026-03-09'),
  ('orbit-sport', 'NV-ORBIT-SP', 20, 'Restock', '2026-06-02'),
  ('orbit-classic', 'NV-ORBIT-CL', 6, 'Inbound', '2026-07-30'),
  ('nova-loop', 'NV-LOOP', 15, 'Restock', '2026-08-02'),
  ('drift', 'NV-DRIFT', -9, 'Order batch', '2026-07-18'),
  ('beam', 'NV-BEAM', 12, 'Restock', '2026-06-15'),
  ('beam-floor', 'NV-BEAMFLR', 6, 'Inbound', '2026-07-05'),
  ('lumen', 'NV-LUMEN', -4, 'Order NV-90007', '2026-07-21'),
  ('charge-hub', 'NV-HUB', 50, 'Restock', '2026-06-20'),
  ('charge-desk', 'NV-DESK', 18, 'Inbound', '2026-08-04'),
  ('charge-brick', 'NV-BRICK', 60, 'Restock', '2026-07-08'),
  ('charge-cables', 'NV-CABLES', -22, 'Sold through', '2026-08-08'),
  ('dusk', 'NV-DUSK', 10, 'Inbound', '2026-05-29');

INSERT INTO public.addresses (user_id, label, name, line1, line2, city, state, zip, country, is_default)
SELECT
  p.id,
  'Home',
  trim(both from p.first_name || ' ' || p.last_name),
  '120 Market Street',
  'Suite 4',
  'Oakland',
  'CA',
  '94612',
  'United States',
  true
FROM public.profiles p
WHERE p.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.addresses a WHERE a.user_id = p.id
  );

INSERT INTO public.addresses (user_id, label, name, line1, city, state, zip, country, is_default)
SELECT
  p.id,
  'Office',
  trim(both from p.first_name || ' ' || p.last_name),
  '88 Second Street',
  'San Francisco',
  'CA',
  '94105',
  'United States',
  false
FROM public.profiles p
WHERE p.role = 'admin'
  AND NOT EXISTS (
    SELECT 1 FROM public.addresses a WHERE a.user_id = p.id AND a.label = 'Office'
  );

INSERT INTO public.wishlist_items (user_id, product_id)
SELECT p.id, x.pid
FROM public.profiles p
CROSS JOIN (VALUES
  ('halo-pair'),
  ('nova-loop'),
  ('lumen'),
  ('charge-desk'),
  ('orbit-classic')
) AS x(pid)
WHERE p.role = 'admin'
ON CONFLICT DO NOTHING;

-- Demo orders for the admin profile so analytics, dashboard queues, and account history have data.
DO $$
DECLARE
  uid uuid;
  oid uuid;
  addr jsonb := jsonb_build_object(
    'name', 'Ismail Taha',
    'line1', '120 Market Street',
    'line2', 'Suite 4',
    'city', 'Oakland',
    'state', 'CA',
    'zip', '94612',
    'country', 'United States'
  );
BEGIN
  SELECT id INTO uid FROM public.profiles WHERE role = 'admin' ORDER BY created_at LIMIT 1;
  IF uid IS NULL THEN
    RETURN;
  END IF;
  IF EXISTS (SELECT 1 FROM public.orders WHERE user_id = uid) THEN
    RETURN;
  END IF;

  -- 1 delivered Jan
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-01-18 17:10:00+00', 'paid', 'shipped', 'delivered', addr, 388.00, 0, 32.98, 420.98, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''), 'Standard', price, 1 FROM public.products WHERE id IN ('pulse', 'charge-cables');
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-01-18 17:10:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-01-18 17:10:00+00', true, 1),
    (oid, 'Fulfilled', '2026-01-19 15:00:00+00', true, 2),
    (oid, 'Shipped', '2026-01-20 09:30:00+00', true, 3),
    (oid, 'Delivered', '2026-01-22 14:12:00+00', true, 4);

  -- 2 delivered Feb
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-02-11 13:40:00+00', 'paid', 'shipped', 'delivered', addr, 189.00, 0, 16.07, 205.07, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''), 'Standard', price, 1 FROM public.products WHERE id = 'beam';
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-02-11 13:40:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-02-11 13:40:00+00', true, 1),
    (oid, 'Fulfilled', '2026-02-12 11:00:00+00', true, 2),
    (oid, 'Shipped', '2026-02-12 16:20:00+00', true, 3),
    (oid, 'Delivered', '2026-02-14 10:05:00+00', true, 4);

  -- 3 delivered Mar
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-03-09 19:02:00+00', 'paid', 'shipped', 'delivered', addr, 429.00, 0, 36.47, 465.47, 'express')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''), '40 mm', price, 1 FROM public.products WHERE id = 'orbit';
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-03-09 19:02:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-03-09 19:02:00+00', true, 1),
    (oid, 'Fulfilled', '2026-03-10 09:00:00+00', true, 2),
    (oid, 'Shipped', '2026-03-10 12:40:00+00', true, 3),
    (oid, 'Delivered', '2026-03-11 18:22:00+00', true, 4);

  -- 4 delivered Apr
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-04-22 15:33:00+00', 'paid', 'shipped', 'delivered', addr, 488.00, 0, 41.48, 529.48, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''),
    CASE id WHEN 'charge-hub' THEN 'US plug' ELSE 'Standard' END,
    price, 1
  FROM public.products WHERE id IN ('halo', 'charge-hub');
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-04-22 15:33:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-04-22 15:33:00+00', true, 1),
    (oid, 'Fulfilled', '2026-04-23 10:15:00+00', true, 2),
    (oid, 'Shipped', '2026-04-23 17:00:00+00', true, 3),
    (oid, 'Delivered', '2026-04-25 13:48:00+00', true, 4);

  -- 5 delivered May
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-05-16 11:08:00+00', 'paid', 'shipped', 'delivered', addr, 249.00, 0, 21.17, 270.17, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''), 'Standard', price, 1 FROM public.products WHERE id = 'arc-pro';
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-05-16 11:08:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-05-16 11:08:00+00', true, 1),
    (oid, 'Fulfilled', '2026-05-16 16:00:00+00', true, 2),
    (oid, 'Shipped', '2026-05-17 08:50:00+00', true, 3),
    (oid, 'Delivered', '2026-05-19 15:11:00+00', true, 4);

  -- 6 shipped Jun
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-06-28 20:44:00+00', 'paid', 'shipped', 'shipped', addr, 298.00, 0, 25.33, 323.33, 'express')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''),
    CASE id WHEN 'veil' THEN 'Graphite' ELSE 'Standard' END,
    price, 1
  FROM public.products WHERE id IN ('pulse-lite', 'veil');
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-06-28 20:44:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-06-28 20:44:00+00', true, 1),
    (oid, 'Fulfilled', '2026-06-29 12:00:00+00', true, 2),
    (oid, 'Shipped', '2026-06-29 18:10:00+00', true, 3),
    (oid, 'Delivered', NULL, false, 4);

  -- 7 fulfilled Jul
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-07-21 09:17:00+00', 'paid', 'fulfilled', 'fulfilled', addr, 348.00, 0, 29.58, 377.58, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''),
    CASE id WHEN 'lumen' THEN 'Warm bias' ELSE 'Standard' END,
    price, 1
  FROM public.products WHERE id IN ('lumen', 'beam-clamp');
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-07-21 09:17:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-07-21 09:17:00+00', true, 1),
    (oid, 'Fulfilled', '2026-07-21 16:40:00+00', true, 2),
    (oid, 'Shipped', NULL, false, 3),
    (oid, 'Delivered', NULL, false, 4);

  -- 8 delivered Jul
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-07-28 21:05:00+00', 'paid', 'shipped', 'delivered', addr, 249.00, 0, 21.17, 270.17, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''), 'Size 8', price, 1 FROM public.products WHERE id = 'nova-loop';
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-07-28 21:05:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-07-28 21:05:00+00', true, 1),
    (oid, 'Fulfilled', '2026-07-29 10:20:00+00', true, 2),
    (oid, 'Shipped', '2026-07-29 14:00:00+00', true, 3),
    (oid, 'Delivered', '2026-07-31 11:36:00+00', true, 4);

  -- 9 unfulfilled Aug — dashboard queue
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-08-10 16:55:00+00', 'paid', 'unfulfilled', 'processing', addr, 238.00, 0, 20.23, 258.23, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''),
    CASE id WHEN 'charge-desk' THEN 'US plug' ELSE 'Standard' END,
    price, 1
  FROM public.products WHERE id IN ('charge-desk', 'charge-brick');
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-08-10 16:55:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-08-10 16:55:00+00', true, 1),
    (oid, 'Fulfilled', NULL, false, 2),
    (oid, 'Shipped', NULL, false, 3),
    (oid, 'Delivered', NULL, false, 4);

  -- 10 cancelled Aug
  INSERT INTO public.orders (number, user_id, placed_at, payment_status, fulfillment_status, status, shipping_address, subtotal, shipping, tax, total, delivery)
  VALUES ('NV-' || to_char(nextval('private.order_number_seq'), 'FM00000'), uid, '2026-08-12 08:12:00+00', 'paid', 'unfulfilled', 'cancelled', addr, 149.00, 0, 12.67, 161.67, 'standard')
  RETURNING id INTO oid;
  INSERT INTO public.order_items (order_id, product_id, slug, name, image, variant, price, quantity)
  SELECT oid, id, slug, name, COALESCE(images[1], ''), 'Standard', price, 1 FROM public.products WHERE id = 'halo-mini';
  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (oid, 'Order placed', '2026-08-12 08:12:00+00', true, 0),
    (oid, 'Payment confirmed', '2026-08-12 08:12:00+00', true, 1),
    (oid, 'Fulfilled', NULL, false, 2),
    (oid, 'Shipped', NULL, false, 3),
    (oid, 'Delivered', NULL, false, 4);
END $$;

