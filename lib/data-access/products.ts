import type { ProductFilters } from "@/lib/filter-products";
import { createClient } from "@/lib/supabase/server";
import type { Product, Review } from "@/lib/types";
import { mapProduct, mapReview, type ProductRow } from "@/lib/data-access/mappers";

const PRODUCT_SELECT = "*, product_variants(id, name, sku_key)" as const;

export type ProductSummary = Pick<
  Product,
  "id" | "slug" | "name" | "tagline" | "category" | "price"
>;

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function sanitizeIlike(value: string) {
  return value.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
}

export async function listProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .is("archived_at", null);

  const q = filters.q ? sanitizeIlike(filters.q) : "";
  if (q) {
    query = query.or(`name.ilike.%${q}%,tagline.ilike.%${q}%,category.ilike.%${q}%`);
  }

  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }

  if (filters.minPrice != null && Number.isFinite(filters.minPrice)) {
    query = query.gte("price", filters.minPrice);
  }

  if (filters.maxPrice != null && Number.isFinite(filters.maxPrice)) {
    query = query.lte("price", filters.maxPrice);
  }

  if (filters.minRating) {
    query = query.gte("rating", filters.minRating);
  }

  if (filters.availability === "in-stock") {
    query = query.gt("stock", 0);
  } else if (filters.availability === "out-of-stock") {
    query = query.eq("stock", 0);
  }

  switch (filters.sort) {
    case "newest":
      query = query.order("newest", { ascending: false }).order("created_at", { ascending: false });
      break;
    case "price-asc":
      query = query.order("price", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price", { ascending: false });
      break;
    case "best-selling":
      query = query
        .order("best_seller", { ascending: false })
        .order("review_count", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("rating", { ascending: false });
  }

  const { data, error } = await query;
  throwIfError(error);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .is("archived_at", null)
    .maybeSingle();
  throwIfError(error);
  return data ? mapProduct(data as ProductRow) : null;
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .is("archived_at", null)
    .maybeSingle();
  throwIfError(error);
  return data ? mapProduct(data as ProductRow) : null;
}

export async function getFeaturedProducts(limit = 3): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .is("archived_at", null)
    .eq("featured", true)
    .order("rating", { ascending: false })
    .limit(limit);
  throwIfError(error);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .is("archived_at", null)
    .eq("category", product.category)
    .neq("id", product.id)
    .order("rating", { ascending: false })
    .limit(limit);
  throwIfError(error);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function listProductSummaries(): Promise<ProductSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, slug, name, tagline, category, price")
    .is("archived_at", null)
    .order("name", { ascending: true });
  throwIfError(error);
  return (data ?? []).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    category: row.category,
    price: Number(row.price),
  }));
}

export async function listReviews(productId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map(mapReview);
}

export async function listWishlistProducts(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .in("id", ids)
    .is("archived_at", null);
  throwIfError(error);
  const byId = new Map(((data ?? []) as ProductRow[]).map((row) => [row.id, mapProduct(row)]));
  return ids.flatMap((id) => {
    const product = byId.get(id);
    return product ? [product] : [];
  });
}
