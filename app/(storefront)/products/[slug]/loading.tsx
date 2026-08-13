import { Container } from "@/components/layout/container";
import { PageHeroSkeleton } from "@/components/states/skeletons";

export default function Loading() {
  return (
    <Container className="py-16">
      <PageHeroSkeleton />
    </Container>
  );
}
