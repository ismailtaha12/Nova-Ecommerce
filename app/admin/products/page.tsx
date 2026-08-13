import { Suspense } from "react";
import { ProductsTable } from "@/components/admin/products-table";
import { listAdminProducts } from "@/lib/data-access/admin";

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  return (
    <Suspense>
      <ProductsTable products={products} />
    </Suspense>
  );
}
