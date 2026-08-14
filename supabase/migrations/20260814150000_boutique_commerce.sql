-- Boutique commerce: categories, variant stock, banners, coupons,
-- guest checkout, pending payments, shipping metadata, notifications.

-- ---------------------------------------------------------------------------
-- Store settings (tax, shipping fallbacks, origin, demo mode)
-- ---------------------------------------------------------------------------
ALTER TABLE public.store_settings
  ADD COLUMN IF NOT EXISTS tax_rate numeric(6, 4) NOT NULL DEFAULT 0.085,
  ADD COLUMN IF NOT EXISTS free_shipping_threshold numeric(10, 2) NOT NULL DEFAULT 75,
  ADD COLUMN IF NOT EXISTS fallback_standard_shipping numeric(10, 2) NOT NULL DEFAULT 12,
  ADD COLUMN IF NOT EXISTS fallback_express_shipping numeric(10, 2) NOT NULL DEFAULT 18,
  ADD COLUMN IF NOT EXISTS fallback_overnight_shipping numeric(10, 2) NOT NULL DEFAULT 32,
  ADD COLUMN IF NOT EXISTS origin_name text NOT NULL DEFAULT 'Nova',
  ADD COLUMN IF NOT EXISTS origin_line1 text NOT NULL DEFAULT '100 Market Street',
  ADD COLUMN IF NOT EXISTS origin_city text NOT NULL DEFAULT 'Oakland',
  ADD COLUMN IF NOT EXISTS origin_state text NOT NULL DEFAULT 'CA',
  ADD COLUMN IF NOT EXISTS origin_zip text NOT NULL DEFAULT '94607',
  ADD COLUMN IF NOT EXISTS origin_country text NOT NULL DEFAULT 'US',
  ADD COLUMN IF NOT EXISTS demo_mode boolean NOT NULL DEFAULT true;

-- ---------------------------------------------------------------------------
-- Categories (hierarchical)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  parent_id uuid REFERENCES public.categories (id) ON DELETE SET NULL,
  sort_order integer NOT NULL DEFAULT 0,
  archived_at timestamptz
);

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories (parent_id);
CREATE INDEX IF NOT EXISTS categories_sort_idx ON public.categories (sort_order);

INSERT INTO public.categories (slug, name, description, image, sort_order) VALUES
  ('audio', 'Audio', 'Headphones, earbuds, and speakers.', '/products/pulse.png', 0),
  ('wearables', 'Wearables', 'Timepieces that stay quiet.', '/products/orbit.png', 1),
  ('lighting', 'Lighting', 'Calibrated light for rooms and desks.', 'https://images.unsplash.com/photo-1507473886605-74d4bb4d3ace?auto=format&fit=crop&w=1200&q=80', 2),
  ('power', 'Power', 'Charging without the clutter.', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80', 3)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description, parent_id, sort_order)
SELECT 'headphones', 'Headphones', 'Over-ear and in-ear listening.', c.id, 0
FROM public.categories c WHERE c.slug = 'audio'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description, parent_id, sort_order)
SELECT 'speakers', 'Speakers', 'Room-filling sound.', c.id, 1
FROM public.categories c WHERE c.slug = 'audio'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description, parent_id, sort_order)
SELECT 'watches', 'Watches', 'Daily companions.', c.id, 0
FROM public.categories c WHERE c.slug = 'wearables'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description, parent_id, sort_order)
SELECT 'lamps', 'Lamps', 'Task and ambient lighting.', c.id, 0
FROM public.categories c WHERE c.slug = 'lighting'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.categories (slug, name, description, parent_id, sort_order)
SELECT 'charging', 'Charging', 'Cables, bricks, and pads.', c.id, 0
FROM public.categories c WHERE c.slug = 'power'
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.categories (id);

ALTER TABLE public.products
  ALTER COLUMN category TYPE text USING category::text;

UPDATE public.products p
SET category_id = c.id
FROM public.categories c
WHERE c.slug = p.category
  AND p.category_id IS NULL;

ALTER TABLE public.products
  ALTER COLUMN category_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS products_category_id_idx ON public.products (category_id);

DO $$ BEGIN
  DROP TYPE IF EXISTS public.product_category;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

