"use client";

import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export function CustomersSearch({
  q,
  placeholder = "Search name or email",
}: {
  q: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <form
      className="mb-6"
      onSubmit={(event) => {
        event.preventDefault();
        const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(value ? `${pathname}?q=${encodeURIComponent(value)}` : pathname);
      }}
    >
      <Input
        name="q"
        defaultValue={q}
        placeholder={placeholder}
        className="h-10 max-w-sm"
      />
    </form>
  );
}
