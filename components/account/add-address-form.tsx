"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createAddressAction } from "@/lib/actions/addresses";

export function AddAddressForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = event.currentTarget;
    const fd = new FormData(form);
    const result = await createAddressAction({
      label: String(fd.get("label") || "Home"),
      name: String(fd.get("name") || ""),
      line1: String(fd.get("line1") || ""),
      line2: String(fd.get("line2") || "") || undefined,
      city: String(fd.get("city") || ""),
      state: String(fd.get("state") || ""),
      zip: String(fd.get("zip") || ""),
      country: String(fd.get("country") || "United States"),
      isDefault: fd.get("isDefault") === "on",
    });
    setPending(false);
    if (result && "error" in result && result.error) {
      setError(result.error);
      return;
    }
    form.reset();
    toast.success("Address saved");
    router.refresh();
  }

  return (
    <form className="mt-12 max-w-lg space-y-4" onSubmit={onSubmit}>
      <h2 className="text-lg font-medium">Add address</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="label">Label</Label>
          <Input id="label" name="label" defaultValue="Home" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required className="h-11" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="line1">Street address</Label>
        <Input id="line1" name="line1" required className="h-11" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="line2">Apartment, suite (optional)</Label>
        <Input id="line2" name="line2" className="h-11" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" required className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="zip">ZIP</Label>
          <Input id="zip" name="zip" required className="h-11" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="country">Country</Label>
        <Input id="country" name="country" defaultValue="United States" className="h-11" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" />
        Set as default
      </label>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : "Save address"}
      </Button>
    </form>
  );
}
