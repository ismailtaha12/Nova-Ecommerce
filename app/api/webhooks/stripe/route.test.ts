import { NextRequest } from "next/server";
import Stripe from "stripe";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { makeOrderRow } from "@/lib/test/fixtures";
import { createQueryBuilder } from "@/lib/test/supabase-mock";

const { createAdminClient, getStripe, notifyOrderEvent } = vi.hoisted(() => ({
  createAdminClient: vi.fn(),
  getStripe: vi.fn(),
  notifyOrderEvent: vi.fn(),
}));

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient,
  hasServiceRole: () => true,
}));

vi.mock("@/lib/payments/stripe", () => ({
  getStripe,
}));

vi.mock("@/lib/notifications", () => ({
  notifyOrderEvent,
}));

import { POST } from "@/app/api/webhooks/stripe/route";

const secret = "whsec_test_secret";
const stripe = new Stripe("sk_test_placeholder");

function signedRequest(type: string, object: Record<string, unknown>, eventId = "evt_test_1") {
  const payload = JSON.stringify({
    id: eventId,
    object: "event",
    api_version: "2024-06-20",
    created: 1_716_400_000,
    type,
    data: { object },
    livemode: false,
    pending_webhooks: 1,
    request: { id: null, idempotency_key: null },
  });
  const signature = stripe.webhooks.generateTestHeaderString({ payload, secret });
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers: { "stripe-signature": signature },
    body: payload,
  });
}

describe("POST /api/webhooks/stripe", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
    getStripe.mockReturnValue(stripe);
    notifyOrderEvent.mockResolvedValue(undefined);
  });

  it("rejects a missing or invalid signature", async () => {
    const unsigned = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      body: "{}",
    });
    expect((await POST(unsigned)).status).toBe(400);

    const bad = new NextRequest("http://localhost/api/webhooks/stripe", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=deadbeef" },
      body: "{}",
    });
    expect((await POST(bad)).status).toBe(400);
  });

  it("is idempotent when the event id was already stored", async () => {
    const rpc = vi.fn();
    createAdminClient.mockReturnValue({
      rpc,
      from: vi.fn((table: string) => {
        if (table === "stripe_events") {
          return createQueryBuilder({ error: { message: "duplicate key" } });
        }
        return createQueryBuilder();
      }),
    });

    const response = await POST(
      signedRequest("payment_intent.succeeded", {
        id: "pi_1",
        metadata: { order_id: makeOrderRow().id },
      }),
    );
    expect(response.status).toBe(200);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("marks the order paid and notifies on payment_intent.succeeded", async () => {
    const row = makeOrderRow();
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    createAdminClient.mockReturnValue({
      rpc,
      from: vi.fn((table: string) => {
        if (table === "stripe_events") return createQueryBuilder();
        return createQueryBuilder({ data: row });
      }),
    });

    const response = await POST(
      signedRequest("payment_intent.succeeded", {
        id: "pi_1",
        metadata: { order_id: row.id },
      }),
    );
    expect(response.status).toBe(200);
    expect(rpc).toHaveBeenCalledWith("confirm_order_paid", { p_order_id: row.id });
    expect(notifyOrderEvent).toHaveBeenCalledWith(
      expect.objectContaining({ paymentStatus: "paid" }),
      "payment_confirmation",
    );
  });

  it("restocks on payment_intent.payment_failed", async () => {
    const row = makeOrderRow();
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    const orders = createQueryBuilder({ data: row });
    createAdminClient.mockReturnValue({
      rpc,
      from: vi.fn((table: string) => (table === "stripe_events" ? createQueryBuilder() : orders)),
    });

    await POST(
      signedRequest("payment_intent.payment_failed", {
        id: "pi_1",
        metadata: { order_id: row.id },
      }),
    );
    expect(rpc).toHaveBeenCalledWith("restock_order", { p_order_id: row.id });
    expect(orders.update).toHaveBeenCalled();
  });

  it("restocks on charge.refunded", async () => {
    const row = makeOrderRow({ payment_status: "paid", stripe_payment_intent_id: "pi_1" });
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    createAdminClient.mockReturnValue({
      rpc,
      from: vi.fn((table: string) =>
        table === "stripe_events" ? createQueryBuilder() : createQueryBuilder({ data: row }),
      ),
    });

    await POST(
      signedRequest("charge.refunded", {
        id: "ch_1",
        payment_intent: "pi_1",
      }),
    );
    expect(rpc).toHaveBeenCalledWith("restock_order", { p_order_id: row.id });
  });

  it("deletes the event id so Stripe can retry if processing throws", async () => {
    const row = makeOrderRow();
    const events = createQueryBuilder();
    const rpc = vi.fn(async () => {
      throw new Error("db down");
    });
    createAdminClient.mockReturnValue({
      rpc,
      from: vi.fn((table: string) => (table === "stripe_events" ? events : createQueryBuilder({ data: row }))),
    });

    const response = await POST(
      signedRequest("payment_intent.succeeded", {
        id: "pi_1",
        metadata: { order_id: row.id },
      }),
    );
    expect(response.status).toBe(500);
    expect(events.delete).toHaveBeenCalled();
  });
});
