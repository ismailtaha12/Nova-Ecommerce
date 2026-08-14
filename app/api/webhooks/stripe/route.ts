import { NextRequest } from "next/server";
import { getStripe } from "@/lib/payments/stripe";
import {
  actionForStripeEvent,
  orderLookupFromStripeObject,
  verifyStripeWebhook,
} from "@/lib/payments/stripe-webhook";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapOrder, type OrderRow } from "@/lib/data-access/mappers";
import { notifyOrderEvent } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return new Response("Stripe is not configured", { status: 501 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event;
  try {
    event = verifyStripeWebhook(stripe, body, signature, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = createAdminClient();
  const { error: insertError } = await supabase.from("stripe_events").insert({
    id: event.id,
    type: event.type,
  });
  if (insertError) {
    return Response.json({ received: true });
  }

  try {
    const object = event.data.object as {
      id?: string;
      metadata?: { order_id?: string };
      payment_intent?: string;
    };
    const { orderId, paymentIntentId } = orderLookupFromStripeObject(event.type, object);

    let orderQuery = supabase.from("orders").select("*, order_items(*), order_events(*)");
    if (orderId) orderQuery = orderQuery.eq("id", orderId);
    else if (paymentIntentId) orderQuery = orderQuery.eq("stripe_payment_intent_id", paymentIntentId);
    else return Response.json({ received: true });

    const { data: row } = await orderQuery.maybeSingle();
    if (!row) return Response.json({ received: true });

    const action = actionForStripeEvent(event.type);
    if (action === "confirm_paid") {
      await supabase.rpc("confirm_order_paid", { p_order_id: row.id });
      const { data: paid } = await supabase
        .from("orders")
        .select("*, order_items(*), order_events(*)")
        .eq("id", row.id)
        .maybeSingle();
      const order = mapOrder((paid ?? row) as OrderRow);
      await notifyOrderEvent({ ...order, paymentStatus: "paid" }, "payment_confirmation");
    }

    if (action === "fail_and_restock") {
      await supabase
        .from("orders")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("id", row.id);
      await supabase.rpc("restock_order", { p_order_id: row.id });
    }

    if (action === "refund_and_restock") {
      await supabase.from("orders").update({ payment_status: "refunded", status: "cancelled" }).eq("id", row.id);
      await supabase.rpc("restock_order", { p_order_id: row.id });
    }

    return Response.json({ received: true });
  } catch {
    await supabase.from("stripe_events").delete().eq("id", event.id);
    return new Response("Webhook processing failed", { status: 500 });
  }
}
