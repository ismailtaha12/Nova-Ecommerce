import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultStoreSettings } from "@/lib/commerce";
import { makeOrderRow, validPlaceOrderInput } from "@/lib/test/fixtures";
import { createMockSupabase, createQueryBuilder } from "@/lib/test/supabase-mock";

const {
  createClient,
  createAdminClient,
  hasServiceRole,
  getSessionUser,
  getStoreSettings,
  getCouponByCode,
  createPaymentIntent,
  validateShippingAddress,
  quoteShippingRates,
  notifyOrderEvent,
} = vi.hoisted(() => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
  hasServiceRole: vi.fn(() => true),
  getSessionUser: vi.fn(),
  getStoreSettings: vi.fn(),
  getCouponByCode: vi.fn(),
  createPaymentIntent: vi.fn(),
  validateShippingAddress: vi.fn(),
  quoteShippingRates: vi.fn(),
  notifyOrderEvent: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient, hasServiceRole }));
vi.mock("@/lib/data-access/auth", () => ({ getSessionUser }));
vi.mock("@/lib/data-access/admin", () => ({ getStoreSettings }));
vi.mock("@/lib/data-access/products", () => ({ getCouponByCode }));
vi.mock("@/lib/payments/stripe", () => ({ createPaymentIntent }));
vi.mock("@/lib/shipping/shippo", () => ({ validateShippingAddress, quoteShippingRates }));
vi.mock("@/lib/notifications", () => ({ notifyOrderEvent }));

import {
  cancelPendingOrderAction,
  placeOrderAction,
  previewCouponAction,
  trackOrderAction,
} from "@/lib/actions/checkout";

describe("previewCouponAction", () => {
  it("rejects unknown or unusable codes", async () => {
    getCouponByCode.mockResolvedValue(null);
    expect(await previewCouponAction("NOPE", 50)).toEqual({ error: "Invalid coupon code" });

    getCouponByCode.mockResolvedValue({
      id: "1",
      code: "SAVE25",
      description: "$25",
      type: "fixed",
      amount: 25,
      minSubtotal: 100,
      maxUses: null,
      uses: 0,
      active: true,
    });
    expect(await previewCouponAction("SAVE25", 50)).toEqual({
      error: "This coupon cannot be applied to your cart.",
    });
  });

  it("returns a preview discount without placing an order", async () => {
    getCouponByCode.mockResolvedValue({
      id: "1",
      code: "WELCOME10",
      description: "10%",
      type: "percent",
      amount: 10,
      minSubtotal: 0,
      maxUses: null,
      uses: 0,
      active: true,
    });
    const result = await previewCouponAction("WELCOME10", 200);
    expect(result).toEqual({
      coupon: expect.objectContaining({ code: "WELCOME10" }),
      discount: 20,
    });
  });
});

