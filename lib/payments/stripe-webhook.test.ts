import { describe, expect, it } from "vitest";
import Stripe from "stripe";
import {
  actionForStripeEvent,
  claimStripeEvent,
  orderLookupFromStripeObject,
  verifyStripeWebhook,
} from "@/lib/payments/stripe-webhook";

const secret = "whsec_test_secret";
const stripe = new Stripe("sk_test_placeholder");

function signedEvent(type: string, object: Record<string, unknown>) {
  const payload = JSON.stringify({
    id: "evt_test_webhook",
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
  return { payload, signature };
}

describe("Stripe webhook signature", () => {
  it("accepts a valid Stripe signature", () => {
    const { payload, signature } = signedEvent("payment_intent.succeeded", {
      id: "pi_test",
      metadata: { order_id: "order-1" },
    });
    const event = verifyStripeWebhook(stripe, payload, signature, secret);
    expect(event.id).toBe("evt_test_webhook");
    expect(event.type).toBe("payment_intent.succeeded");
  });

  it("rejects a missing or invalid signature", () => {
    const { payload } = signedEvent("payment_intent.succeeded", { id: "pi_test" });
    expect(() => verifyStripeWebhook(stripe, payload, null, secret)).toThrow("Missing signature");
    expect(() => verifyStripeWebhook(stripe, payload, "t=1,v1=deadbeef", secret)).toThrow();
  });
});

describe("Stripe webhook idempotency", () => {
  it("processes an event once", () => {
    const seen = new Set<string>();
    expect(claimStripeEvent(seen, "evt_1")).toBe(true);
    expect(claimStripeEvent(seen, "evt_1")).toBe(false);
    expect(claimStripeEvent(seen, "evt_2")).toBe(true);
  });
});

describe("Stripe event routing", () => {
  it("maps payment events to order actions", () => {
    expect(actionForStripeEvent("payment_intent.succeeded")).toBe("confirm_paid");
    expect(actionForStripeEvent("payment_intent.payment_failed")).toBe("fail_and_restock");
    expect(actionForStripeEvent("charge.refunded")).toBe("refund_and_restock");
    expect(actionForStripeEvent("customer.created")).toBe("ignore");
  });

  it("finds the order from metadata or payment intent", () => {
    expect(
      orderLookupFromStripeObject("payment_intent.succeeded", {
        id: "pi_1",
        metadata: { order_id: "ord_1" },
      }),
    ).toEqual({ orderId: "ord_1", paymentIntentId: "pi_1" });

    expect(
      orderLookupFromStripeObject("charge.refunded", {
        id: "ch_1",
        payment_intent: "pi_2",
      }),
    ).toEqual({ orderId: undefined, paymentIntentId: "pi_2" });
  });
});
