"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createProductAction,
  updateProductAction,
  uploadProductImageAction,
} from "@/lib/actions/admin";
import { categories } from "@/lib/catalog";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const selectClassName =
  "h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

function slugFromName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [bestSeller, setBestSeller] = useState(Boolean(product?.bestSeller));
  const [newest, setNewest] = useState(Boolean(product?.newest));
  const [onSale, setOnSale] = useState(Boolean(product?.onSale));

  async function onUpload(file: File) {
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    if (product?.id) formData.set("productId", product.id);
    const result = await uploadProductImageAction(formData);
    setUploading(false);
    if (result.error) {
      toast.error(result.error);
      return;
    }
    if (result.url) {
      setImages((current) =>
        current.includes(result.url) ? current : [...current, result.url]
      );
      toast.success("Image uploaded");
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const slug = String(fd.get("slug") ?? "").trim() || slugFromName(name);
    const price = Number(fd.get("price"));
    const stock = Number(fd.get("stock"));
    const tagline = String(fd.get("tagline") ?? "");
    const description = String(fd.get("description") ?? "");
    const category = String(fd.get("category") ?? "");
    const imageUrl = String(fd.get("imageUrl") ?? "").trim() || images[0] || "";
    const compareRaw = String(fd.get("compareAtPrice") ?? "").trim();
    const compareAtPrice = compareRaw === "" ? null : Number(compareRaw);

    startTransition(async () => {
      const payload = {
        name,
        slug,
        price,
        stock,
        tagline,
        description,
        category,
        featured,
        bestSeller,
        newest,
        onSale,
        compareAtPrice: Number.isFinite(compareAtPrice) ? compareAtPrice : null,
        ...(imageUrl ? { imageUrl } : {}),
      };
      const result = product
        ? await updateProductAction({ id: product.id, ...payload })
        : await createProductAction(payload);

      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
    });
  }

  return (
    <form className="max-w-xl space-y-4" onSubmit={onSubmit}>
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
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            required
            defaultValue={product?.price ?? 199}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="compareAtPrice">Compare-at price</Label>
          <Input
            id="compareAtPrice"
            name="compareAtPrice"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product?.compareAtPrice ?? ""}
            className="h-11"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="stock">Stock</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.stock ?? 10}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            required
            defaultValue={product?.category ?? "audio"}
            className={selectClassName}
          >
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageFile">Images</Label>
        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((src) => (
              <div key={src} className="relative size-16 overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="size-full object-cover" />
              </div>
            ))}
          </div>
        ) : null}
        <Input
          id="imageFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
          disabled={uploading || pending}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onUpload(file);
            event.target.value = "";
          }}
        />
        <Input
          id="imageUrl"
          name="imageUrl"
          defaultValue=""
          placeholder="Or paste an image URL"
          className="h-11"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tagline">Tagline</Label>
        <Input id="tagline" name="tagline" defaultValue={product?.tagline} className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={5} defaultValue={product?.description} />
      </div>
      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-1 text-sm font-medium">Merchandising</legend>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={featured} onCheckedChange={(value) => setFeatured(value === true)} />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={bestSeller} onCheckedChange={(value) => setBestSeller(value === true)} />
          Best seller
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={newest} onCheckedChange={(value) => setNewest(value === true)} />
          Newest
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={onSale} onCheckedChange={(value) => setOnSale(value === true)} />
          On sale
        </label>
      </fieldset>
      <Button type="submit" size="lg" disabled={pending || uploading}>
        {product ? "Save changes" : "Create product"}
      </Button>
    </form>
  );
}
