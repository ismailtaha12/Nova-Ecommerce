import { describe, expect, it } from "vitest";
import {
  afterPlaceOrder,
  applyCouponDiscount,
  applyPaymentWebhook,
  computeTax,
  computeTotals,
  fallbackShipping,
  variantPrice,
} from "@/lib/commerce";
import type { Coupon, StoreSettings } from "@/lib/types";

const coupon: Coupon = {
  id: "1",
  code: "WELCOME10",
  description: "10%",
  type: "percent",
  amount: 10,
  minSubtotal: 0,
  maxUses: null,
  uses: 0,
  active: true,
};

const settings: Pick<
  StoreSettings,
  | "freeShippingThreshold"
  | "fallbackStandardShipping"
  | "fallbackExpressShipping"
  | "fallbackOvernightShipping"
> = {
  freeShippingThreshold: 75,
  fallbackStandardShipping: 12,
  fallbackExpressShipping: 18,
  fallbackOvernightShipping: 32,
};

describe("applyCouponDiscount", () => {
  it("applies percent discounts", () => {
    expect(applyCouponDiscount(200, coupon)).toBe(20);
  });

  it("caps fixed discounts at subtotal", () => {
    const fixed: Coupon = { ...coupon, type: "fixed", amount: 50 };
    expect(applyCouponDiscount(30, fixed)).toBe(30);
  });

  it("rejects below minimum", () => {
    const min: Coupon = { ...coupon, minSubtotal: 500 };
    expect(applyCouponDiscount(100, min)).toBe(0);
  });

  it("rejects inactive, exhausted, not-yet-started, and expired coupons", () => {
    expect(applyCouponDiscount(200, { ...coupon, active: false })).toBe(0);
    expect(applyCouponDiscount(200, { ...coupon, maxUses: 1, uses: 1 })).toBe(0);
    expect(applyCouponDiscount(200, { ...coupon, startsAt: "2999-01-01T00:00:00.000Z" })).toBe(0);
    expect(applyCouponDiscount(200, { ...coupon, expiresAt: "2000-01-01T00:00:00.000Z" })).toBe(0);
    expect(applyCouponDiscount(200, null)).toBe(0);
  });
});

describe("shipping and tax", () => {
  it("gives free standard shipping above threshold", () => {
    expect(fallbackShipping(80, "standard", settings)).toBe(0);
    expect(fallbackShipping(20, "standard", settings)).toBe(12);
    expect(fallbackShipping(20, "express", settings)).toBe(18);
  });

  it("computes totals", () => {
    const totals = computeTotals({
      subtotal: 100,
      shipping: 12,
      taxRate: 0.1,
      coupon,
    });
    expect(totals.discount).toBe(10);
    expect(totals.tax).toBe(computeTax(90, 0.1));
    expect(totals.total).toBe(111);
  });
});

describe("place_order payment lifecycle", () => {
  it("creates a pending order with reserved stock", () => {
    expect(afterPlaceOrder()).toEqual({ paymentStatus: "pending", inventory: "reserved" });
  });

  it("consumes stock on payment success", () => {
    expect(applyPaymentWebhook(afterPlaceOrder(), "payment_intent.succeeded")).toEqual({
      paymentStatus: "paid",
      inventory: "consumed",
    });
  });

  it("restocks when payment fails or a paid order is refunded", () => {
    expect(applyPaymentWebhook(afterPlaceOrder(), "payment_intent.payment_failed")).toEqual({
      paymentStatus: "failed",
      inventory: "restocked",
    });
    expect(
      applyPaymentWebhook(
        { paymentStatus: "paid", inventory: "consumed" },
        "charge.refunded",
      ),
    ).toEqual({
      paymentStatus: "refunded",
      inventory: "restocked",
    });
  });
});

describe("variantPrice", () => {
  it("inherits the product price when the variant override is null", () => {
    expect(variantPrice(199, null)).toBe(199);
    expect(variantPrice(199, 249)).toBe(249);
  });
});
