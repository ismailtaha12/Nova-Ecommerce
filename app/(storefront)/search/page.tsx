"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { EmptySearch } from "@/components/states/empty-state";
import { products } from "@/lib/data";
import { filterProducts } from "@/lib/filter-products";
import { ProductGridSkeleton } from "@/components/states/skeletons";

function SearchResults() {
  const params = useSearchParams();
  const q = params.get("q") ?? "";
  const list = filterProducts(products, { q, sort: "featured" });

  return (
    <Container className="py-16">
      <h1 className="text-4xl font-medium tracking-tight">Search</h1>
      <p className="mt-3 text-muted-foreground">
        {q ? `Results for “${q}”` : "Type a product name in search."}
      </p>
      {list.length === 0 ? (
        <EmptySearch query={q} />
      ) : (
        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<ProductGridSkeleton />}>
      <SearchResults />
    </Suspense>
  );
}
