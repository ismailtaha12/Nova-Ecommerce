import { ProductGridSkeleton } from "@/components/states/skeletons";
import { Container } from "@/components/layout/container";

export default function Loading() {
  return (
    <Container className="py-16">
      <div className="mb-12 h-10 w-64 animate-pulse bg-muted" />
      <ProductGridSkeleton />
    </Container>
  );
}
