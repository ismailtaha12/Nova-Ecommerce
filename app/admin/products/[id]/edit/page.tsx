"use client";

import { use } from "react";
import { ProductUnavailable } from "@/components/states/empty-state";
import { useAdmin } from "@/lib/stores/admin-store";
import { ProductForm } from "@/components/admin/product-form";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { products } = useAdmin();
  const product = products.find((p) => p.id === id);
  if (!product) return <ProductUnavailable />;

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Edit {product.name}</h1>
      <div className="mt-8">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
