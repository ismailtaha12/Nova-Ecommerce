import Stripe from "stripe";

export type StripeOrderAction = "confirm_paid" | "fail_and_restock" | "refund_and_restock" | "ignore";

export function actionForStripeEvent(type: string): StripeOrderAction {
  if (type === "payment_intent.succeeded" || type === "charge.succeeded") return "confirm_paid";
  if (type === "payment_intent.payment_failed") return "fail_and_restock";
  if (type === "charge.refunded") return "refund_and_restock";
  return "ignore";
}

export function orderLookupFromStripeObject(
  eventType: string,
  object: { id?: string; metadata?: { order_id?: string }; payment_intent?: string },
) {
  const paymentIntentId = eventType.startsWith("payment_intent")
    ? object.id
    : typeof object.payment_intent === "string"
      ? object.payment_intent
      : undefined;
  return {
    orderId: object.metadata?.order_id,
    paymentIntentId,
  };
}

export function verifyStripeWebhook(
  stripe: Stripe,
  payload: string,
  signature: string | null,
  secret: string,
) {
  if (!signature) throw new Error("Missing signature");
  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/** Returns true when this event id has not been processed yet. */
export function claimStripeEvent(seenIds: Set<string>, eventId: string): boolean {
  if (seenIds.has(eventId)) return false;
  seenIds.add(eventId);
  return true;
}
