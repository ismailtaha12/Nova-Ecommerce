import type { Coupon, DeliveryMethod, StoreSettings } from "@/lib/types";

export function applyCouponDiscount(subtotal: number, coupon: Coupon | null): number {
  if (!coupon) return 0;
  if (!coupon.active) return 0;
  if (subtotal < coupon.minSubtotal) return 0;
  const now = Date.now();
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) return 0;
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) return 0;
  if (coupon.maxUses != null && coupon.uses >= coupon.maxUses) return 0;
  const raw =
    coupon.type === "percent"
      ? Math.round(subtotal * (coupon.amount / 100) * 100) / 100
      : coupon.amount;
  return Math.min(Math.max(raw, 0), subtotal);
}

export function fallbackShipping(
  subtotal: number,
  delivery: DeliveryMethod,
  settings: Pick<
    StoreSettings,
    | "freeShippingThreshold"
    | "fallbackStandardShipping"
    | "fallbackExpressShipping"
    | "fallbackOvernightShipping"
  >,
): number {
  if (delivery === "express") return settings.fallbackExpressShipping;
  if (delivery === "overnight") return settings.fallbackOvernightShipping;
  if (subtotal >= settings.freeShippingThreshold) return 0;
  return settings.fallbackStandardShipping;
}

export function computeTax(taxable: number, taxRate: number): number {
  return Math.round(Math.max(taxable, 0) * taxRate * 100) / 100;
}

export function computeTotals(input: {
  subtotal: number;
  shipping: number;
  taxRate: number;
  coupon: Coupon | null;
}) {
  const discount = applyCouponDiscount(input.subtotal, input.coupon);
  const tax = computeTax(input.subtotal - discount, input.taxRate);
  const total = Math.round((input.subtotal - discount + input.shipping + tax) * 100) / 100;
  return { discount, tax, total };
}

export function variantPrice(basePrice: number, override: number | null | undefined): number {
  return override != null && Number.isFinite(override) ? Number(override) : basePrice;
}

export type CheckoutInventory = "reserved" | "consumed" | "restocked";

export type CheckoutPaymentState = {
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  inventory: CheckoutInventory;
};

export function afterPlaceOrder(): CheckoutPaymentState {
  return { paymentStatus: "pending", inventory: "reserved" };
}

export function applyPaymentWebhook(
  state: CheckoutPaymentState,
  event: "payment_intent.succeeded" | "payment_intent.payment_failed" | "charge.refunded",
): CheckoutPaymentState {
  if (event === "payment_intent.succeeded") {
    return { paymentStatus: "paid", inventory: "consumed" };
  }
  if (event === "payment_intent.payment_failed") {
    return { paymentStatus: "failed", inventory: "restocked" };
  }
  return { paymentStatus: "refunded", inventory: "restocked" };
}

export const defaultStoreSettings: StoreSettings = {
  storeName: "Nova",
  origin: "Oakland, CA",
  supportEmail: "support@nova.example",
  taxRate: 0.085,
  freeShippingThreshold: 75,
  fallbackStandardShipping: 12,
  fallbackExpressShipping: 18,
  fallbackOvernightShipping: 32,
  originName: "Nova",
  originLine1: "100 Market Street",
  originCity: "Oakland",
  originState: "CA",
  originZip: "94607",
  originCountry: "US",
  demoMode: true,
  updatedAt: new Date(0).toISOString(),
};
