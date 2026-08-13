"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data-access/auth";
import type { FulfillmentStatus, OrderStatus, PaymentStatus } from "@/lib/types";

const categories = ["audio", "wearables", "lighting", "power"] as const;

const createProductSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z.string().trim().min(1, "Slug is required"),
  price: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  tagline: z.string().trim().default(""),
  description: z.string().trim().default(""),
  category: z.enum(categories),
  imageUrl: z.string().trim().optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newest: z.boolean().optional(),
  onSale: z.boolean().optional(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
});

const updateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).optional(),
  slug: z.string().trim().min(1).optional(),
  price: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  tagline: z.string().trim().optional(),
  description: z.string().trim().optional(),
  category: z.enum(categories).optional(),
  imageUrl: z.string().trim().optional(),
  featured: z.boolean().optional(),
  bestSeller: z.boolean().optional(),
  newest: z.boolean().optional(),
  onSale: z.boolean().optional(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
});

const productIdSchema = z.object({
  id: z.string().min(1),
});

const adjustStockSchema = z.object({
  id: z.string().min(1),
  delta: z.number().int(),
  reason: z.string().trim().min(1, "Reason is required"),
});

const reviewIdSchema = z.object({
  reviewId: z.string().uuid(),
});

function productIdFromSlug(slug: string) {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function skuFor(id: string) {
  return `NV-${id.toUpperCase()}`;
}

function revalidateCatalog() {
  revalidatePath("/admin", "layout");
  revalidatePath("/products", "layout");
  revalidatePath("/");
}

export async function createProductAction(input: unknown) {
  await requireAdmin();
  const parsed = createProductSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }

  const id = productIdFromSlug(parsed.data.slug);
  if (!id) return { error: "Slug must include letters or numbers." };

  const images = parsed.data.imageUrl ? [parsed.data.imageUrl] : [];
  const supabase = await createClient();
  const { error: productError } = await supabase.from("products").insert({
    id,
    slug: parsed.data.slug,
    name: parsed.data.name,
    tagline: parsed.data.tagline,
    description: parsed.data.description,
    price: parsed.data.price,
    stock: parsed.data.stock,
    category: parsed.data.category,
    images,
    featured: parsed.data.featured ?? false,
    best_seller: parsed.data.bestSeller ?? false,
    newest: parsed.data.newest ?? false,
    on_sale: parsed.data.onSale ?? false,
    compare_at_price: parsed.data.compareAtPrice ?? null,
    shipping: "Free two-day shipping on orders over $75.",
    returns: "30-day returns.",
  });

  if (productError) return { error: productError.message };

  const { error: variantError } = await supabase.from("product_variants").insert({
    id: `${id}:standard`,
    product_id: id,
    sku_key: "standard",
    name: "Standard",
  });

  if (variantError) return { error: variantError.message };

  revalidateCatalog();
  return { id };
}

export async function updateProductAction(input: unknown) {
  await requireAdmin();
  const parsed = updateProductSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }

  const patch: {
    name?: string;
    slug?: string;
    price?: number;
    stock?: number;
    tagline?: string;
    description?: string;
    category?: (typeof categories)[number];
    featured?: boolean;
    best_seller?: boolean;
    newest?: boolean;
    on_sale?: boolean;
    compare_at_price?: number | null;
    images?: string[];
  } = {};
  if (parsed.data.name !== undefined) patch.name = parsed.data.name;
  if (parsed.data.slug !== undefined) patch.slug = parsed.data.slug;
  if (parsed.data.price !== undefined) patch.price = parsed.data.price;
  if (parsed.data.stock !== undefined) patch.stock = parsed.data.stock;
  if (parsed.data.tagline !== undefined) patch.tagline = parsed.data.tagline;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.category !== undefined) patch.category = parsed.data.category;
  if (parsed.data.featured !== undefined) patch.featured = parsed.data.featured;
  if (parsed.data.bestSeller !== undefined) patch.best_seller = parsed.data.bestSeller;
  if (parsed.data.newest !== undefined) patch.newest = parsed.data.newest;
  if (parsed.data.onSale !== undefined) patch.on_sale = parsed.data.onSale;
  if (parsed.data.compareAtPrice !== undefined) {
    patch.compare_at_price = parsed.data.compareAtPrice;
  }

  const supabase = await createClient();

  if (parsed.data.imageUrl) {
    const { data: product } = await supabase
      .from("products")
      .select("images")
      .eq("id", parsed.data.id)
      .maybeSingle();
    const current = product?.images ?? [];
    if (!current.includes(parsed.data.imageUrl)) {
      patch.images = [...current, parsed.data.imageUrl];
    }
  }

  if (Object.keys(patch).length === 0) {
    return { ok: true as const };
  }

  const { error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };

  revalidateCatalog();
  return { ok: true as const };
}

