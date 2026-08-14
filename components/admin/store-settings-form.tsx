"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { updateStoreSettingsAction } from "@/lib/actions/admin";
import type { SessionUser, StoreSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { formatDate } from "@/lib/format";
import { useState } from "react";

export function StoreSettingsForm({
  settings,
  user,
}: {
  settings: StoreSettings;
  user: SessionUser;
}) {
  const [pending, startTransition] = useTransition();
  const [demoMode, setDemoMode] = useState(settings.demoMode);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateStoreSettingsAction({
        storeName: String(fd.get("storeName") ?? ""),
        origin: String(fd.get("origin") ?? ""),
        supportEmail: String(fd.get("supportEmail") ?? ""),
        taxRate: Number(fd.get("taxRate")),
        freeShippingThreshold: Number(fd.get("freeShippingThreshold")),
        fallbackStandardShipping: Number(fd.get("fallbackStandardShipping")),
        fallbackExpressShipping: Number(fd.get("fallbackExpressShipping")),
        fallbackOvernightShipping: Number(fd.get("fallbackOvernightShipping")),
        originName: String(fd.get("originName") ?? ""),
        originLine1: String(fd.get("originLine1") ?? ""),
        originCity: String(fd.get("originCity") ?? ""),
        originState: String(fd.get("originState") ?? ""),
        originZip: String(fd.get("originZip") ?? ""),
        originCountry: String(fd.get("originCountry") ?? ""),
        demoMode,
      });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Store settings saved");
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form className="max-w-md space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="storeName">Store name</Label>
          <Input id="storeName" name="storeName" required defaultValue={settings.storeName} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="origin">Origin (display)</Label>
          <Input id="origin" name="origin" required defaultValue={settings.origin} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportEmail">Support email</Label>
          <Input id="supportEmail" name="supportEmail" type="email" required defaultValue={settings.supportEmail} className="h-11" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax rate</Label>
            <Input id="taxRate" name="taxRate" type="number" step="0.001" min="0" max="1" required defaultValue={settings.taxRate} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="freeShippingThreshold">Free shipping at</Label>
            <Input id="freeShippingThreshold" name="freeShippingThreshold" type="number" min="0" required defaultValue={settings.freeShippingThreshold} className="h-11" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Input name="fallbackStandardShipping" type="number" min="0" defaultValue={settings.fallbackStandardShipping} aria-label="Standard shipping" />
          <Input name="fallbackExpressShipping" type="number" min="0" defaultValue={settings.fallbackExpressShipping} aria-label="Express shipping" />
          <Input name="fallbackOvernightShipping" type="number" min="0" defaultValue={settings.fallbackOvernightShipping} aria-label="Overnight shipping" />
        </div>
        <p className="text-xs text-muted-foreground">Warehouse address used for Shippo labels</p>
        <Input name="originName" defaultValue={settings.originName} placeholder="Origin name" />
        <Input name="originLine1" defaultValue={settings.originLine1} placeholder="Street" />
        <div className="grid gap-3 sm:grid-cols-4">
          <Input name="originCity" defaultValue={settings.originCity} placeholder="City" />
          <Input name="originState" defaultValue={settings.originState} placeholder="State" />
          <Input name="originZip" defaultValue={settings.originZip} placeholder="ZIP" />
          <Input name="originCountry" defaultValue={settings.originCountry} placeholder="Country" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={demoMode} onCheckedChange={(value) => setDemoMode(value === true)} />
          Demo mode (auto-confirm email, skip Stripe if unset)
        </label>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {settings.updatedAt && new Date(settings.updatedAt).getTime() > 0 ? (
          <p className="text-xs text-muted-foreground">Last saved {formatDate(settings.updatedAt)}</p>
        ) : null}
      </form>
      <div className="border border-border p-5">
        <h2 className="text-sm font-medium">Signed in as</h2>
        <p className="mt-3 text-sm">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{user.role}</p>
      </div>
    </div>
  );
}
