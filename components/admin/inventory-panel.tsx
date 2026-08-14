"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { adjustStockAction } from "@/lib/actions/admin";
import { formatDate, skuFor } from "@/lib/format";
import type { InventoryLog, Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export function InventoryPanel({
  products,
  logs,
}: {
  products: Product[];
  logs: InventoryLog[];
}) {
  const [q, setQ] = useState("");
  const [stock, setStock] = useState("low");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [qtyById, setQtyById] = useState<Record<string, string>>({});
  const [reasonById, setReasonById] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const rows = products.flatMap((product) =>
      (product.variants.length
        ? product.variants
        : [{ id: product.id, name: "Standard", stock: product.stock, skuKey: product.id, options: {}, sortOrder: 0 }]
      ).map(
        (variant) => ({
          product,
          variantId: variant.id,
          name: `${product.name} · ${variant.name}`,
          sku: variant.skuKey ? `NV-${variant.skuKey.toUpperCase()}` : skuFor(product.id),
          stock: variant.stock,
        }),
      ),
    );
    return rows.filter((row) => {
      if (q && !row.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (stock === "low") return row.stock <= 6;
      if (stock === "out") return row.stock === 0;
      return true;
    });
  }, [products, q, stock]);

  function apply(productId: string, variantId: string) {
    const key = variantId;
    const qty = Number(qtyById[key] ?? "0");
    if (!Number.isInteger(qty) || qty === 0) {
      toast.error("Enter a non-zero whole number (negative to reduce).");
      return;
    }
    const reason = (reasonById[key] ?? "").trim() || (qty > 0 ? "Restock" : "Manual adjustment");
    setPendingKey(key);
    startTransition(async () => {
      const result = await adjustStockAction(productId, qty, reason, variantId);
      setPendingKey(null);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(qty > 0 ? `Restocked +${qty}` : `Reduced ${qty}`);
    });
  }

  return (
    <div>
      <AdminPageHeader
        title="Inventory"
        description="Low stock is 6 units or fewer. Adjust with a custom quantity and reason."
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Input
          placeholder="Search products"
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-10 max-w-xs"
        />
        <Select value={stock} onValueChange={(value) => setStock(value ?? "low")}>
          <SelectTrigger className="h-10 min-w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low stock</SelectItem>
            <SelectItem value="out">Out of stock</SelectItem>
            <SelectItem value="all">All products</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                  No products match this filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((row) => (
                <TableRow key={row.variantId}>
                  <TableCell className="font-medium">{row.name}</TableCell>
                  <TableCell className="font-mono text-xs">{row.sku}</TableCell>
                  <TableCell className="tabular-nums">{row.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.stock === 0
                          ? "destructive"
                          : row.stock <= 6
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        row.stock > 0 && row.stock <= 6
                          ? "border-ember text-ember"
                          : undefined
                      }
                    >
                      {row.stock === 0
                        ? "Out of stock"
                        : row.stock <= 6
                          ? "Low stock"
                          : "In stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      <Input
                        type="number"
                        className="h-8 w-20"
                        placeholder="+/-"
                        value={qtyById[row.variantId] ?? ""}
                        onChange={(event) =>
                          setQtyById((current) => ({
                            ...current,
                            [row.variantId]: event.target.value,
                          }))
                        }
                      />
                      <Input
                        className="h-8 w-36"
                        placeholder="Reason"
                        value={reasonById[row.variantId] ?? ""}
                        onChange={(event) =>
                          setReasonById((current) => ({
                            ...current,
                            [row.variantId]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending && pendingKey === row.variantId}
                        onClick={() => apply(row.product.id, row.variantId)}
                      >
                        Apply
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <h2 className="mt-12 text-lg font-medium">Recent changes</h2>
      {logs.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No inventory changes yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
          {logs.map((log) => (
            <li key={log.id} className="flex justify-between py-3">
              <span>
                {log.sku} · {log.reason}
              </span>
              <span className={log.change < 0 ? "text-ember tabular-nums" : "tabular-nums"}>
                {log.change > 0 ? "+" : ""}
                {log.change} · {formatDate(log.date)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
