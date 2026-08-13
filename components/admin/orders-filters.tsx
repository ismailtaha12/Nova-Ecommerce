"use client";

import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statuses = [
  "all",
  "processing",
  "paid",
  "fulfilled",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const fulfillments = ["all", "unfulfilled", "partial", "fulfilled", "shipped"] as const;

export function OrdersFilters({
  q,
  status,
  fulfillment,
}: {
  q: string;
  status: string;
  fulfillment: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function push(next: { q?: string; status?: string; fulfillment?: string }) {
    const params = new URLSearchParams();
    const query = next.q ?? q;
    const nextStatus = next.status ?? status;
    const nextFulfillment = next.fulfillment ?? fulfillment;
    if (query) params.set("q", query);
    if (nextStatus && nextStatus !== "all") params.set("status", nextStatus);
    if (nextFulfillment && nextFulfillment !== "all") params.set("fulfillment", nextFulfillment);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  return (
    <form
      className="mb-6 flex flex-wrap gap-3"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        push({ q: String(data.get("q") ?? "").trim() });
      }}
    >
      <Input
        name="q"
        defaultValue={q}
        placeholder="Search order number"
        className="h-10 max-w-xs"
      />
      <Select value={status || "all"} onValueChange={(value) => push({ status: value ?? "all" })}>
        <SelectTrigger className="h-10 min-w-36">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((value) => (
            <SelectItem key={value} value={value}>
              {value === "all" ? "All statuses" : value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={fulfillment || "all"}
        onValueChange={(value) => push({ fulfillment: value ?? "all" })}
      >
        <SelectTrigger className="h-10 min-w-40">
          <SelectValue placeholder="Fulfillment" />
        </SelectTrigger>
        <SelectContent>
          {fulfillments.map((value) => (
            <SelectItem key={value} value={value}>
              {value === "all" ? "All fulfillment" : value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
