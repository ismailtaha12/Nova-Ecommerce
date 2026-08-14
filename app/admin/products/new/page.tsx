import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { listAdminCategories } from "@/lib/data-access/admin";

export default async function NewProductPage() {
  const categories = await listAdminCategories();
  return (
    <div>
      <AdminPageHeader
        title="Create product"
        crumbs={[
          { href: "/admin/products", label: "Products" },
          { label: "New" },
        ]}
      />
      <ProductForm categories={categories.filter((category) => !category.archived)} />
    </div>
  );
}