CREATE OR REPLACE FUNCTION private.sync_product_category_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  SELECT slug INTO NEW.category
  FROM public.categories
  WHERE id = NEW.category_id;
  IF NEW.category IS NULL THEN
    RAISE EXCEPTION 'Unknown category';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_sync_category_slug ON public.products;
CREATE TRIGGER products_sync_category_slug
  BEFORE INSERT OR UPDATE OF category_id ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_product_category_slug();

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (archived_at IS NULL OR private.is_admin());

DROP POLICY IF EXISTS "Admins manage categories" ON public.categories;
CREATE POLICY "Admins manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ---------------------------------------------------------------------------
-- Variant stock / price / options
-- ---------------------------------------------------------------------------
ALTER TABLE public.product_variants
  ADD COLUMN IF NOT EXISTS price numeric(10, 2) CHECK (price IS NULL OR price >= 0),
  ADD COLUMN IF NOT EXISTS stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  ADD COLUMN IF NOT EXISTS options jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

UPDATE public.product_variants v
SET stock = p.stock
FROM public.products p
WHERE p.id = v.product_id
  AND v.stock = 0
  AND p.stock > 0;

CREATE OR REPLACE FUNCTION private.sync_product_stock()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  pid text;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);
  UPDATE public.products
  SET stock = COALESCE((
    SELECT SUM(v.stock)::integer FROM public.product_variants v WHERE v.product_id = pid
  ), 0)
  WHERE id = pid;
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS variants_sync_product_stock ON public.product_variants;
CREATE TRIGGER variants_sync_product_stock
  AFTER INSERT OR UPDATE OF stock OR DELETE ON public.product_variants
  FOR EACH ROW
  EXECUTE FUNCTION private.sync_product_stock();

UPDATE public.products p
SET stock = COALESCE((
  SELECT SUM(v.stock)::integer FROM public.product_variants v WHERE v.product_id = p.id
), 0);

