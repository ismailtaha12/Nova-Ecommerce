"use client";

import { toast } from "sonner";
import { useAuth } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Profile</h1>
      <form
        className="mt-8 max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          updateProfile({
            firstName: String(fd.get("firstName")),
            lastName: String(fd.get("lastName")),
            email: String(fd.get("email")),
            phone: String(fd.get("phone")),
          });
          toast.success("Profile saved");
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" name="firstName" defaultValue={user.firstName} className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" name="lastName" defaultValue={user.lastName} className="h-11" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={user.email} className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={user.phone} className="h-11" />
        </div>
        <Button type="submit" size="lg">
          Save
        </Button>
      </form>
    </div>
  );
}
