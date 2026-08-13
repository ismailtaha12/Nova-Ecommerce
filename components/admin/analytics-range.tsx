"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { AnalyticsRange } from "@/lib/types";

const ranges: { value: AnalyticsRange; label: string }[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

export function AnalyticsRangeLinks({ range }: { range: AnalyticsRange }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap gap-2">
      {ranges.map((item) => (
        <Link
          key={item.value}
          href={item.value === "all" ? pathname : `${pathname}?range=${item.value}`}
          className={cn(
            "border px-3 py-1.5 text-xs",
            range === item.value
              ? "border-foreground bg-foreground text-background"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
