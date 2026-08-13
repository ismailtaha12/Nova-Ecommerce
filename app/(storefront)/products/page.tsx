import { Suspense } from "react";
import { Container } from "@/components/layout/container";
import { ProductListing } from "@/components/product/product-listing";
import { ProductGridSkeleton } from "@/components/states/skeletons";

export const metadata = {
  title: "Store",
};

export default function ProductsPage() {
  return (
    <Container>
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductListing />
      </Suspense>
    </Container>
  );
}
