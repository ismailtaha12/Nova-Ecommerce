import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { ProductListing } from "@/components/product/product-listing";
import { ProductGridSkeleton } from "@/components/states/skeletons";
import { parseProductFilters } from "@/lib/filter-products";
import { listCategories, listProducts } from "@/lib/data-access/products";

export const metadata = {
  title: "Store",
};

function searchParamsGet(sp: Record<string, string | string[] | undefined>) {
  return {
    get(key: string): string | null {
      const value = sp[key];
      if (Array.isArray(value)) return value[0] ?? null;
      return value ?? null;
    },
  };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const filters = parseProductFilters(searchParamsGet(sp));
  const [products, categories] = await Promise.all([
    listProducts(filters),
    listCategories(),
  ]);

  return (
    <Container>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing products={products} categories={categories} />
      </Suspense>
    </Container>
  );
}
