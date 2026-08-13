"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
      <form
        className="mt-8 max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          toast.success("Store settings saved");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="store">Store name</Label>
          <Input id="store" defaultValue="Nova" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="origin">Origin</Label>
          <Input id="origin" defaultValue="Oakland, CA" className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="support">Support email</Label>
          <Input id="support" type="email" defaultValue="support@nova.example" className="h-11" />
        </div>
        <Button type="submit" size="lg">
          Save
        </Button>
      </form>
    </div>
  );
}
