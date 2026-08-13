import { ProductForm } from "@/components/admin/product-form";

export default function NewProductPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Create product</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
