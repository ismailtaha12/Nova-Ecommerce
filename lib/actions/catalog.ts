"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/data-access/auth";

function revalidateStore() {
  revalidatePath("/admin", "layout");
  revalidatePath("/products", "layout");
  revalidatePath("/");
}

const slugSchema = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens");

const categorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1),
  slug: slugSchema,
  description: z.string().trim().default(""),
  image: z.string().trim().default(""),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export async function upsertCategoryAction(input: unknown) {
  await requireAdmin();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid category" };
  }
  const supabase = await createClient();
  const row = {
    name: parsed.data.name,
    slug: parsed.data.slug,
    description: parsed.data.description,
    image: parsed.data.image,
    parent_id: parsed.data.parentId ?? null,
    sort_order: parsed.data.sortOrder ?? 0,
  };
  const query = parsed.data.id
    ? supabase.from("categories").update(row).eq("id", parsed.data.id)
    : supabase.from("categories").insert(row);
  const { error } = await query;
  if (error) return { error: error.message };
  revalidateStore();
  return { ok: true as const };
}

export async function archiveCategoryAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateStore();
  return { ok: true as const };
}

export async function restoreCategoryAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ archived_at: null })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidateStore();
  return { ok: true as const };
}

const bannerSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(1),
  subtitle: z.string().trim().default(""),
  image: z.string().trim().default(""),
  ctaLabel: z.string().trim().default("Shop now"),
  ctaHref: z.string().trim().default("/products"),
  sortOrder: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function upsertBannerAction(input: unknown) {
  await requireAdmin();
  const parsed = bannerSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid banner" };
  }
  const supabase = await createClient();
  const row = {
    title: parsed.data.title,
    subtitle: parsed.data.subtitle,
    image: parsed.data.image,
    cta_label: parsed.data.ctaLabel,
    cta_href: parsed.data.ctaHref,
    sort_order: parsed.data.sortOrder,
    active: parsed.data.active,
  };
  const query = parsed.data.id
    ? supabase.from("homepage_banners").update(row).eq("id", parsed.data.id)
    : supabase.from("homepage_banners").insert(row);
  const { error } = await query;
  if (error) return { error: error.message };
  revalidateStore();
  return { ok: true as const };
}

export async function deleteBannerAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("homepage_banners").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidateStore();
  return { ok: true as const };
}

const couponSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(2).transform((value) => value.toUpperCase()),
  description: z.string().trim().default(""),
  type: z.enum(["percent", "fixed"]),
  amount: z.number().nonnegative(),
  minSubtotal: z.number().nonnegative().default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  active: z.boolean().default(true),
  startsAt: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
});

export async function upsertCouponAction(input: unknown) {
  await requireAdmin();
  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid coupon" };
  }
  if (parsed.data.type === "percent" && parsed.data.amount > 100) {
    return { error: "Percent discounts cannot exceed 100." };
  }
  const supabase = await createClient();
  const row = {
    code: parsed.data.code,
    description: parsed.data.description,
    type: parsed.data.type,
    amount: parsed.data.amount,
    min_subtotal: parsed.data.minSubtotal,
    max_uses: parsed.data.maxUses ?? null,
    active: parsed.data.active,
    starts_at: parsed.data.startsAt || null,
    expires_at: parsed.data.expiresAt || null,
  };
  const query = parsed.data.id
    ? supabase.from("coupons").update(row).eq("id", parsed.data.id)
    : supabase.from("coupons").insert(row);
  const { error } = await query;
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true as const };
}

export async function deleteCouponAction(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin", "layout");
  return { ok: true as const };
}

const variantSchema = z.object({
  id: z.string().min(1).optional(),
  name: z.string().trim().min(1),
  skuKey: z.string().trim().min(1),
  price: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative(),
  options: z.record(z.string(), z.string()).optional(),
  sortOrder: z.number().int().optional(),
});

export async function saveProductVariantsAction(productId: string, variants: unknown) {
  await requireAdmin();
  const parsed = z.array(variantSchema).min(1).safeParse(variants);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Add at least one variant" };
  }
  const supabase = await createClient();
  const { data: existing, error: existingError } = await supabase
    .from("product_variants")
    .select("id")
    .eq("product_id", productId);
  if (existingError) return { error: existingError.message };

  const keep = new Set<string>();
  for (const [index, variant] of parsed.data.entries()) {
    const id = variant.id || `${productId}:${variant.skuKey}`;
    keep.add(id);
    const row = {
      id,
      product_id: productId,
      sku_key: variant.skuKey,
      name: variant.name,
      price: variant.price ?? null,
      stock: variant.stock,
      options: variant.options ?? {},
      sort_order: variant.sortOrder ?? index,
    };
    const { error } = await supabase.from("product_variants").upsert(row);
    if (error) return { error: error.message };
  }

  const toDelete = (existing ?? []).map((row) => row.id).filter((id) => !keep.has(id));
  if (toDelete.length > 0) {
    const { error } = await supabase.from("product_variants").delete().in("id", toDelete);
    if (error) return { error: error.message };
  }

  revalidateStore();
  return { ok: true as const };
}

export async function updateProductImagesAction(productId: string, images: string[]) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ images })
    .eq("id", productId);
  if (error) return { error: error.message };
  revalidateStore();
  return { ok: true as const };
}

export async function updateCustomerNotesAction(input: unknown) {
  await requireAdmin();
  const parsed = z
    .object({
      id: z.string().uuid(),
      notes: z.string(),
      disabled: z.boolean().optional(),
    })
    .safeParse(input);
  if (!parsed.success) return { error: "Invalid customer" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      notes: parsed.data.notes,
      disabled_at: parsed.data.disabled ? new Date().toISOString() : null,
    })
    .eq("id", parsed.data.id);
  if (error) return { error: error.message };
  revalidatePath("/admin/customers", "layout");
  return { ok: true as const };
}
