import type { ProductCategory } from "@/lib/types";

export const categories: {
  slug: ProductCategory;
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

export const browseCategories = [
  { slug: "audio", name: "Audio", description: "Headphones, earbuds and sound", href: "/products?category=audio" },
  { slug: "wearables", name: "Wearables", description: "Watches and daily companions", href: "/products?category=wearables" },
  { slug: "phones", name: "Phones", description: "Flagship pocket computing", href: "/products?category=wearables" },
  { slug: "tablets", name: "Tablets", description: "Canvas for work and ideas", href: "/products?category=power" },
  { slug: "home", name: "Home", description: "Sound and ambience for spaces", href: "/products?category=lighting" },
] as const;

export function categoryName(slug: string) {
  return categories.find((category) => category.slug === slug)?.name ?? slug;
}