describe("placeOrderAction", () => {
  beforeEach(() => {
    getSessionUser.mockResolvedValue(null);
    validateShippingAddress.mockResolvedValue({ ok: true, address: validPlaceOrderInput().shippingAddress });
    getStoreSettings.mockResolvedValue(defaultStoreSettings);
    notifyOrderEvent.mockResolvedValue(undefined);
  });

  it("returns a validation error before touching the database", async () => {
    const supabase = createMockSupabase();
    createClient.mockResolvedValue(supabase);
    const result = await placeOrderAction({ ...validPlaceOrderInput(), items: [] });
    expect(result).toEqual({ error: "Cart is empty" });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("does not place an order when the address is invalid", async () => {
    validateShippingAddress.mockResolvedValue({ ok: false, error: "Enter a valid ZIP / postal code." });
    const supabase = createMockSupabase();
    createClient.mockResolvedValue(supabase);
    const result = await placeOrderAction(validPlaceOrderInput());
    expect(result).toEqual({ error: "Enter a valid ZIP / postal code." });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });

  it("surfaces place_order stock errors", async () => {
    const supabase = createMockSupabase({
      rpc: (name) =>
        name === "place_order"
          ? { data: null, error: { message: "Insufficient stock for Pulse" } }
          : { data: null, error: null },
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(supabase);
    const result = await placeOrderAction(validPlaceOrderInput());
    expect(result).toEqual({ error: "Insufficient stock for Pulse" });
  });

  it("creates a PaymentIntent from the database total, not the cart", async () => {
    const row = makeOrderRow({ total: 120.5 });
    const supabase = createMockSupabase({
      rpc: (name) =>
        name === "place_order"
          ? { data: row.id, error: null }
          : { data: null, error: null },
      from: () => createQueryBuilder({ data: row }),
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(supabase);
    hasServiceRole.mockReturnValue(true);
    createPaymentIntent.mockResolvedValue({
      id: "pi_123",
      client_secret: "pi_123_secret",
    });

    const result = await placeOrderAction(validPlaceOrderInput());
    expect(createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 120.5, orderId: row.id, orderNumber: row.number }),
    );
    expect(result).toEqual({
      orderId: row.id,
      orderNumber: row.number,
      clientSecret: "pi_123_secret",
      demoPaid: false,
    });
    expect(supabase.rpc).not.toHaveBeenCalledWith("confirm_order_paid", expect.anything());
  });

  it("confirms payment in demo mode when Stripe is not configured", async () => {
    const row = makeOrderRow();
    const supabase = createMockSupabase({
      rpc: (name) =>
        name === "place_order"
          ? { data: row.id, error: null }
          : { data: null, error: null },
      from: () => createQueryBuilder({ data: row }),
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(supabase);
    hasServiceRole.mockReturnValue(true);
    createPaymentIntent.mockResolvedValue(null);
    getStoreSettings.mockResolvedValue({ ...defaultStoreSettings, demoMode: true });

    const result = await placeOrderAction(validPlaceOrderInput());
    expect(supabase.rpc).toHaveBeenCalledWith("confirm_order_paid", { p_order_id: row.id });
    expect(notifyOrderEvent).toHaveBeenCalled();
    expect(result).toEqual({
      orderId: row.id,
      orderNumber: row.number,
      clientSecret: null,
      demoPaid: true,
    });
  });
});

describe("cancelPendingOrderAction", () => {
  it("restocks only pending orders", async () => {
    const pendingClient = createMockSupabase({
      from: () => createQueryBuilder({ data: { id: "ord_1", payment_status: "pending" } }),
    });
    createClient.mockResolvedValue(pendingClient);
    await cancelPendingOrderAction("ord_1");
    expect(pendingClient.rpc).toHaveBeenCalledWith("restock_order", { p_order_id: "ord_1" });

    const paidClient = createMockSupabase({
      from: () => createQueryBuilder({ data: { id: "ord_2", payment_status: "paid" } }),
    });
    createClient.mockResolvedValue(paidClient);
    await cancelPendingOrderAction("ord_2");
    expect(paidClient.rpc).not.toHaveBeenCalled();
  });
});

describe("trackOrderAction", () => {
  it("hides an order when the email does not match", async () => {
    const row = makeOrderRow({ guest_email: "ada@example.com" });
    const supabase = createMockSupabase({
      from: () => createQueryBuilder({ data: row }),
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(supabase);
    hasServiceRole.mockReturnValue(true);
    getSessionUser.mockResolvedValue(null);

    const result = await trackOrderAction("NV-00001", "stranger@example.com");
    expect(result).toEqual({ error: "Order not found." });
  });

  it("returns the order when the guest email matches", async () => {
    const row = makeOrderRow({ guest_email: "ada@example.com" });
    const supabase = createMockSupabase({
      from: () => createQueryBuilder({ data: row }),
    });
    createClient.mockResolvedValue(supabase);
    createAdminClient.mockReturnValue(supabase);
    hasServiceRole.mockReturnValue(true);
    getSessionUser.mockResolvedValue(null);

    const result = await trackOrderAction("nv-00001", "ADA@example.com");
    expect("order" in result && result.order?.number).toBe("NV-00001");
  });
});
