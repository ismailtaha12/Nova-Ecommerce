"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { products } from "@/lib/data";
import { filterProducts, type ProductFilters } from "@/lib/filter-products";
import type { ProductCategory, SortOption } from "@/lib/types";
import { ProductCard } from "@/components/product/product-card";
import { EmptySearch } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories } from "@/lib/data/products";
import { cn } from "@/lib/utils";

const SORTS: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price low to high" },
  { value: "price-desc", label: "Price high to low" },
  { value: "best-selling", label: "Best selling" },
];

const DEFAULT_MAX_PRICE = 500;

function useListingFilters(): [
  ProductFilters,
  (patch: Partial<ProductFilters>) => void,
] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: ProductFilters = {
    q: params.get("q") ?? undefined,
    category: (params.get("category") as ProductCategory) ?? "all",
    minPrice: params.get("min") ? Number(params.get("min")) : 0,
    maxPrice: params.get("max") ? Number(params.get("max")) : DEFAULT_MAX_PRICE,
    minRating: params.get("rating") ? Number(params.get("rating")) : undefined,
    availability: (params.get("stock") as ProductFilters["availability"]) ?? "all",
    sort: (params.get("sort") as SortOption) ?? "featured",
  };

  function set(patch: Partial<ProductFilters>) {
    const next = { ...filters, ...patch };
    const sp = new URLSearchParams();
    if (next.q) sp.set("q", next.q);
    if (next.category && next.category !== "all") sp.set("category", next.category);
    if (next.minPrice && next.minPrice > 0) sp.set("min", String(next.minPrice));
    if (next.maxPrice && next.maxPrice < DEFAULT_MAX_PRICE) {
      sp.set("max", String(next.maxPrice));
    }
    if (next.minRating) sp.set("rating", String(next.minRating));
    if (next.availability && next.availability !== "all") sp.set("stock", next.availability);
    if (next.sort && next.sort !== "featured") sp.set("sort", next.sort);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  return [filters, set];
}

function countActiveFilters(filters: ProductFilters) {
  let count = 0;
  if (filters.category && filters.category !== "all") count += 1;
  if ((filters.minPrice ?? 0) > 0 || (filters.maxPrice ?? DEFAULT_MAX_PRICE) < DEFAULT_MAX_PRICE) {
    count += 1;
  }
  if (filters.minRating) count += 1;
  if (filters.availability && filters.availability !== "all") count += 1;
  return count;
}

function clearAllFilters(set: (patch: Partial<ProductFilters>) => void) {
  set({
    category: "all",
    minPrice: 0,
    maxPrice: DEFAULT_MAX_PRICE,
    minRating: undefined,
    availability: "all",
  });
}

