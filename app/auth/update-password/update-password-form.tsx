"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovaMark } from "@/components/navigation/nova-mark";
import { updatePasswordAction } from "@/lib/actions/auth";

export function UpdatePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await updatePasswordAction(new FormData(event.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <NovaMark />
      <h1 className="mt-8 text-3xl font-medium tracking-tight">New password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose a password with at least 8 characters.
      </p>
      <form className="mt-8 space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            className="h-11"
          />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button
          type="submit"
          size="lg"
          variant="brand"
          className="w-full"
          disabled={pending}
        >
          {pending ? "Updating…" : "Update password"}
        </Button>
      </form>
    </div>
  );
}
