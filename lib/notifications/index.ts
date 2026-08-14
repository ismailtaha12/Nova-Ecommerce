import { Resend } from "resend";
import Twilio from "twilio";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Order } from "@/lib/types";

type Channel = "email" | "sms";
type EventType =
  | "order_confirmation"
  | "payment_confirmation"
  | "status_update"
  | "shipment"
  | "delivered";

function resendClient() {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

function twilioClient() {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  return sid && token ? Twilio(sid, token) : null;
}

async function logNotification(input: {
  orderId?: string;
  channel: Channel;
  eventType: EventType;
  recipient: string;
  status: string;
  error?: string;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from("notification_logs").insert({
      order_id: input.orderId ?? null,
      channel: input.channel,
      event_type: input.eventType,
      recipient: input.recipient,
      status: input.status,
      error: input.error ?? null,
    });
  } catch {
    // Logging must not break checkout.
  }
}

export async function sendOrderEmail(input: {
  to: string;
  subject: string;
  html: string;
  orderId?: string;
  eventType: EventType;
}) {
  const client = resendClient();
  if (!client || !input.to) {
    await logNotification({
      orderId: input.orderId,
      channel: "email",
      eventType: input.eventType,
      recipient: input.to || "(missing)",
      status: "skipped",
      error: "RESEND_API_KEY not configured",
    });
    return;
  }
  try {
    await client.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Nova <orders@nova.example>",
      to: input.to,
      subject: input.subject,
      html: input.html,
    });
    await logNotification({
      orderId: input.orderId,
      channel: "email",
      eventType: input.eventType,
      recipient: input.to,
      status: "sent",
    });
  } catch (error) {
    await logNotification({
      orderId: input.orderId,
      channel: "email",
      eventType: input.eventType,
      recipient: input.to,
      status: "error",
      error: error instanceof Error ? error.message : "Email failed",
    });
  }
}

export async function sendOrderSms(input: {
  to: string;
  body: string;
  orderId?: string;
  eventType: EventType;
}) {
  const client = twilioClient();
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!client || !from || !input.to) {
    await logNotification({
      orderId: input.orderId,
      channel: "sms",
      eventType: input.eventType,
      recipient: input.to || "(missing)",
      status: "skipped",
      error: "Twilio is not configured",
    });
    return;
  }
  try {
    await client.messages.create({ to: input.to, from, body: input.body });
    await logNotification({
      orderId: input.orderId,
      channel: "sms",
      eventType: input.eventType,
      recipient: input.to,
      status: "sent",
    });
  } catch (error) {
    await logNotification({
      orderId: input.orderId,
      channel: "sms",
      eventType: input.eventType,
      recipient: input.to,
      status: "error",
      error: error instanceof Error ? error.message : "SMS failed",
    });
  }
}

export async function notifyOrderEvent(order: Order, eventType: EventType) {
  const email = order.customerEmail;
  const phone = order.guestPhone;
  const tracking = order.trackingUrl
    ? `<p>Track shipment: <a href="${order.trackingUrl}">${order.trackingNumber ?? "tracking"}</a></p>`
    : "";
  const subjects: Record<EventType, string> = {
    order_confirmation: `Order ${order.number} received`,
    payment_confirmation: `Payment received for ${order.number}`,
    status_update: `Order ${order.number} updated`,
    shipment: `Order ${order.number} shipped`,
    delivered: `Order ${order.number} delivered`,
  };
  if (email) {
    await sendOrderEmail({
      to: email,
      orderId: order.id,
      eventType,
      subject: subjects[eventType],
      html: `<p>Hi ${order.customerName || "there"},</p><p>Your Nova order <strong>${order.number}</strong> is now <strong>${order.status}</strong>.</p>${tracking}<p>Total ${order.total.toFixed(2)} USD.</p>`,
    });
  }
  if ((eventType === "shipment" || eventType === "status_update" || eventType === "delivered") && phone) {
    await sendOrderSms({
      to: phone,
      orderId: order.id,
      eventType,
      body: `Nova ${order.number}: ${order.status}${order.trackingNumber ? ` Tracking ${order.trackingNumber}` : ""}`,
    });
  }
}
