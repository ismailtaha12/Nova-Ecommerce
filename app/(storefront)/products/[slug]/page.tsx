import { notFound } from "next/navigation";
import { products, getProduct } from "@/lib/data";
import { Container } from "@/components/layout/container";
import { ProductDetail } from "@/components/product/product-detail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product?.name ?? "Product",
    description: product?.tagline,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <Container className="py-10 pb-28 md:py-16 lg:pb-16">
      <ProductDetail product={product} />
    </Container>
  );
}
