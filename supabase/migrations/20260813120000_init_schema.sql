-- Nova storefront schema, RLS, and transactional checkout.
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO postgres, service_role, anon, authenticated;

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

CREATE TYPE public.product_category AS ENUM ('audio', 'wearables', 'lighting', 'power');
CREATE TYPE public.order_status AS ENUM ('processing', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('paid', 'pending', 'failed', 'refunded');
CREATE TYPE public.fulfillment_status AS ENUM ('unfulfilled', 'partial', 'fulfilled', 'shipped');
CREATE TYPE public.coupon_status AS ENUM ('active', 'expired', 'scheduled');
CREATE TYPE public.user_role AS ENUM ('customer', 'admin');
CREATE TYPE public.delivery_method AS ENUM ('standard', 'express', 'overnight');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'customer',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.products (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  price numeric(10, 2) NOT NULL CHECK (price >= 0),
  compare_at_price numeric(10, 2) CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
  rating numeric(3, 2) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count integer NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  category public.product_category NOT NULL,
  images text[] NOT NULL DEFAULT '{}',
  stock integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  featured boolean NOT NULL DEFAULT false,
  best_seller boolean NOT NULL DEFAULT false,
  newest boolean NOT NULL DEFAULT false,
  on_sale boolean NOT NULL DEFAULT false,
  archived_at timestamptz,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  shipping text NOT NULL DEFAULT '',
  returns text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.product_variants (
  id text PRIMARY KEY,
  product_id text NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  sku_key text NOT NULL,
  name text NOT NULL,
  UNIQUE (product_id, sku_key)
);

CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  author text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title text NOT NULL,
  body text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  name text NOT NULL,
  line1 text NOT NULL,
  line2 text,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  country text NOT NULL DEFAULT 'United States',
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  placed_at timestamptz NOT NULL DEFAULT now(),
  payment_status public.payment_status NOT NULL DEFAULT 'paid',
  fulfillment_status public.fulfillment_status NOT NULL DEFAULT 'unfulfilled',
  status public.order_status NOT NULL DEFAULT 'processing',
  shipping_address jsonb NOT NULL,
  subtotal numeric(10, 2) NOT NULL,
  shipping numeric(10, 2) NOT NULL,
  tax numeric(10, 2) NOT NULL,
  total numeric(10, 2) NOT NULL,
  delivery public.delivery_method NOT NULL DEFAULT 'standard'
);

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products (id),
  slug text NOT NULL,
  name text NOT NULL,
  image text NOT NULL,
  variant text NOT NULL,
  price numeric(10, 2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0)
);

CREATE TABLE public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders (id) ON DELETE CASCADE,
  label text NOT NULL,
  occurred_at timestamptz,
  complete boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0
);

CREATE TABLE public.wishlist_items (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  product_id text NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text NOT NULL,
  discount text NOT NULL,
  status public.coupon_status NOT NULL DEFAULT 'active',
  uses integer NOT NULL DEFAULT 0 CHECK (uses >= 0),
  limit_count integer NOT NULL DEFAULT 0 CHECK (limit_count >= 0)
);

CREATE TABLE public.inventory_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products (id) ON DELETE CASCADE,
  sku text NOT NULL,
  change integer NOT NULL,
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_idx ON public.products (category);
CREATE INDEX products_featured_idx ON public.products (featured) WHERE archived_at IS NULL;
CREATE INDEX products_name_trgm_idx ON public.products USING gin (name gin_trgm_ops);
CREATE INDEX reviews_product_id_idx ON public.reviews (product_id);
CREATE INDEX orders_user_id_idx ON public.orders (user_id);
CREATE INDEX orders_placed_at_idx ON public.orders (placed_at DESC);
CREATE INDEX order_items_order_id_idx ON public.order_items (order_id);
CREATE INDEX order_items_product_id_idx ON public.order_items (product_id);
CREATE INDEX addresses_user_id_idx ON public.addresses (user_id);
CREATE INDEX inventory_logs_product_id_idx ON public.inventory_logs (product_id, created_at DESC);

CREATE SEQUENCE private.order_number_seq START WITH 90000;

CREATE OR REPLACE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER products_set_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION private.set_updated_at();

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'::public.user_role
  );
$$;

REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, anon;

CREATE OR REPLACE FUNCTION private.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  is_first boolean;
BEGIN
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first;

  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    CASE WHEN is_first THEN 'admin'::public.user_role ELSE 'customer'::public.user_role END
  );

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION private.handle_new_user();

CREATE OR REPLACE FUNCTION private.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT private.is_admin() THEN
    RAISE EXCEPTION 'Cannot change role';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION private.prevent_role_escalation();

CREATE OR REPLACE FUNCTION private.refresh_product_rating()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  pid text;
BEGIN
  pid := COALESCE(NEW.product_id, OLD.product_id);

  UPDATE public.products p
  SET
    rating = COALESCE((
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      WHERE r.product_id = pid
    ), 0),
    review_count = (
      SELECT COUNT(*)::integer
      FROM public.reviews r
      WHERE r.product_id = pid
    )
  WHERE p.id = pid;

  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER reviews_refresh_product_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION private.refresh_product_rating();

