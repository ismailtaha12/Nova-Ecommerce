"use client";

import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/stores/auth-store";
import { NovaMark } from "@/components/navigation/nova-mark";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <form
        className="w-full max-w-sm"
        onSubmit={(e) => {
          e.preventDefault();
          login();
          router.push("/account");
        }}
      >
        <NovaMark />
        <h1 className="mt-8 text-3xl font-medium tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Demonstration account. Use any email to continue as Alex Rivera.
        </p>
        <div className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required defaultValue="alex.rivera@example.com" className="h-11" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" required defaultValue="••••••••" className="h-11" />
          </div>
          <Button type="submit" size="lg" variant="brand" className="w-full">
            Continue
          </Button>
        </div>
      </form>
    </Container>
  );
}
