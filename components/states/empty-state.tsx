import { Heart, PackageX, SearchX, ShoppingBag, WifiOff } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
      <Icon className="mb-6 size-8 text-stone" strokeWidth={1.25} />
      <h2 className="text-2xl font-medium tracking-tight">{title}</h2>
      <p className="mt-3 max-w-md text-muted-foreground">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

export function EmptyCart() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Your bag is empty"
      description="When you find something you want, it will live here."
      action={
        <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
          Shop now
        </Link>
      }
    />
  );
}

export function EmptyWishlist() {
  return (
    <EmptyState
      icon={Heart}
      title="Nothing saved yet"
      description="Tap the heart on any product to keep it here."
      action={
        <Link
          href="/products"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          Browse products
        </Link>
      }
    />
  );
}

export function EmptySearch({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={SearchX}
      title="No matching products"
      description={
        query
          ? `We could not find anything for “${query}”. Try a different word or browse the full catalog.`
          : "Try a different search or browse the catalog."
      }
      action={
        <Link
          href="/products"
          className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
        >
          View all products
        </Link>
      }
    />
  );
}

export function FailedRequest({ reset }: { reset?: () => void }) {
  return (
    <EmptyState
      icon={WifiOff}
      title="Something went wrong"
      description="We could not load this page. Check your connection and try again."
      action={
        reset ? (
          <button
            type="button"
            onClick={reset}
            className={cn(buttonVariants({ size: "lg" }))}
          >
            Try again
          </button>
        ) : null
      }
    />
  );
}

export function ProductUnavailable() {
  return (
    <EmptyState
      icon={PackageX}
      title="This product is unavailable"
      description="It may have been archived or has not launched yet."
      action={
        <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
          Continue shopping
        </Link>
      }
    />
  );
}
