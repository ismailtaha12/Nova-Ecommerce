"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { archiveProductAction, restoreProductAction } from "@/lib/actions/admin";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { categoryName } from "@/lib/catalog";
import { formatPrice, skuFor, stockLabel } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Package } from "lucide-react";
import { EmptyState } from "@/components/states/empty-state";

const PAGE_SIZE = 8;

export function ProductsTable({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? "";
  const cat = searchParams.get("category") ?? "all";
  const stock = searchParams.get("stock") ?? "all";
  const archived = searchParams.get("archived") === "1";
  const sort = searchParams.get("sort") ?? "name";
  const [page, setPage] = useState(0);
  const [, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all" || (key === "archived" && value !== "1")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    setPage(0);
    startTransition(() => {
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  const filtered = useMemo(() => {
    let list = products.filter((product) => {
      const isArchived = Boolean(product.archived);
      if (archived !== isArchived) return false;
      if (q && !product.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (cat !== "all" && product.category !== cat) return false;
      if (stock === "low" && !(product.stock > 0 && product.stock <= 6)) return false;
      if (stock === "out" && product.stock !== 0) return false;
      return true;
    });
    if (sort === "price") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "stock") list = [...list].sort((a, b) => a.stock - b.stock);
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, q, cat, sort, stock, archived]);

  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      if (product.category) seen.set(product.category, categoryName(product.category));
    }
    return [...seen.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [products]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const slice = filtered.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${filtered.length} ${archived ? "archived" : "in catalog"}`}
        action={
          <Link href="/admin/products/new" className={cn(buttonVariants())}>
            Create product
          </Link>
        }
      />
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search"
          defaultValue={q}
          onChange={(event) => setParam("q", event.target.value)}
          className="h-10 max-w-xs"
        />
        <Select value={cat} onValueChange={(value) => setParam("category", value ?? "all")}>
          <SelectTrigger className="h-10 min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categoryOptions.map(([slug, name]) => (
              <SelectItem key={slug} value={slug}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stock} onValueChange={(value) => setParam("stock", value ?? "all")}>
          <SelectTrigger className="h-10 min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stock</SelectItem>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(value) => setParam("sort", value ?? "name")}>
          <SelectTrigger className="h-10 min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant={archived ? "default" : "outline"}
          className="h-10"
          onClick={() => setParam("archived", archived ? "" : "1")}
        >
          {archived ? "Viewing archived" : "Archived"}
        </Button>
      </div>
      {slice.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try another search, or create a product."
          action={
            <Link href="/admin/products/new" className={cn(buttonVariants({ variant: "outline" }))}>
              Create product
            </Link>
          }
        />
      ) : (
        <>
          <div className="mt-6 overflow-x-auto border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden bg-muted">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : null}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {categoryName(product.category)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{skuFor(product.id)}</TableCell>
                    <TableCell className="tabular-nums">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stock === 0
                            ? "destructive"
                            : product.stock <= 6
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {stockLabel(product.stock)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="mr-3 text-sm underline-offset-4 hover:underline"
                      >
                        Edit
                      </Link>
                      {product.archived ? (
                        <RestoreButton id={product.id} />
                      ) : (
                        <ArchiveButton id={product.id} />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Page {currentPage + 1} of {pages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 0}
                onClick={() => setPage((value) => value - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage + 1 >= pages}
                onClick={() => setPage((value) => value + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ArchiveButton({ id }: { id: string }) {
  return (
    <ConfirmAction
      title="Archive this product?"
      description="It will disappear from the storefront. You can restore it from the archived list."
      confirmLabel="Archive"
      destructive
      onConfirm={async () => {
        const result = await archiveProductAction(id);
        if (result.error) return result;
        toast.success("Archived");
      }}
    >
      {({ open, pending }) => (
        <button
          type="button"
          className="text-sm text-muted-foreground hover:text-destructive disabled:opacity-50"
          disabled={pending}
          onClick={open}
        >
          Archive
        </button>
      )}
    </ConfirmAction>
  );
}

function RestoreButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      className="text-sm underline-offset-4 hover:underline disabled:opacity-50"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await restoreProductAction(id);
          if (result.error) {
            toast.error(result.error);
            return;
          }
          toast.success("Restored");
        });
      }}
    >
      Restore
    </button>
  );
}
