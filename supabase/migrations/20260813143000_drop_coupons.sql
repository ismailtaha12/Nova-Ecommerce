-- Remove coupons from the platform. Checkout never applied them.
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TYPE IF EXISTS public.coupon_status;
