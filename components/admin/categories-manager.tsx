"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import {
  archiveCategoryAction,
  restoreCategoryAction,
  upsertCategoryAction,
} from "@/lib/actions/catalog";
import type { Category } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function slugFromName(name: string) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function CategoriesManager({
  categories,
  productCounts,
}: {
  categories: Category[];
  productCounts: Record<string, number>;
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Category | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") ?? "");
    startTransition(async () => {
      const result = await upsertCategoryAction({
        id: editing?.id,
        name,
        slug: String(fd.get("slug") ?? "") || slugFromName(name),
        description: String(fd.get("description") ?? ""),
        image: String(fd.get("image") ?? ""),
        parentId: String(fd.get("parentId") ?? "") || null,
        sortOrder: Number(fd.get("sortOrder") ?? 0),
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(editing ? "Category saved" : "Category created");
      setEditing(null);
      event.currentTarget.reset();
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Create parent categories and subcategories. Products can belong to either."
      />
      <form className="mb-10 grid max-w-xl gap-3" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required defaultValue={editing?.name} key={editing?.id ?? "new"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={editing?.slug} key={`${editing?.id}-slug`} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentId">Parent</Label>
          <select
            id="parentId"
            name="parentId"
            defaultValue={editing?.parentId ?? ""}
            key={`${editing?.id}-parent`}
            className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
          >
            <option value="">None (top level)</option>
            {categories
              .filter((category) => !category.parentId && category.id !== editing?.id)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" rows={2} defaultValue={editing?.description} key={`${editing?.id}-desc`} />
        </div>
        <Input name="image" placeholder="Image URL" defaultValue={editing?.image} key={`${editing?.id}-image`} />
        <Input name="sortOrder" type="number" placeholder="Sort order" defaultValue={editing?.sortOrder ?? 0} />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>
            {editing ? "Save category" : "Add category"}
          </Button>
          {editing ? (
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          ) : null}
        </div>
      </form>
      <ul className="divide-y divide-border border-y border-border">
        {categories.map((category) => (
          <li key={category.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">
                {category.parentId ? "— " : ""}
                {category.name}
                {category.archived ? " (archived)" : ""}
              </p>
              <p className="text-sm text-muted-foreground">{category.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {productCounts[category.slug] ?? 0} products · {category.slug}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => setEditing(category)}>
                Edit
              </Button>
              {category.archived ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await restoreCategoryAction(category.id);
                      if (result.error) toast.error(result.error);
                      else toast.success("Restored");
                    })
                  }
                >
                  Restore
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    startTransition(async () => {
                      const result = await archiveCategoryAction(category.id);
                      if (result.error) toast.error(result.error);
                      else toast.success("Archived");
                    })
                  }
                >
                  Archive
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