export async function archiveProductAction(input: unknown) {
  await requireAdmin();
  const parsed = productIdSchema.safeParse(
    typeof input === "string" ? { id: input } : input
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };

  revalidateCatalog();
  return { ok: true as const };
}

export async function restoreProductAction(input: unknown) {
  await requireAdmin();
  const parsed = productIdSchema.safeParse(
    typeof input === "string" ? { id: input } : input
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid product" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ archived_at: null })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };

  revalidateCatalog();
  return { ok: true as const };
}

export async function adjustStockAction(id: unknown, delta: unknown, reason: unknown) {
  await requireAdmin();
  const parsed = adjustStockSchema.safeParse({ id, delta, reason });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid stock adjustment" };
  }

  const supabase = await createClient();
  const { data: product, error: lookupError } = await supabase
    .from("products")
    .select("id, stock")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };
  if (!product) return { error: "Product not found." };

  const nextStock = product.stock + parsed.data.delta;
  if (nextStock < 0) return { error: "Stock cannot go below zero." };

  const { error: updateError } = await supabase
    .from("products")
    .update({ stock: nextStock })
    .eq("id", product.id);

  if (updateError) return { error: updateError.message };

  const { error: logError } = await supabase.from("inventory_logs").insert({
    product_id: product.id,
    sku: skuFor(product.id),
    change: parsed.data.delta,
    reason: parsed.data.reason,
  });

  if (logError) return { error: logError.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/products", "layout");
  return { stock: nextStock };
}

const fulfillmentStepSchema = z.object({
  orderId: z.string().uuid(),
  step: z.enum(["fulfilled", "shipped", "delivered"]),
});

const orderIdSchema = z.object({
  orderId: z.string().uuid(),
});

const storeSettingsSchema = z.object({
  storeName: z.string().trim().min(1, "Store name is required"),
  origin: z.string().trim().min(1, "Origin is required"),
  supportEmail: z.string().trim().email("Enter a valid support email"),
});

type OrderPatch = {
  status?: OrderStatus;
  payment_status?: PaymentStatus;
  fulfillment_status?: FulfillmentStatus;
};

function fulfillmentPatch(step: "fulfilled" | "shipped" | "delivered"): {
  patch: OrderPatch;
  eventLabel: string;
} {
  switch (step) {
    case "fulfilled":
      return {
        patch: { fulfillment_status: "fulfilled", status: "fulfilled" },
        eventLabel: "Fulfilled",
      };
    case "shipped":
      return {
        patch: { fulfillment_status: "shipped", status: "shipped" },
        eventLabel: "Shipped",
      };
    case "delivered":
      return {
        patch: { status: "delivered" },
        eventLabel: "Delivered",
      };
  }
}

export async function updateFulfillmentAction(input: unknown) {
  await requireAdmin();
  const parsed = fulfillmentStepSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid fulfillment step" };
  }

  const supabase = await createClient();
  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };
  if (!order) return { error: "Order not found." };
  if (order.status === "cancelled") return { error: "Cancelled orders cannot be fulfilled." };

  const { patch, eventLabel } = fulfillmentPatch(parsed.data.step);
  const { error } = await supabase.from("orders").update(patch).eq("id", parsed.data.orderId);
  if (error) return { error: error.message };

  const { error: eventError } = await supabase
    .from("order_events")
    .update({
      complete: true,
      occurred_at: new Date().toISOString(),
    })
    .eq("order_id", parsed.data.orderId)
    .eq("label", eventLabel);

  if (eventError) return { error: eventError.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/account", "layout");
  return { ok: true as const };
}

