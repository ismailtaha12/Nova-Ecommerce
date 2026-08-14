"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createProductAction,
  updateProductAction,
  uploadProductImageAction,
} from "@/lib/actions/admin";
import type { Category, Product } from "@/lib/types";
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

type VariantDraft = {
  id?: string;
  name: string;
  skuKey: string;
  price: string;
  stock: string;
  color: string;
  size: string;
};

function variantsFromProduct(product?: Product): VariantDraft[] {
  if (!product?.variants.length) {
    return [{ name: "Standard", skuKey: "standard", price: "", stock: "10", color: "", size: "" }];
  }
  return product.variants.map((variant) => ({
    id: variant.id,
    name: variant.name,
    skuKey: variant.skuKey,
    price: variant.price != null ? String(variant.price) : "",
    stock: String(variant.stock),
    color: variant.options.color ?? "",
    size: variant.options.size ?? "",
  }));
}

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [featured, setFeatured] = useState(Boolean(product?.featured));
  const [bestSeller, setBestSeller] = useState(Boolean(product?.bestSeller));
  const [newest, setNewest] = useState(Boolean(product?.newest));
  const [onSale, setOnSale] = useState(Boolean(product?.onSale));
  const [variants, setVariants] = useState<VariantDraft[]>(() => variantsFromProduct(product));

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
    const tagline = String(fd.get("tagline") ?? "");
    const description = String(fd.get("description") ?? "");
    const categoryId = String(fd.get("categoryId") ?? "");
    const pasted = String(fd.get("imageUrl") ?? "").trim();
    const nextImages = pasted && !images.includes(pasted) ? [...images, pasted] : images;
    const compareRaw = String(fd.get("compareAtPrice") ?? "").trim();
    const compareAtPrice = compareRaw === "" ? null : Number(compareRaw);
    const variantPayload = variants.map((variant, index) => ({
      id: variant.id,
      name: variant.name,
      skuKey: variant.skuKey || slugFromName(variant.name) || `option-${index + 1}`,
      price: variant.price === "" ? null : Number(variant.price),
      stock: Number(variant.stock) || 0,
      options: {
        ...(variant.color ? { color: variant.color } : {}),
        ...(variant.size ? { size: variant.size } : {}),
      },
    }));

    startTransition(async () => {
      const payload = {
        name,
        slug,
        price,
        tagline,
        description,
        categoryId,
        featured,
        bestSeller,
        newest,
        onSale,
        images: nextImages,
        variants: variantPayload,
        compareAtPrice: Number.isFinite(compareAtPrice) ? compareAtPrice : null,
      };
      const result = product
        ? await updateProductAction({ id: product.id, ...payload })
        : await createProductAction(payload);

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(product ? "Product updated" : "Product created");
      router.push("/admin/products");
    });
  }

  return (
    <form className="max-w-2xl space-y-6" onSubmit={onSubmit}>
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
          <Label htmlFor="price">Base price</Label>
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
      <div className="space-y-2">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          required
          defaultValue={product?.categoryId ?? categories[0]?.id ?? ""}
          className={selectClassName}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.parentId ? `— ${category.name}` : category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="imageFile">Images</Label>
        {images.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {images.map((src, index) => (
              <div key={src} className="relative">
                <div className="size-16 overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="size-full object-cover" />
                </div>
                <div className="mt-1 flex gap-1">
                  <button
                    type="button"
                    className="text-[10px] text-muted-foreground hover:text-foreground"
                    onClick={() =>
                      setImages((current) => {
                        const next = [...current];
                        const [item] = next.splice(index, 1);
                        next.unshift(item);
                        return next;
                      })
                    }
                  >
                    Primary
                  </button>
                  <button
                    type="button"
                    className="text-[10px] text-destructive"
                    onClick={() => setImages((current) => current.filter((item) => item !== src))}
                  >
                    Remove
                  </button>
                </div>
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
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Variants</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setVariants((current) => [
                ...current,
                { name: "", skuKey: "", price: "", stock: "0", color: "", size: "" },
              ])
            }
          >
            Add variant
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <div key={variant.id ?? index} className="grid gap-2 border border-border p-3 sm:grid-cols-6">
              <Input
                placeholder="Name"
                value={variant.name}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((item, i) => (i === index ? { ...item, name: event.target.value } : item))
                  )
                }
              />
              <Input
                placeholder="SKU key"
                value={variant.skuKey}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((item, i) => (i === index ? { ...item, skuKey: event.target.value } : item))
                  )
                }
              />
              <Input
                placeholder="Price override"
                type="number"
                min="0"
                step="0.01"
                value={variant.price}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((item, i) => (i === index ? { ...item, price: event.target.value } : item))
                  )
                }
              />
              <Input
                placeholder="Stock"
                type="number"
                min="0"
                value={variant.stock}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((item, i) => (i === index ? { ...item, stock: event.target.value } : item))
                  )
                }
              />
              <Input
                placeholder="Color"
                value={variant.color}
                onChange={(event) =>
                  setVariants((current) =>
                    current.map((item, i) => (i === index ? { ...item, color: event.target.value } : item))
                  )
                }
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Size"
                  value={variant.size}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, i) => (i === index ? { ...item, size: event.target.value } : item))
                    )
                  }
                />
                {variants.length > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}
                  >
                    ×
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
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
