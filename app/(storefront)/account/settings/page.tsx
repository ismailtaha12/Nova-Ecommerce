"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { signOutAction } from "@/lib/actions/auth";

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Settings</h1>
      <div className="mt-8 max-w-md space-y-6">
        <label className="flex items-start gap-3 text-sm">
          <Checkbox defaultChecked />
          <span>
            <span className="block font-medium">Order updates</span>
            <span className="text-muted-foreground">Email when an order ships.</span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <Checkbox defaultChecked />
          <span>
            <span className="block font-medium">Product news</span>
            <span className="text-muted-foreground">Occasional notes on new hardware.</span>
          </span>
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            toast.success("Preferences saved");
          }}
        >
          Save preferences
        </Button>
        <div className="border-t border-border pt-6">
          <form action={signOutAction}>
            <Button type="submit" variant="ghost">
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
