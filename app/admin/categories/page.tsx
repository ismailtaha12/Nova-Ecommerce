import { CategoriesManager } from "@/components/admin/categories-manager";
import { listAdminCategories, listAdminProducts } from "@/lib/data-access/admin";

export default async function AdminCategoriesPage() {
  const [categories, products] = await Promise.all([
    listAdminCategories(),
    listAdminProducts(),
  ]);
  const productCounts: Record<string, number> = {};
  for (const product of products.filter((item) => !item.archived)) {
    productCounts[product.category] = (productCounts[product.category] ?? 0) + 1;
  }

  return <CategoriesManager categories={categories} productCounts={productCounts} />;
}
