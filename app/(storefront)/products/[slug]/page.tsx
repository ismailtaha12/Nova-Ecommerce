import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { ProductDetail } from "@/components/product/product-detail";
import {
  getProductBySlug,
  getRelatedProducts,
  listReviews,
} from "@/lib/data-access/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
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
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related] = await Promise.all([
    listReviews(product.id),
    getRelatedProducts(product),
  ]);

  return (
    <Container className="py-10 pb-28 md:py-16 lg:pb-16">
      <ProductDetail product={product} reviews={reviews} related={related} />
    </Container>
  );
}
