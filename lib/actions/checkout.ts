"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/data-access/auth";
import { getStoreSettings } from "@/lib/data-access/admin";
import { getCouponByCode } from "@/lib/data-access/products";
import { mapOrder, type OrderRow } from "@/lib/data-access/mappers";
import { createPaymentIntent } from "@/lib/payments/stripe";
import { quoteShippingRates, validateShippingAddress } from "@/lib/shipping/shippo";
import { applyCouponDiscount } from "@/lib/commerce";
import {
  placeOrderSchema,
  shippingAddressSchema,
  trackOrderSchema,
  type PlaceOrderInput,
} from "@/lib/checkout/schemas";
import type { Json } from "@/lib/supabase/database.types";
import type { Coupon, ShippingRateOption } from "@/lib/types";

export type { PlaceOrderInput };

export async function validateAddressAction(input: unknown) {
  const parsed = shippingAddressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }
  return validateShippingAddress(parsed.data);
}

export async function previewCouponAction(
  code: string,
  subtotal: number,
): Promise<{ error: string } | { coupon: Coupon; discount: number }> {
  const coupon = await getCouponByCode(code);
  if (!coupon) return { error: "Invalid coupon code" };
  const discount = applyCouponDiscount(subtotal, coupon);
  if (discount <= 0) return { error: "This coupon cannot be applied to your cart." };
  return { coupon, discount };
}

export async function quoteRatesAction(
  input: unknown,
): Promise<{ error: string } | { rates: ShippingRateOption[] }> {
  const parsed = z
    .object({
      address: shippingAddressSchema,
      subtotal: z.number().nonnegative(),
    })
    .safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid quote request" };
  }
  const settings = await getStoreSettings();
  const rates = await quoteShippingRates({
    address: parsed.data.address,
    subtotal: parsed.data.subtotal,
    settings,
  });
  return { rates };
}

export async function placeOrderAction(
  input: unknown,
): Promise<
  | { error: string }
  | { orderId: string; orderNumber: string; clientSecret: string | null; demoPaid: boolean }
> {
  const user = await getSessionUser();
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid checkout" };
  }

  const addressCheck = await validateShippingAddress(parsed.data.shippingAddress);
  if (!addressCheck.ok) return { error: addressCheck.error };

  const supabase = await createClient();
  const pItems = parsed.data.items.map((item) => ({
    product_id: item.productId,
    variant: item.variant,
    variant_id: item.variantId ?? "",
    quantity: item.quantity,
  }));
  const pShippingAddress = {
    name: parsed.data.shippingAddress.name,
    line1: parsed.data.shippingAddress.line1,
    line2: parsed.data.shippingAddress.line2 ?? "",
    city: parsed.data.shippingAddress.city,
    state: parsed.data.shippingAddress.state,
    zip: parsed.data.shippingAddress.zip,
    country: parsed.data.shippingAddress.country,
  };

  const { data: orderId, error } = await supabase.rpc("place_order", {
    p_items: pItems as Json,
    p_shipping_address: pShippingAddress as Json,
    p_delivery: parsed.data.delivery,
    p_coupon_code: parsed.data.couponCode || null,
    p_guest: {
      email: parsed.data.email,
      name: parsed.data.name,
      phone: parsed.data.phone ?? "",
    } as Json,
    p_shipping_amount: parsed.data.shippingAmount ?? null,
    p_shipping_meta: {
      rate_id: parsed.data.shippingRateId ?? "",
      carrier: parsed.data.carrier ?? "",
      service: parsed.data.shippingService ?? "",
    } as Json,
  });

  if (error) return { error: error.message };
  if (!orderId) return { error: "Order could not be placed." };

  if (parsed.data.saveAddress && user) {
    await supabase.from("addresses").insert({
      user_id: user.id,
      label: "Shipping",
      name: parsed.data.shippingAddress.name,
      line1: parsed.data.shippingAddress.line1,
      line2: parsed.data.shippingAddress.line2 || null,
      city: parsed.data.shippingAddress.city,
      state: parsed.data.shippingAddress.state,
      zip: parsed.data.shippingAddress.zip,
      country: parsed.data.shippingAddress.country,
    });
  }

  const reader = hasServiceRole() ? createAdminClient() : supabase;
  const { data: orderRow, error: orderError } = await reader
    .from("orders")
    .select("*, order_items(*), order_events(*)")
    .eq("id", orderId)
    .maybeSingle();
  if (orderError || !orderRow) return { error: orderError?.message ?? "Order created but could not be loaded." };
  const order = mapOrder(orderRow as OrderRow);

  const intent = await createPaymentIntent({
    amount: order.total,
    orderId: order.id,
    orderNumber: order.number,
    email: parsed.data.email,
  });

  if (intent) {
    await reader
      .from("orders")
      .update({ stripe_payment_intent_id: intent.id })
      .eq("id", order.id);
  } else {
    const settings = await getStoreSettings();
    if (settings.demoMode) {
      await reader.rpc("confirm_order_paid", { p_order_id: order.id });
      const { notifyOrderEvent } = await import("@/lib/notifications");
      await notifyOrderEvent(
        { ...order, paymentStatus: "paid", customerEmail: parsed.data.email, customerName: parsed.data.name, guestPhone: parsed.data.phone },
        "order_confirmation",
      );
    }
  }

  revalidatePath("/products", "layout");
  revalidatePath("/account", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/");

  return {
    orderId: order.id,
    orderNumber: order.number,
    clientSecret: intent?.client_secret ?? null,
    demoPaid: !intent,
  };
}

export async function cancelPendingOrderAction(orderId: string) {
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("id, payment_status")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.payment_status !== "pending") return { ok: true as const };
  await supabase.from("orders").update({ status: "cancelled", payment_status: "failed" }).eq("id", order.id);
  await supabase.rpc("restock_order", { p_order_id: order.id });
  return { ok: true as const };
}

export async function trackOrderAction(number: string, email: string) {
  const parsed = trackOrderSchema.safeParse({ number, email });
  if (!parsed.success) return { error: "Enter the order number and email." };

  const supabase = await createClient();
  const reader = hasServiceRole() ? createAdminClient() : supabase;
  const { data, error } = await reader
    .from("orders")
    .select("*, order_items(*), order_events(*)")
    .eq("number", parsed.data.number.toUpperCase())
    .maybeSingle();
  if (error) return { error: error.message };
  if (!data) return { error: "Order not found." };

  const order = mapOrder(data as OrderRow);
  const matches =
    order.customerEmail?.toLowerCase() === parsed.data.email.toLowerCase() ||
    data.guest_email?.toLowerCase() === parsed.data.email.toLowerCase();
  const user = await getSessionUser();
  if (!matches && user?.id !== order.userId && user?.role !== "admin") {
    return { error: "Order not found." };
  }
  return { order };
}
