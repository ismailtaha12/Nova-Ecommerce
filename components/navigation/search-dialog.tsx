"use client";

import { useRouter } from "next/navigation";
import type { ProductSummary } from "@/lib/data-access/products";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCart } from "@/lib/stores/cart-store";
import { formatPrice } from "@/lib/format";

export function SearchDialog({ products }: { products: ProductSummary[] }) {
  const { searchOpen, setSearchOpen } = useCart();
  const router = useRouter();

  return (
    <CommandDialog
      open={searchOpen}
      onOpenChange={setSearchOpen}
      title="Search Nova"
      description="Find products by name"
    >
      <Command>
        <CommandInput placeholder="Search products…" />
        <CommandList>
          <CommandEmpty>No products found.</CommandEmpty>
          <CommandGroup heading="Products">
            {products.map((p) => (
              <CommandItem
                key={p.id}
                value={`${p.name} ${p.tagline} ${p.category}`}
                onSelect={() => {
                  setSearchOpen(false);
                  router.push(`/products/${p.slug}`);
                }}
              >
                <span className="flex-1">{p.name}</span>
                <span className="text-muted-foreground tabular-nums">
                  {formatPrice(p.price)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
