"use client";

import { useState, useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { deleteCouponAction, upsertCouponAction } from "@/lib/actions/catalog";
import type { Coupon } from "@/lib/types";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function CouponsManager({ coupons }: { coupons: Coupon[] }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [active, setActive] = useState(true);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await upsertCouponAction({
        id: editing?.id,
        code: String(fd.get("code") ?? ""),
        description: String(fd.get("description") ?? ""),
        type: String(fd.get("type") ?? "percent"),
        amount: Number(fd.get("amount")),
        minSubtotal: Number(fd.get("minSubtotal") || 0),
        maxUses: String(fd.get("maxUses") ?? "").trim() === "" ? null : Number(fd.get("maxUses")),
        active,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Coupon saved");
      setEditing(null);
      event.currentTarget.reset();
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description="Codes are applied at checkout. Percent or fixed-amount discounts."
      />
      <form className="mb-10 grid max-w-xl gap-3" onSubmit={onSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" required defaultValue={editing?.code} key={editing?.id ?? "new"} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              name="type"
              defaultValue={editing?.type ?? "percent"}
              className="h-11 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              <option value="percent">Percent</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </div>
        </div>
        <Input name="description" placeholder="Description" defaultValue={editing?.description} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="amount" type="number" min="0" step="0.01" required placeholder="Amount" defaultValue={editing?.amount} />
          <Input name="minSubtotal" type="number" min="0" step="0.01" placeholder="Min subtotal" defaultValue={editing?.minSubtotal} />
          <Input name="maxUses" type="number" min="1" placeholder="Max uses" defaultValue={editing?.maxUses ?? ""} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={active} onCheckedChange={(value) => setActive(value === true)} />
          Active
        </label>
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{editing ? "Save coupon" : "Add coupon"}</Button>
          {editing ? (
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          ) : null}
        </div>
      </form>
      <ul className="divide-y divide-border border-y border-border">
        {coupons.map((coupon) => (
          <li key={coupon.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium">{coupon.code}</p>
              <p className="text-sm text-muted-foreground">{coupon.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {coupon.type === "percent" ? `${coupon.amount}%` : `$${coupon.amount}`}
                {coupon.minSubtotal > 0 ? ` · min $${coupon.minSubtotal}` : ""}
                {` · ${coupon.uses}${coupon.maxUses != null ? `/${coupon.maxUses}` : ""} used`}
                {coupon.active ? "" : " · inactive"}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing(coupon);
                  setActive(coupon.active);
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
                    const result = await deleteCouponAction(coupon.id);
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
