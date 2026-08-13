import { Container } from "@/components/layout/container";
import { ProductCard } from "@/components/product/product-card";
import { EmptySearch } from "@/components/states/empty-state";
import { listProducts } from "@/lib/data-access/products";

export const metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = Array.isArray(sp.q) ? (sp.q[0] ?? "") : (sp.q ?? "");
  const list = await listProducts({ q, sort: "featured" });

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
