import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { categories } from "@/lib/catalog";
import { listAdminProducts } from "@/lib/data-access/admin";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AdminCategoriesPage() {
  const products = await listAdminProducts();
  const active = products.filter((product) => !product.archived);

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Fixed storefront categories. Open a category to manage its products."
      />
      <ul className="divide-y divide-border border-y border-border">
        {categories.map((category) => {
          const inCategory = active.filter((product) => product.category === category.slug);
          const lowStock = inCategory.filter((product) => product.stock <= 6).length;
          return (
            <li key={category.slug} className="flex flex-wrap items-center justify-between gap-4 py-5">
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-sm text-muted-foreground">{category.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {inCategory.length} products
                  {lowStock ? ` · ${lowStock} low stock` : ""}
                </p>
              </div>
              <Link
                href={`/admin/products?category=${category.slug}`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
              >
                View products
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
