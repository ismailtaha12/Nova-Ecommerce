import { Container } from "@/components/layout/container";
import { ProductGridSkeleton } from "@/components/states/skeletons";

export default function Loading() {
  return (
    <Container className="py-16">
      <ProductGridSkeleton />
    </Container>
  );
}