CREATE OR REPLACE FUNCTION private.set_review_verified()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.user_id IS NOT NULL THEN
    NEW.verified := EXISTS (
      SELECT 1
      FROM public.order_items oi
      JOIN public.orders o ON o.id = oi.order_id
      WHERE o.user_id = NEW.user_id
        AND oi.product_id = NEW.product_id
        AND o.payment_status = 'paid'::public.payment_status
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER reviews_set_verified
  BEFORE INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION private.set_review_verified();

CREATE OR REPLACE FUNCTION private.place_order(
  p_items jsonb,
  p_shipping_address jsonb,
  p_delivery public.delivery_method
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
  qty integer;
  variant_name text;
  v_subtotal numeric(10, 2) := 0;
  v_shipping numeric(10, 2) := 0;
  v_tax numeric(10, 2) := 0;
  v_total numeric(10, 2) := 0;
  v_order_id uuid;
  v_number text;
  line_total numeric(10, 2);
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
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

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    qty := COALESCE((item ->> 'quantity')::integer, 0);
    variant_name := COALESCE(item ->> 'variant', '');

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

    IF prod.stock < qty THEN
      RAISE EXCEPTION 'Insufficient stock for %', prod.name;
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM public.product_variants v
      WHERE v.product_id = prod.id
        AND v.name = variant_name
    ) THEN
      RAISE EXCEPTION 'Unknown variant for %', prod.name;
    END IF;

    line_total := ROUND(prod.price * qty, 2);
    v_subtotal := v_subtotal + line_total;

    UPDATE public.products
    SET stock = stock - qty
    WHERE id = prod.id;

    INSERT INTO public.inventory_logs (product_id, sku, change, reason)
    VALUES (prod.id, 'NV-' || upper(prod.id), -qty, 'Order');
  END LOOP;

  v_shipping := CASE p_delivery
    WHEN 'express' THEN 18
    WHEN 'overnight' THEN 32
    ELSE CASE WHEN v_subtotal >= 75 THEN 0 ELSE 12 END
  END;
  v_tax := ROUND(v_subtotal * 0.085, 2);
  v_total := ROUND(v_subtotal + v_shipping + v_tax, 2);
  v_number := 'NV-' || to_char(nextval('private.order_number_seq'), 'FM00000');

  INSERT INTO public.orders (
    number, user_id, payment_status, fulfillment_status, status,
    shipping_address, subtotal, shipping, tax, total, delivery
  ) VALUES (
    v_number, uid, 'paid', 'unfulfilled', 'processing',
    p_shipping_address, v_subtotal, v_shipping, v_tax, v_total, p_delivery
  )
  RETURNING id INTO v_order_id;

  FOR item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    SELECT * INTO prod FROM public.products WHERE id = item ->> 'product_id';
    qty := (item ->> 'quantity')::integer;
    variant_name := item ->> 'variant';

    INSERT INTO public.order_items (
      order_id, product_id, slug, name, image, variant, price, quantity
    ) VALUES (
      v_order_id,
      prod.id,
      prod.slug,
      prod.name,
      COALESCE(prod.images[1], ''),
      variant_name,
      prod.price,
      qty
    );
  END LOOP;

  INSERT INTO public.order_events (order_id, label, occurred_at, complete, sort_order) VALUES
    (v_order_id, 'Order placed', now(), true, 0),
    (v_order_id, 'Payment confirmed', now(), true, 1),
    (v_order_id, 'Fulfilled', NULL, false, 2),
    (v_order_id, 'Shipped', NULL, false, 3),
    (v_order_id, 'Delivered', NULL, false, 4);

  RETURN v_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.place_order(
  p_items jsonb,
  p_shipping_address jsonb,
  p_delivery public.delivery_method
)
RETURNS uuid
LANGUAGE sql
SECURITY INVOKER
SET search_path = ''
AS $$
  SELECT private.place_order(p_items, p_shipping_address, p_delivery);
$$;

REVOKE ALL ON FUNCTION private.place_order(jsonb, jsonb, public.delivery_method) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.place_order(jsonb, jsonb, public.delivery_method) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_order(jsonb, jsonb, public.delivery_method) TO authenticated;
GRANT EXECUTE ON FUNCTION private.place_order(jsonb, jsonb, public.delivery_method) TO authenticated;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active products"
  ON public.products FOR SELECT
  USING (archived_at IS NULL OR private.is_admin());

CREATE POLICY "Admins manage products"
  ON public.products FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Public can read variants"
  ON public.product_variants FOR SELECT
  USING (true);

CREATE POLICY "Admins manage variants"
  ON public.product_variants FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Public can read reviews"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users insert own reviews"
  ON public.reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own reviews"
  ON public.reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR private.is_admin())
  WITH CHECK (auth.uid() = user_id OR private.is_admin());

CREATE POLICY "Admins delete reviews"
  ON public.reviews FOR DELETE
  TO authenticated
  USING (private.is_admin() OR auth.uid() = user_id);

CREATE POLICY "Users read own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR private.is_admin());

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR private.is_admin())
  WITH CHECK (id = auth.uid() OR private.is_admin());

CREATE POLICY "Users manage own addresses"
  ON public.addresses FOR ALL
  TO authenticated
  USING (user_id = auth.uid() OR private.is_admin())
  WITH CHECK (user_id = auth.uid() OR private.is_admin());

CREATE POLICY "Users read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR private.is_admin());

CREATE POLICY "Admins update orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Users read own order items"
  ON public.order_items FOR SELECT
  TO authenticated
  USING (
    private.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Users read own order events"
  ON public.order_events FOR SELECT
  TO authenticated
  USING (
    private.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins manage order events"
  ON public.order_events FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Users manage own wishlist"
  ON public.wishlist_items FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public can read coupons"
  ON public.coupons FOR SELECT
  USING (true);

CREATE POLICY "Admins manage coupons"
  ON public.coupons FOR ALL
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Admins read inventory logs"
  ON public.inventory_logs FOR SELECT
  TO authenticated
  USING (private.is_admin());

CREATE POLICY "Admins insert inventory logs"
  ON public.inventory_logs FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Admins insert product images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND private.is_admin());

CREATE POLICY "Admins update product images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images' AND private.is_admin())
  WITH CHECK (bucket_id = 'product-images' AND private.is_admin());

CREATE POLICY "Admins delete product images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images' AND private.is_admin());
