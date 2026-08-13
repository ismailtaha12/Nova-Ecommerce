import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <AdminPageHeader
        title="Create product"
        crumbs={[
          { href: "/admin/products", label: "Products" },
          { label: "New" },
        ]}
      />
      <ProductForm />
    </div>
  );
}