function FilterSection({
  title,
  hint,
  defaultOpen = false,
  children,
}: {
  title: string;
  hint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group border-b border-border py-4 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
        <span className="text-[11px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
          {title}
        </span>
        <span className="flex items-center gap-2">
          {hint ? (
            <span className="text-xs font-normal tracking-normal text-foreground/70 normal-case">
              {hint}
            </span>
          ) : null}
          <ChevronDown
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            strokeWidth={1.5}
          />
        </span>
      </summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

function ActiveFilterChips({
  filters,
  set,
}: {
  filters: ProductFilters;
  set: (patch: Partial<ProductFilters>) => void;
}) {
  const chips: { key: string; label: string; clear: () => void }[] = [];

  if (filters.category && filters.category !== "all") {
    const name = categories.find((c) => c.slug === filters.category)?.name ?? filters.category;
    chips.push({
      key: "category",
      label: name,
      clear: () => set({ category: "all" }),
    });
  }

  const min = filters.minPrice ?? 0;
  const max = filters.maxPrice ?? DEFAULT_MAX_PRICE;
  if (min > 0 || max < DEFAULT_MAX_PRICE) {
    chips.push({
      key: "price",
      label: `$${min} – $${max}`,
      clear: () => set({ minPrice: 0, maxPrice: DEFAULT_MAX_PRICE }),
    });
  }

  if (filters.minRating) {
    chips.push({
      key: "rating",
      label: `${filters.minRating}+ stars`,
      clear: () => set({ minRating: undefined }),
    });
  }

  if (filters.availability && filters.availability !== "all") {
    chips.push({
      key: "availability",
      label: filters.availability === "in-stock" ? "In stock" : "Out of stock",
      clear: () => set({ availability: "all" }),
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm transition-colors hover:bg-muted"
        >
          {chip.label}
          <X className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
        </button>
      ))}
      <button
        type="button"
        onClick={() => clearAllFilters(set)}
        className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

function FilterPanel({
  filters,
  set,
  className,
}: {
  filters: ProductFilters;
  set: (patch: Partial<ProductFilters>) => void;
  className?: string;
}) {
  const activeCount = countActiveFilters(filters);
  const categoryHint =
    filters.category && filters.category !== "all"
      ? categories.find((c) => c.slug === filters.category)?.name
      : undefined;
  const priceHint =
    (filters.minPrice ?? 0) > 0 || (filters.maxPrice ?? DEFAULT_MAX_PRICE) < DEFAULT_MAX_PRICE
      ? `$${filters.minPrice ?? 0}–$${filters.maxPrice ?? DEFAULT_MAX_PRICE}`
      : undefined;

  return (
    <div className={className}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm font-medium">Filters</p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={() => clearAllFilters(set)}
            className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
          >
            Clear all ({activeCount})
          </button>
        ) : null}
      </div>

      <FilterSection title="Category" hint={categoryHint} defaultOpen>
        <div className="flex flex-wrap gap-2">
          {[{ slug: "all", name: "All" }, ...categories].map((category) => {
            const active = (filters.category ?? "all") === category.slug;
            return (
              <button
                key={category.slug}
                type="button"
                onClick={() =>
                  set({ category: category.slug as ProductFilters["category"] })
                }
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground hover:bg-muted/70"
                )}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Price" hint={priceHint} defaultOpen>
        <Slider
          min={0}
          max={DEFAULT_MAX_PRICE}
          value={[filters.minPrice ?? 0, filters.maxPrice ?? DEFAULT_MAX_PRICE]}
          onValueChange={(value) => {
            const [min, max] = value as number[];
            set({ minPrice: min, maxPrice: max });
          }}
        />
        <p className="mt-3 text-xs text-muted-foreground tabular-nums">
          ${filters.minPrice ?? 0} – ${filters.maxPrice ?? DEFAULT_MAX_PRICE}
        </p>
      </FilterSection>

      <FilterSection title="Rating" hint={filters.minRating ? `${filters.minRating}+` : undefined}>
        <div className="flex flex-wrap gap-2">
          {[4, 3].map((rating) => {
            const active = filters.minRating === rating;
            return (
              <button
                key={rating}
                type="button"
                onClick={() => set({ minRating: active ? undefined : rating })}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "bg-muted text-foreground hover:bg-muted/70"
                )}
              >
                {rating}+ stars
              </button>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection
        title="Availability"
        hint={
          filters.availability && filters.availability !== "all"
            ? filters.availability === "in-stock"
              ? "In stock"
              : "Out of stock"
            : undefined
        }
      >
        <div className="space-y-2">
          {[
            { id: "all", label: "All" },
            { id: "in-stock", label: "In stock" },
            { id: "out-of-stock", label: "Out of stock" },
          ].map((option) => (
            <label key={option.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={(filters.availability ?? "all") === option.id}
                onCheckedChange={() =>
                  set({ availability: option.id as ProductFilters["availability"] })
                }
              />
              {option.label}
            </label>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

export function ProductListing({
  title = "Store",
  subtitle = "Every object Nova makes, in one place.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [filters, set] = useListingFilters();
  const [open, setOpen] = useState(false);
  const merged = { ...filters };
  const list = filterProducts(products, merged);
  const activeCount = countActiveFilters(merged);

  return (
    <div className="py-12 md:py-16">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground tabular-nums">{list.length} products</p>
          <Select
            value={merged.sort ?? "featured"}
            onValueChange={(v) => set({ sort: (v as SortOption) ?? "featured" })}
          >
            <SelectTrigger className="h-10 min-w-[180px] rounded-md" aria-label="Sort">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((sort) => (
                <SelectItem key={sort.value} value={sort.value}>
                  {sort.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            className="relative lg:hidden"
            onClick={() => setOpen(true)}
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-[10px] text-background">
                {activeCount}
              </span>
            ) : null}
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="flex w-full flex-col p-0 sm:max-w-sm">
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-5 py-2">
                <FilterPanel filters={merged} set={set} />
              </div>
              <div className="border-t border-border p-5">
                <Button type="button" className="w-full" onClick={() => setOpen(false)}>
                  Show {list.length} products
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid items-start gap-12 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-border bg-card p-5">
            <FilterPanel filters={merged} set={set} />
          </div>
        </aside>
        <div>
          <ActiveFilterChips filters={merged} set={set} />
          {list.length === 0 ? (
            <EmptySearch query={merged.q} />
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
