import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
      <Skeleton className="h-4 w-2/3 rounded-none" />
      <Skeleton className="h-3 w-1/2 rounded-none" />
      <Skeleton className="h-3 w-1/4 rounded-none" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function PageHeroSkeleton() {
  return (
    <div className="grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
      <div className="space-y-4">
        <Skeleton className="h-16 w-4/5 rounded-none" />
        <Skeleton className="h-4 w-3/5 rounded-none" />
        <Skeleton className="h-12 w-40 rounded-none" />
      </div>
      <Skeleton className="aspect-[4/5] w-full rounded-none" />
    </div>
  );
}
