"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAdmin } from "@/lib/stores/admin-store";
import { formatPrice, skuFor, stockLabel } from "@/lib/format";
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
import { toast } from "sonner";

const PAGE_SIZE = 8;

export default function AdminProductsPage() {
  const { products, archiveProduct } = useAdmin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [sort, setSort] = useState("name");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    let list = products.filter(
      (p) =>
        p.name.toLowerCase().includes(q.toLowerCase()) &&
        (cat === "all" || p.category === cat)
    );
    if (sort === "price") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "stock") list = [...list].sort((a, b) => a.stock - b.stock);
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [products, q, cat, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">{filtered.length} in catalog</p>
        </div>
        <Link href="/admin/products/new" className={cn(buttonVariants())}>
          Create product
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          className="h-10 max-w-xs"
        />
        <Select
          value={cat}
          onValueChange={(v) => {
            setCat(v ?? "all");
            setPage(0);
          }}
        >
          <SelectTrigger className="h-10 min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="audio">Audio</SelectItem>
            <SelectItem value="wearables">Wearables</SelectItem>
            <SelectItem value="lighting">Lighting</SelectItem>
            <SelectItem value="power">Power</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort(v ?? "name")}>
          <SelectTrigger className="h-10 min-w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="stock">Stock</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
            {slice.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.category}</p>
                </TableCell>
                <TableCell className="font-mono text-xs">{skuFor(p.id)}</TableCell>
                <TableCell className="tabular-nums">{formatPrice(p.price)}</TableCell>
                <TableCell>
                  <Badge variant={p.stock === 0 ? "destructive" : p.stock <= 6 ? "outline" : "secondary"}>
                    {stockLabel(p.stock)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="mr-3 text-sm underline-offset-4 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="text-sm text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      archiveProduct(p.id);
                      toast("Archived");
                    }}
                  >
                    Archive
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          Page {page + 1} of {pages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page + 1 >= pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
