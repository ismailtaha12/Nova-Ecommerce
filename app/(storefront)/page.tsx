import Link from "next/link";
import { Container, Section } from "@/components/layout/container";
import { HeroSection } from "@/components/home/hero-section";
import { CategoryBrowse } from "@/components/home/category-browse";
import { ProductCard } from "@/components/product/product-card";
import { getFeaturedProducts } from "@/lib/data-access/products";
import { ArrowRight } from "lucide-react";

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      <HeroSection product={featured[0] ?? null} />

      <Section>
        <Container>
          <div className="mb-10 flex items-end justify-between gap-6 md:mb-12">
            <div>
              <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
                Featured
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                The three we&apos;d pick first.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden items-center gap-1.5 text-sm font-medium text-foreground transition-opacity hover:opacity-70 md:inline-flex"
            >
              All products
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} large />
            ))}
          </div>
        </Container>
      </Section>

      <CategoryBrowse />
    </>
  );
}
