"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovaMark } from "@/components/navigation/nova-mark";
import { signInAction, signUpAction } from "@/lib/actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await signInAction(new FormData(event.currentTarget));
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  async function onSignUp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await signUpAction(new FormData(event.currentTarget));
    if (result && "needsConfirm" in result && result.needsConfirm) {
      setError(result.error);
      setPending(false);
      return;
    }
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <NovaMark />
      <h1 className="mt-8 text-3xl font-medium tracking-tight">Welcome</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sign in or create an account to manage orders and wishlist.
      </p>

      <Tabs defaultValue="signin" className="mt-8" onValueChange={() => setError(null)}>
        <TabsList className="w-full">
          <TabsTrigger value="signin">Sign in</TabsTrigger>
          <TabsTrigger value="signup">Create account</TabsTrigger>
        </TabsList>

        <TabsContent value="signin" className="pt-6">
          <form className="space-y-4" onSubmit={onSignIn}>
            <input type="hidden" name="next" value={next} />
            <div className="space-y-2">
              <Label htmlFor="signin-email">Email</Label>
              <Input
                id="signin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signin-password">Password</Label>
              <Input
                id="signin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
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
              {pending ? "Signing in…" : "Sign in"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link href="/login/reset" className="underline-offset-4 hover:underline">
                Forgot password?
              </Link>
            </p>
          </form>
        </TabsContent>

        <TabsContent value="signup" className="pt-6">
          <form className="space-y-4" onSubmit={onSignUp}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  required
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <Input
                id="signup-password"
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
              {pending ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
