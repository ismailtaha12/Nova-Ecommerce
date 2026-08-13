import { cn } from "@/lib/utils";

export function NovaMark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 32 32"
        aria-hidden="true"
        className={cn(
          "shrink-0 text-foreground",
          compact ? "size-5" : "size-6"
        )}
      >
        <path
          fill="currentColor"
          d="M16 2.5 20.8 11.2 29.5 16 20.8 20.8 16 29.5 11.2 20.8 2.5 16 11.2 11.2 16 2.5Z"
        />
        <path
          fill="currentColor"
          fillOpacity="0.35"
          d="M16 8.2 18.7 13.3 23.8 16 18.7 18.7 16 23.8 13.3 18.7 8.2 16 13.3 13.3 16 8.2Z"
        />
      </svg>
      <span
        className={cn(
          "font-medium tracking-[0.28em] text-foreground",
          compact ? "text-[11px]" : "text-xs"
        )}
      >
        NOVA
      </span>
    </span>
  );
}
