"use client";

import Link from "next/link";
import { useAuth } from "@/lib/stores/auth-store";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return (
      <div className="py-16 text-center">
        <h1 className="text-3xl font-medium tracking-tight">Sign in to continue</h1>
        <p className="mt-3 text-muted-foreground">
          Account, orders, and wishlist live behind a demonstration sign-in.
        </p>
        <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex")}>
          Sign in
        </Link>
      </div>
    );
  }
  return <>{children}</>;
}
