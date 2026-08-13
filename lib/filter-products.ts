import type { Product, ProductCategory, SortOption } from "@/lib/types";

export type ProductFilters = {
  category?: ProductCategory | "all";
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  minRating?: number;
  availability?: "all" | "in-stock" | "out-of-stock";
  q?: string;
  sort?: SortOption;
};

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

  if (filters.colors?.length) {
    list = list.filter((p) =>
      p.colors.some((c) => filters.colors!.includes(c.name))
    );
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

export const allColors = [
  "Graphite",
  "Sand",
  "Ink Blue",
  "Walnut",
  "Slate",
  "Cloud",
  "Charcoal",
  "Clay",
  "Midnight",
  "Fog",
  "Oat",
  "Forest",
  "Terracotta",
  "Steel",
  "Black DLC",
  "Gold",
  "Trail",
  "Ocean",
  "Flame",
  "Aluminum",
  "Black",
  "Ivory",
  "Stone",
];