export async function cancelOrderAction(input: unknown) {
  await requireAdmin();
  const parsed = orderIdSchema.safeParse(
    typeof input === "string" ? { orderId: input } : input
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid order" };
  }

  const supabase = await createClient();
  const { data: order, error: lookupError } = await supabase
    .from("orders")
    .select("id, number, status, order_items(product_id, quantity)")
    .eq("id", parsed.data.orderId)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };
  if (!order) return { error: "Order not found." };
  if (order.status === "cancelled") return { error: "Order is already cancelled." };

  const { data: cancelled, error: cancelError } = await supabase
    .from("orders")
    .update({ status: "cancelled" })
    .eq("id", order.id)
    .neq("status", "cancelled")
    .select("id")
    .maybeSingle();

  if (cancelError) return { error: cancelError.message };
  if (!cancelled) return { error: "Order is already cancelled." };

  const items = order.order_items ?? [];
  for (const item of items) {
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, stock")
      .eq("id", item.product_id)
      .maybeSingle();
    if (productError) return { error: productError.message };
    if (!product) continue;

    const { error: stockError } = await supabase
      .from("products")
      .update({ stock: product.stock + item.quantity })
      .eq("id", product.id);
    if (stockError) return { error: stockError.message };

    const { error: logError } = await supabase.from("inventory_logs").insert({
      product_id: product.id,
      sku: skuFor(product.id),
      change: item.quantity,
      reason: `Order cancelled ${order.number}`,
    });
    if (logError) return { error: logError.message };
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/account", "layout");
  revalidatePath("/products", "layout");
  return { ok: true as const };
}

export async function updateStoreSettingsAction(input: unknown) {
  await requireAdmin();
  const parsed = storeSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid settings" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("store_settings").upsert({
    id: 1,
    store_name: parsed.data.storeName,
    origin: parsed.data.origin,
    support_email: parsed.data.supportEmail,
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { ok: true as const };
}

export async function deleteReviewAdminAction(input: unknown) {
  await requireAdmin();
  const parsed = reviewIdSchema.safeParse(
    typeof input === "string" ? { reviewId: input } : input
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid review" };
  }

  const supabase = await createClient();
  const { data: review } = await supabase
    .from("reviews")
    .select("product_id")
    .eq("id", parsed.data.reviewId)
    .maybeSingle();

  const { error } = await supabase
    .from("reviews")
    .delete()
    .eq("id", parsed.data.reviewId);

  if (error) return { error: error.message };

  revalidatePath("/admin", "layout");
  revalidatePath("/products", "layout");
  if (review?.product_id) {
    const { data: product } = await supabase
      .from("products")
      .select("slug")
      .eq("id", review.product_id)
      .maybeSingle();
    if (product?.slug) revalidatePath(`/products/${product.slug}`);
  }

  return { ok: true as const };
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export async function uploadProductImageAction(formData: FormData) {
  await requireAdmin();

  const file = formData.get("file");
  const productIdRaw = formData.get("productId");
  const productId =
    typeof productIdRaw === "string" && productIdRaw.trim()
      ? productIdRaw.trim()
      : undefined;

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "Upload a JPEG, PNG, WebP, GIF, or AVIF image." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${productId ?? "uploads"}/${crypto.randomUUID()}.${ext}`;

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);

  if (productId) {
    const { data: product, error: lookupError } = await supabase
      .from("products")
      .select("images")
      .eq("id", productId)
      .maybeSingle();

    if (lookupError) return { error: lookupError.message };
    if (product) {
      const images = [...(product.images ?? []), publicUrl];
      const { error: updateError } = await supabase
        .from("products")
        .update({ images })
        .eq("id", productId);

      if (updateError) return { error: updateError.message };
      revalidateCatalog();
    }
  }

  return { url: publicUrl };
}
