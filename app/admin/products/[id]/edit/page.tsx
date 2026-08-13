import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getAdminProductById } from "@/lib/data-access/admin";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProductById(id);
  if (!product) notFound();

  return (
    <div>
      <AdminPageHeader
        title={`Edit ${product.name}`}
        description={product.archived ? "This product is archived." : product.slug}
        crumbs={[
          { href: "/admin/products", label: "Products" },
          { label: product.name },
        ]}
      />
      <ProductForm product={product} />
    </div>
  );
}
