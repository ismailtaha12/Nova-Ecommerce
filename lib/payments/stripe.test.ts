import { describe, expect, it } from "vitest";
import { amountToCents } from "@/lib/payments/stripe";

describe("amountToCents", () => {
  it("converts dollars to integer cents for Stripe", () => {
    expect(amountToCents(19.99)).toBe(1999);
    expect(amountToCents(120.5)).toBe(12050);
    expect(amountToCents(0)).toBe(0);
  });

  it("rounds half-cents instead of truncating", () => {
    expect(amountToCents(10.005)).toBe(1001);
  });
});
