import { describe, expect, it } from "vitest";
import { placeOrderSchema, shippingAddressSchema, trackOrderSchema } from "@/lib/checkout/schemas";
import { validPlaceOrderInput } from "@/lib/test/fixtures";

describe("shippingAddressSchema", () => {
  it("accepts a complete US address and defaults country", () => {
    const parsed = shippingAddressSchema.parse({
      name: "Ada",
      line1: "100 Market",
      city: "Oakland",
      state: "CA",
      zip: "94607",
    });
    expect(parsed.country).toBe("United States");
  });

  it("rejects a missing street", () => {
    const parsed = shippingAddressSchema.safeParse({
      name: "Ada",
      line1: "  ",
      city: "Oakland",
      state: "CA",
      zip: "94607",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("placeOrderSchema", () => {
  it("accepts a guest checkout payload without client prices", () => {
    const parsed = placeOrderSchema.parse(validPlaceOrderInput());
    expect(parsed.items[0]).not.toHaveProperty("price");
    expect(parsed.email).toBe("ada@example.com");
  });

  it("rejects an empty cart", () => {
    const parsed = placeOrderSchema.safeParse({ ...validPlaceOrderInput(), items: [] });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues[0]?.message).toBe("Cart is empty");
    }
  });

  it("rejects a non-positive quantity", () => {
    const parsed = placeOrderSchema.safeParse({
      ...validPlaceOrderInput(),
      items: [{ productId: "pulse", variant: "Black", quantity: 0 }],
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const parsed = placeOrderSchema.safeParse({ ...validPlaceOrderInput(), email: "not-an-email" });
    expect(parsed.success).toBe(false);
  });
});

describe("trackOrderSchema", () => {
  it("uppercases are the caller's job; schema only requires length and email", () => {
    expect(trackOrderSchema.parse({ number: "NV-1", email: "ada@example.com" }).number).toBe("NV-1");
    expect(trackOrderSchema.safeParse({ number: "NV", email: "ada@example.com" }).success).toBe(false);
  });
});
