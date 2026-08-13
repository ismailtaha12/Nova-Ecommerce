"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data-access/auth";
import type { Json } from "@/lib/supabase/database.types";

const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  line1: z.string().trim().min(1, "Street address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  zip: z.string().trim().min(1, "ZIP is required"),
  country: z.string().trim().min(1).default("United States"),
});

const placeOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variant: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Cart is empty"),
  shippingAddress: shippingAddressSchema,
  delivery: z.enum(["standard", "express", "overnight"]),
  saveAddress: z.boolean().optional(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;

export async function placeOrderAction(input: unknown) {
  const user = await requireUser();
  const parsed = placeOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid checkout" };
  }

  const supabase = await createClient();
  const pItems = parsed.data.items.map((item) => ({
    product_id: item.productId,
    variant: item.variant,
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
  });

  if (error) return { error: error.message };
  if (!orderId) return { error: "Order could not be placed." };

  if (parsed.data.saveAddress) {
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

  revalidatePath("/products", "layout");
  revalidatePath("/account", "layout");
  revalidatePath("/admin", "layout");
  revalidatePath("/");

  return { orderId };
}
