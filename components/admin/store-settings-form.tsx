"use client";

import { useTransition, type FormEvent } from "react";
import { toast } from "sonner";
import { updateStoreSettingsAction } from "@/lib/actions/admin";
import type { SessionUser, StoreSettings } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";

export function StoreSettingsForm({
  settings,
  user,
}: {
  settings: StoreSettings;
  user: SessionUser;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    startTransition(async () => {
      const result = await updateStoreSettingsAction({
        storeName: String(fd.get("storeName") ?? ""),
        origin: String(fd.get("origin") ?? ""),
        supportEmail: String(fd.get("supportEmail") ?? ""),
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
          <Input
            id="storeName"
            name="storeName"
            required
            defaultValue={settings.storeName}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" name="origin" required defaultValue={settings.origin} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="supportEmail">Support email</Label>
          <Input
            id="supportEmail"
            name="supportEmail"
            type="email"
            required
            defaultValue={settings.supportEmail}
            className="h-11"
          />
        </div>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {settings.updatedAt && new Date(settings.updatedAt).getTime() > 0 ? (
          <p className="text-xs text-muted-foreground">
            Last saved {formatDate(settings.updatedAt)}
          </p>
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
