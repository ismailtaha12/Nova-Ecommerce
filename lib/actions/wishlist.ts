"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data-access/auth";

const productIdSchema = z.string().min(1, "Product is required");

export async function toggleWishlistAction(productId: unknown) {
  const user = await requireUser();
  const parsed = productIdSchema.safeParse(productId);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }

  const supabase = await createClient();
  const { data: existing, error: lookupError } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id)
    .eq("product_id", parsed.data)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };

  if (existing) {
    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("user_id", user.id)
      .eq("product_id", parsed.data);

    if (error) return { error: error.message };

    revalidatePath("/account/wishlist");
    revalidatePath("/products", "layout");
    return { wished: false };
  }

  const { error } = await supabase.from("wishlist_items").insert({
    user_id: user.id,
    product_id: parsed.data,
  });

  if (error) return { error: error.message };

  revalidatePath("/account/wishlist");
  revalidatePath("/products", "layout");
  return { wished: true };
}
