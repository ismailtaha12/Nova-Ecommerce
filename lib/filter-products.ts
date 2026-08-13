import type { Product, ProductCategory, SortOption } from "@/lib/types";

export type ProductFilters = {
  category?: ProductCategory | "all";
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  availability?: "all" | "in-stock" | "out-of-stock";
  q?: string;
  sort?: SortOption;
};

const CATEGORIES: ProductCategory[] = ["audio", "wearables", "lighting", "power"];
const SORTS: SortOption[] = ["featured", "newest", "price-asc", "price-desc", "best-selling"];
const AVAILABILITY: NonNullable<ProductFilters["availability"]>[] = [
  "all",
  "in-stock",
  "out-of-stock",
];

function parseNumber(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export function parseProductFilters(sp: { get(key: string): string | null }): ProductFilters {
  const category = sp.get("category");
  const availability = sp.get("stock");
  const sort = sp.get("sort");
  const q = sp.get("q")?.trim();

  return {
    q: q || undefined,
    category: CATEGORIES.includes(category as ProductCategory)
      ? (category as ProductCategory)
      : "all",
    minPrice: parseNumber(sp.get("min")),
    maxPrice: parseNumber(sp.get("max")),
    minRating: parseNumber(sp.get("rating")),
    availability: AVAILABILITY.includes(
      availability as (typeof AVAILABILITY)[number]
    )
      ? (availability as (typeof AVAILABILITY)[number])
      : "all",
    sort: SORTS.includes(sort as SortOption) ? (sort as SortOption) : "featured",
  };
}

export function filterProducts(products: Product[], filters: ProductFilters) {
  let list = [...products];

  if (filters.q) {
    const q = filters.q.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.category.includes(q)
    );
  }

  if (filters.category && filters.category !== "all") {
    list = list.filter((p) => p.category === filters.category);
  }

  if (filters.minPrice != null) {
    list = list.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice != null) {
    list = list.filter((p) => p.price <= filters.maxPrice!);
  }

  if (filters.minRating) {
    list = list.filter((p) => p.rating >= filters.minRating!);
  }

  if (filters.availability === "in-stock") {
    list = list.filter((p) => p.stock > 0);
  } else if (filters.availability === "out-of-stock") {
    list = list.filter((p) => p.stock <= 0);
  }

  switch (filters.sort) {
    case "newest":
      list.sort((a, b) => Number(b.newest) - Number(a.newest) || a.name.localeCompare(b.name));
      break;
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "best-selling":
      list.sort((a, b) => Number(b.bestSeller) - Number(a.bestSeller) || b.reviewCount - a.reviewCount);
      break;
    default:
      list.sort((a, b) => Number(b.featured) - Number(a.featured) || b.rating - a.rating);
  }

  return list;
}
