import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48 rounded-none" />
        <Skeleton className="h-4 w-72 rounded-none" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-10 w-56 rounded-none" />
        <Skeleton className="h-10 w-36 rounded-none" />
      </div>
      <Skeleton className="h-80 w-full rounded-none" />
    </div>
  );
}
