CREATE TABLE public.store_settings (
  id integer PRIMARY KEY CHECK (id = 1),
  store_name text NOT NULL DEFAULT 'Nova',
  origin text NOT NULL DEFAULT 'Oakland, CA',
  support_email text NOT NULL DEFAULT 'support@nova.example',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read store settings"
  ON public.store_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins update store settings"
  ON public.store_settings FOR UPDATE
  TO authenticated
  USING (private.is_admin())
  WITH CHECK (private.is_admin());

CREATE POLICY "Admins insert store settings"
  ON public.store_settings FOR INSERT
  TO authenticated
  WITH CHECK (private.is_admin());

INSERT INTO public.store_settings (id, store_name, origin, support_email)
VALUES (1, 'Nova', 'Oakland, CA', 'support@nova.example')
ON CONFLICT (id) DO NOTHING;
