"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  id,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  id?: string;
}) {
  return (
    <div className="inline-flex items-center border border-border">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-none"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus />
      </Button>
      <input
        id={id}
        aria-label="Quantity"
        className="w-10 bg-transparent text-center text-sm tabular-nums outline-none"
        value={value}
        readOnly
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-none"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus />
      </Button>
    </div>
  );
}
