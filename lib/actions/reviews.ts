"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSessionUser, requireUser } from "@/lib/data-access/auth";

const submitReviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(1, "Title is required"),
  body: z.string().trim().min(1, "Review is required"),
});

const deleteReviewSchema = z.object({
  reviewId: z.string().uuid(),
});

async function revalidateProduct(productId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug")
    .eq("id", productId)
    .maybeSingle();

  revalidatePath("/products", "layout");
  revalidatePath("/admin", "layout");
  if (data?.slug) revalidatePath(`/products/${data.slug}`);
}

export async function submitReviewAction(input: unknown) {
  await requireUser();
  const user = await getSessionUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = submitReviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  const author =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || "Customer";

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    product_id: parsed.data.productId,
    user_id: user.id,
    author,
    rating: parsed.data.rating,
    title: parsed.data.title,
    body: parsed.data.body,
  });

  if (error) return { error: error.message };

  await revalidateProduct(parsed.data.productId);
  return { ok: true as const };
}

export async function deleteReviewAction(input: unknown) {
  await requireUser();
  const user = await getSessionUser();
  if (!user) return { error: "You must be signed in." };

  const parsed = deleteReviewSchema.safeParse(
    typeof input === "string" ? { reviewId: input } : input
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  const supabase = await createClient();
  const { data: review, error: lookupError } = await supabase
    .from("reviews")
    .select("id, user_id, product_id")
    .eq("id", parsed.data.reviewId)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };
  if (!review) return { error: "Review not found." };

  const isOwner = review.user_id === user.id;
  const isAdmin = user.role === "admin";
  if (!isOwner && !isAdmin) {
    return { error: "You cannot delete this review." };
  }

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", review.id);

  if (error) return { error: error.message };

  await revalidateProduct(review.product_id);
  return { ok: true as const };
}
