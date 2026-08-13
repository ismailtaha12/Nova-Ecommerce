"use client";

import { cn } from "@/lib/utils";
import type { ProductColor } from "@/lib/types";

export function ColorSwatches({
  colors,
  value,
  onChange,
  size = "md",
}: {
  colors: ProductColor[];
  value?: string;
  onChange?: (name: string) => void;
  size?: "sm" | "md";
}) {
  const interactive = Boolean(onChange);

  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role={interactive ? "radiogroup" : "list"}
      aria-label="Colors"
    >
      {colors.map((color) => {
        const selected = value === color.name;
        const Comp = interactive ? "button" : "span";
        return (
          <Comp
            key={color.name}
            type={interactive ? "button" : undefined}
            role={interactive ? "radio" : "listitem"}
            aria-label={color.name}
            aria-checked={interactive ? selected : undefined}
            title={color.name}
            onClick={interactive ? () => onChange?.(color.name) : undefined}
            className={cn(
              "rounded-full border border-border/80 ring-offset-2 ring-offset-background transition-shadow",
              size === "sm" ? "size-4" : "size-6",
              selected && "ring-2 ring-foreground",
              interactive && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ember"
            )}
            style={{ backgroundColor: color.hex }}
          />
        );
      })}
    </div>
  );
}
