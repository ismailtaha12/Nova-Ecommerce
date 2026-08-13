"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAdmin } from "@/lib/stores/admin-store";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ProductForm({ product }: { product?: Product }) {
  const { createProduct, updateProduct } = useAdmin();
  const router = useRouter();

  return (
    <form
      className="max-w-xl space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = String(fd.get("name"));
        const slug = String(fd.get("slug") || name.toLowerCase().replace(/\s+/g, "-"));
        const price = Number(fd.get("price"));
        const stock = Number(fd.get("stock"));
        const tagline = String(fd.get("tagline"));
        const description = String(fd.get("description"));
        if (product) {
          updateProduct(product.id, { name, slug, price, stock, tagline, description });
          toast.success("Product updated");
        } else {
          createProduct({
            id: slug,
            slug,
            name,
            tagline,
            description,
            price,
            rating: 0,
            reviewCount: 0,
            category: "audio",
            colors: [{ name: "Graphite", hex: "#2b2b2b" }],
            variants: [{ id: "standard", name: "Standard" }],
            images: [
              "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80",
            ],
            stock,
            specs: { Status: "Draft" },
            shipping: "Free two-day shipping on orders over $75.",
            returns: "30-day returns.",
          });
          toast.success("Product created");
        }
        router.push("/admin/products");
      }}
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required defaultValue={product?.name} className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" name="slug" defaultValue={product?.slug} className="h-11" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" required defaultValue={product?.price ?? 199} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" name="stock" type="number" required defaultValue={product?.stock ?? 10} className="h-11" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" defaultValue={product?.tagline} className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={product?.description} />
      </div>
      <Button type="submit" size="lg">
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