ALTER TABLE public.inventory_logs
  ADD COLUMN IF NOT EXISTS variant_id text REFERENCES public.product_variants (id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Homepage banners
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.homepage_banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  image text NOT NULL DEFAULT '',
  cta_label text NOT NULL DEFAULT 'Shop now',
  cta_href text NOT NULL DEFAULT '/products',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.homepage_banners (title, subtitle, image, cta_label, cta_href, sort_order, active)
SELECT
  'Technology, beautifully designed.',
  'Devices built from honest materials and quiet engineering. Nothing extra, nothing missing.',
  COALESCE((SELECT images[1] FROM public.products WHERE featured = true AND archived_at IS NULL ORDER BY rating DESC LIMIT 1), '/products/pulse.png'),
  'Shop now',
  '/products',
  0,
  true
WHERE NOT EXISTS (SELECT 1 FROM public.homepage_banners);

ALTER TABLE public.homepage_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active banners" ON public.homepage_banners;
CREATE POLICY "Public can read active banners"
  ON public.homepage_banners FOR SELECT
  USING (
    private.is_admin()
    OR (
      active = true
      AND (starts_at IS NULL OR starts_at <= now())
      AND (ends_at IS NULL OR ends_at >= now())
    )
  );

DROP POLICY IF EXISTS "Admins manage banners" ON public.homepage_banners;
CREATE POLICY "Admins manage banners"
  ON public.homepage_banners FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ---------------------------------------------------------------------------
-- Coupons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text NOT NULL DEFAULT '',
  type text NOT NULL CHECK (type IN ('percent', 'fixed')),
  amount numeric(10, 2) NOT NULL CHECK (amount >= 0),
  min_subtotal numeric(10, 2) NOT NULL DEFAULT 0 CHECK (min_subtotal >= 0),
  max_uses integer CHECK (max_uses IS NULL OR max_uses >= 0),
  uses integer NOT NULL DEFAULT 0 CHECK (uses >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.coupons (code, description, type, amount, min_subtotal, max_uses, active)
VALUES
  ('WELCOME10', '10% off your first order', 'percent', 10, 0, 500, true),
  ('SAVE25', '$25 off orders over $100', 'fixed', 25, 100, 200, true)
ON CONFLICT (code) DO NOTHING;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons"
  ON public.coupons FOR SELECT
  USING (active = true OR private.is_admin());

DROP POLICY IF EXISTS "Admins manage coupons" ON public.coupons;
CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

-- ---------------------------------------------------------------------------
-- Orders: guest checkout, discounts, Stripe, shipping
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS guest_email text,
  ADD COLUMN IF NOT EXISTS guest_name text,
  ADD COLUMN IF NOT EXISTS guest_phone text,
  ADD COLUMN IF NOT EXISTS discount numeric(10, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS coupon_code text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS shipping_service text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS tracking_url text,
  ADD COLUMN IF NOT EXISTS label_url text,
  ADD COLUMN IF NOT EXISTS shippo_transaction_id text,
  ADD COLUMN IF NOT EXISTS shipping_rate_id text,
  ADD COLUMN IF NOT EXISTS stock_released_at timestamptz;

ALTER TABLE public.orders
  ALTER COLUMN payment_status SET DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_pi_idx
  ON public.orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS variant_id text REFERENCES public.product_variants (id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notes text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS disabled_at timestamptz;

CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  type text NOT NULL,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read stripe events" ON public.stripe_events;
CREATE POLICY "Admins read stripe events"
  ON public.stripe_events FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES public.orders (id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('email', 'sms')),
  event_type text NOT NULL,
  recipient text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS notification_logs_order_id_idx ON public.notification_logs (order_id);

ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read notifications" ON public.notification_logs;
CREATE POLICY "Admins read notifications"
  ON public.notification_logs FOR SELECT
  TO authenticated
  USING (private.is_admin());

DROP POLICY IF EXISTS "Admins insert notifications" ON public.notification_logs;
CREATE POLICY "Admins insert notifications"
  ON public.notification_logs FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

-- ---------------------------------------------------------------------------
-- Auth: demo_mode controls auto-admin and auto-confirm
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_first boolean;
  demo boolean;
BEGIN
  SELECT COALESCE((SELECT demo_mode FROM public.store_settings WHERE id = 1), true) INTO demo;
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first;

  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    CASE WHEN is_first AND demo THEN 'admin'::public.user_role ELSE 'customer'::public.user_role END
  );

  IF demo THEN
    UPDATE auth.users
    SET email_confirmed_at = COALESCE(email_confirmed_at, now())
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Restock / confirm payment
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION private.restock_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  item record;
BEGIN
  PERFORM 1 FROM public.orders WHERE id = p_order_id AND stock_released_at IS NULL FOR UPDATE;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  FOR item IN
    SELECT oi.product_id, oi.variant_id, oi.quantity, oi.variant
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    IF item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock = stock + item.quantity
      WHERE id = item.variant_id;

      INSERT INTO public.inventory_logs (product_id, variant_id, sku, change, reason)
      VALUES (item.product_id, item.variant_id, item.variant_id, item.quantity, 'Order restock');
    ELSE
      UPDATE public.products
      SET stock = stock + item.quantity
      WHERE id = item.product_id;

      INSERT INTO public.inventory_logs (product_id, sku, change, reason)
      VALUES (item.product_id, item.product_id, item.quantity, 'Order restock');
    END IF;
  END LOOP;

  UPDATE public.orders SET stock_released_at = now() WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.restock_order(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT private.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  PERFORM private.restock_order(p_order_id);
END;
$$;

CREATE OR REPLACE FUNCTION private.confirm_order_paid(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.orders
  SET payment_status = 'paid',
      status = CASE WHEN status = 'cancelled' THEN status ELSE 'processing' END
  WHERE id = p_order_id
    AND payment_status IS DISTINCT FROM 'paid';

  UPDATE public.order_events
  SET complete = true, occurred_at = COALESCE(occurred_at, now())
  WHERE order_id = p_order_id AND label = 'Payment confirmed';
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_order_paid(p_order_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF auth.role() IS DISTINCT FROM 'service_role' AND NOT private.is_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  PERFORM private.confirm_order_paid(p_order_id);
END;
$$;

REVOKE ALL ON FUNCTION public.restock_order(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.confirm_order_paid(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.restock_order(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.confirm_order_paid(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.restock_order(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.confirm_order_paid(uuid) TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- place_order: pending payment, variant stock, coupons, guests
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.place_order(jsonb, jsonb, public.delivery_method);
DROP FUNCTION IF EXISTS private.place_order(jsonb, jsonb, public.delivery_method);

CREATE OR REPLACE FUNCTION private.place_order(
  p_items jsonb,
  p_shipping_address jsonb,
  p_delivery public.delivery_method,
  p_coupon_code text DEFAULT NULL,
  p_guest jsonb DEFAULT NULL,
  p_shipping_amount numeric DEFAULT NULL,
  p_shipping_meta jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  uid uuid := auth.uid();
  item jsonb;
  prod public.products%ROWTYPE;
  variant public.product_variants%ROWTYPE;
  settings public.store_settings%ROWTYPE;
  coupon public.coupons%ROWTYPE;
  qty integer;
  variant_name text;
  variant_id text;
  line_price numeric(10, 2);
  v_subtotal numeric(10, 2) := 0;
  v_discount numeric(10, 2) := 0;
  v_shipping numeric(10, 2) := 0;
  v_tax numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_order_id uuid;
  v_number text;
  guest_email text;
  guest_name text;
  guest_phone text;
  v_code text;
BEGIN
  guest_email := lower(trim(COALESCE(p_guest ->> 'email', '')));
  guest_name := trim(COALESCE(p_guest ->> 'name', ''));
  guest_phone := trim(COALESCE(p_guest ->> 'phone', ''));

  IF uid IS NULL AND guest_email = '' THEN
    RAISE EXCEPTION 'Email is required';
  END IF;

  IF p_items IS NULL OR jsonb_typeof(p_items) <> 'array' OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'Cart is empty';
  END IF;

  IF p_shipping_address IS NULL
     OR COALESCE(p_shipping_address ->> 'line1', '') = ''
     OR COALESCE(p_shipping_address ->> 'city', '') = ''
     OR COALESCE(p_shipping_address ->> 'zip', '') = '' THEN
    RAISE EXCEPTION 'Shipping address is incomplete';
  END IF;

  SELECT * INTO settings FROM public.store_settings WHERE id = 1;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    qty := COALESCE((item ->> 'quantity')::integer, 0);
    variant_name := COALESCE(item ->> 'variant', '');
    variant_id := COALESCE(item ->> 'variant_id', '');

    IF qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity';
    END IF;

    SELECT * INTO prod
    FROM public.products
    WHERE id = item ->> 'product_id'
      AND archived_at IS NULL
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found';
    END IF;

    IF variant_id <> '' THEN
      SELECT * INTO variant
      FROM public.product_variants
      WHERE id = variant_id AND product_id = prod.id
      FOR UPDATE;
    ELSE
      SELECT * INTO variant
      FROM public.product_variants
      WHERE product_id = prod.id AND name = variant_name
      FOR UPDATE;
    END IF;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Unknown variant for %', prod.name;
    END IF;

    IF variant.stock < qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', prod.name;
    END IF;

    line_price := COALESCE(variant.price, prod.price);
    v_subtotal := v_subtotal + ROUND(line_price * qty, 2);

    UPDATE public.product_variants
    SET stock = stock - qty
    WHERE id = variant.id;

    INSERT INTO public.inventory_logs (product_id, variant_id, sku, change, reason)
    VALUES (prod.id, variant.id, variant.id, -qty, 'Order');
  END LOOP;

  v_code := upper(trim(COALESCE(p_coupon_code, '')));
  IF v_code <> '' THEN
    SELECT * INTO coupon
    FROM public.coupons
    WHERE upper(coupons.code) = v_code
    FOR UPDATE;

    IF NOT FOUND OR coupon.active IS NOT TRUE THEN
      RAISE EXCEPTION 'Invalid coupon code';
    END IF;
    IF coupon.starts_at IS NOT NULL AND coupon.starts_at > now() THEN
      RAISE EXCEPTION 'Coupon is not active yet';
    END IF;
    IF coupon.expires_at IS NOT NULL AND coupon.expires_at < now() THEN
      RAISE EXCEPTION 'Coupon has expired';
    END IF;
    IF coupon.max_uses IS NOT NULL AND coupon.uses >= coupon.max_uses THEN
      RAISE EXCEPTION 'Coupon has been fully redeemed';
    END IF;
    IF v_subtotal < coupon.min_subtotal THEN
      RAISE EXCEPTION 'Order does not meet the coupon minimum';
    END IF;

    IF coupon.type = 'percent' THEN
      v_discount := ROUND(v_subtotal * coupon.amount / 100, 2);
    ELSE
      v_discount := coupon.amount;
    END IF;
    IF v_discount > v_subtotal THEN
      v_discount := v_subtotal;
    END IF;

    UPDATE public.coupons SET uses = uses + 1 WHERE id = coupon.id;
  ELSE
    v_code := NULL;
  END IF;

  IF p_shipping_amount IS NOT NULL THEN
    v_shipping := GREATEST(p_shipping_amount, 0);
  ELSE
    v_shipping := CASE p_delivery
      WHEN 'express' THEN COALESCE(settings.fallback_express_shipping, 18)
      WHEN 'overnight' THEN COALESCE(settings.fallback_overnight_shipping, 32)
      ELSE CASE
        WHEN v_subtotal >= COALESCE(settings.free_shipping_threshold, 75) THEN 0
        ELSE COALESCE(settings.fallback_standard_shipping, 12)
      END
    END;
  END IF;

  v_tax := ROUND((v_subtotal - v_discount) * COALESCE(settings.tax_rate, 0.085), 2);
  v_total := ROUND(v_subtotal - v_discount + v_shipping + v_tax, 2);
  v_number := 'NV-' || to_char(nextval('private.order_number_seq'), 'FM00000');

  INSERT INTO public.orders (
    number, user_id, payment_status, fulfillment_status, status,
    shipping_address, subtotal, shipping, tax, total, delivery,
    discount, coupon_code, guest_email, guest_name, guest_phone,
    shipping_rate_id, carrier, shipping_service
  ) VALUES (
    v_number, uid, 'pending', 'unfulfilled', 'processing',
    p_shipping_address, v_subtotal, v_shipping, v_tax, v_total, p_delivery,
    v_discount, v_code, NULLIF(guest_email, ''), NULLIF(guest_name, ''), NULLIF(guest_phone, ''),
    NULLIF(p_shipping_meta ->> 'rate_id', ''),
    NULLIF(p_shipping_meta ->> 'carrier', ''),
    NULLIF(p_shipping_meta ->> 'service', '')
  )
  RETURNING id INTO v_order_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO prod FROM public.products WHERE id = item ->> 'product_id';
    qty := (item ->> 'quantity')::integer;
    variant_name := COALESCE(item ->> 'variant', '');
    variant_id := COALESCE(item ->> 'variant_id', '');

    IF variant_id <> '' THEN
      SELECT * INTO variant FROM public.product_variants WHERE id = variant_id;
    ELSE
      SELECT * INTO variant FROM public.product_variants
      WHERE product_id = prod.id AND name = variant_name;
    END IF;

    line_price := COALESCE(variant.price, prod.price);

    INSERT INTO public.order_items (
      order_id, product_id, slug, name, image, variant, variant_id, price, quantity
    ) VALUES (
      v_order_id,
      prod.id,
      prod.slug,
      prod.name,
      COALESCE(prod.images[1], ''),
      variant.name,
      variant.id,
      line_price,
      qty
    );
  END LOOP;

  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (v_order_id, 'Order placed', now(), true, 0),
    (v_order_id, 'Payment confirmed', NULL, false, 1),
    (v_order_id, 'Fulfilled', NULL, false, 2),
    (v_order_id, 'Shipped', NULL, false, 3),
    (v_order_id, 'Delivered', NULL, false, 4);

  RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb,
  p_shipping_address jsonb,
  p_delivery public.delivery_method,
  p_coupon_code text DEFAULT NULL,
  p_guest jsonb DEFAULT NULL,
  p_shipping_amount numeric DEFAULT NULL,
  p_shipping_meta jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.place_order(
    p_items, p_shipping_address, p_delivery, p_coupon_code, p_guest, p_shipping_amount, p_shipping_meta
  );
$$;

REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb, public.delivery_method, text, jsonb, numeric, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION private.place_order(jsonb, jsonb, public.delivery_method, text, jsonb, numeric, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, public.delivery_method, text, jsonb, numeric, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION private.place_order(jsonb, jsonb, public.delivery_method, text, jsonb, numeric, jsonb) TO anon, authenticated;
