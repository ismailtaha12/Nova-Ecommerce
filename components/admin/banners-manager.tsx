"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { deleteBannerAction, upsertBannerAction } from "@/lib/actions/catalog";
import type { HomepageBanner } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export function BannersManager({ banners }: { banners: HomepageBanner[] }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<HomepageBanner | null>(null);
  const [active, setActive] = useState(true);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await upsertBannerAction({
        id: editing?.id,
        title: String(fd.get("title") ?? ""),
        subtitle: String(fd.get("subtitle") ?? ""),
        image: String(fd.get("image") ?? ""),
        ctaLabel: String(fd.get("ctaLabel") ?? "Shop now"),
        ctaHref: String(fd.get("ctaHref") ?? "/products"),
        sortOrder: Number(fd.get("sortOrder") ?? 0),
        active,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Banner saved");
      setEditing(null);
      event.currentTarget.reset();
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Homepage banners"
        description="These rotate on the storefront hero. Inactive banners are hidden."
      />
      <form className="mb-10 max-w-xl space-y-3" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={editing?.title} key={editing?.id ?? "new"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Textarea id="subtitle" name="subtitle" rows={3} defaultValue={editing?.subtitle} key={`${editing?.id}-sub`} />
        </div>
        <Input name="image" placeholder="Image URL" defaultValue={editing?.image} key={`${editing?.id}-img`} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input name="ctaLabel" placeholder="CTA label" defaultValue={editing?.ctaLabel ?? "Shop now"} />
          <Input name="ctaHref" placeholder="CTA href" defaultValue={editing?.ctaHref ?? "/products"} />
        </div>
        <Input name="sortOrder" type="number" placeholder="Sort order" defaultValue={editing?.sortOrder ?? 0} />
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={active} onCheckedChange={(value) => setActive(value === true)} />
          Active
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{editing ? "Save banner" : "Add banner"}</Button>
          {editing ? (
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          ) : null}
        </div>
      </form>
      <ul className="divide-y divide-border border-y border-border">
        {banners.map((banner) => (
          <li key={banner.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">{banner.title}</p>
              <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {banner.active ? "Active" : "Hidden"} · {banner.ctaHref}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(banner);
                  setActive(banner.active);
                }}
              >
                Edit
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  startTransition(async () => {
                    const result = await deleteBannerAction(banner.id);
                    if (result.error) toast.error(result.error);
                    else toast.success("Deleted");
                  })
                }
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
