import Stripe from "stripe";

let stripe: Stripe | null = null;

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripe) {
    stripe = new Stripe(key);
  }
  return stripe;
}

export function stripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";
}

export function amountToCents(amount: number): number {
  return Math.round(amount * 100);
}

export async function createPaymentIntent(input: {
  amount: number;
  orderId: string;
  orderNumber: string;
  email: string;
}) {
  const client = getStripe();
  if (!client) return null;
  const cents = amountToCents(input.amount);
  return client.paymentIntents.create({
    amount: cents,
    currency: "usd",
    receipt_email: input.email || undefined,
    metadata: {
      order_id: input.orderId,
      order_number: input.orderNumber,
    },
    automatic_payment_methods: { enabled: true },
  });
}

export async function refundPayment(paymentIntentId: string) {
  const client = getStripe();
  if (!client) throw new Error("Stripe is not configured.");
  return client.refunds.create({ payment_intent: paymentIntentId });
}
