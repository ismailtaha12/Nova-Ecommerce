import type { Category } from "@/lib/types";

export const categories: {
  slug: string;
  name: string;
  description: string;
  image: string;
}[] = [
  {
    slug: "audio",
    name: "Audio",
    description: "Headphones, earbuds, and speakers.",
    image: "/products/pulse.png",
  },
  {
    slug: "wearables",
    name: "Wearables",
    description: "Timepieces that stay quiet.",
    image: "/products/orbit.png",
  },
  {
    slug: "lighting",
    name: "Lighting",
    description: "Calibrated light for rooms and desks.",
    image: "https://images.unsplash.com/photo-1507473886605-74d4bb4d3ace?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "power",
    name: "Power",
    description: "Charging without the clutter.",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1200&q=80",
  },
];

export function categoryName(slug: string, list: Category[] = []) {
  return list.find((category) => category.slug === slug)?.name
    ?? categories.find((category) => category.slug === slug)?.name
    ?? slug;
}

export function categorySlugsForFilter(slug: string, list: Category[]): string[] {
  if (!slug || slug === "all") return [];
  const match = list.find((category) => category.slug === slug);
  if (!match) return [slug];
  const children = list.filter((category) => category.parentId === match.id).map((c) => c.slug);
  return [match.slug, ...children];
}

export function browseFromCategories(list: Category[]) {
  const roots = list.filter((category) => !category.parentId && !category.archived);
  if (roots.length === 0) {
    return categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.description,
      href: `/products?category=${category.slug}`,
    }));
  }
  return roots.map((category) => ({
    slug: category.slug,
    name: category.name,
    description: category.description,
    href: `/products?category=${category.slug}`,
  }));
}
