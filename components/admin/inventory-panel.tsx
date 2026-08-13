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
    return products.filter((product) => {
      if (q && !product.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (stock === "low") return product.stock <= 6;
      if (stock === "out") return product.stock === 0;
      return true;
    });
  }, [products, q, stock]);

  function apply(id: string) {
    const qty = Number(qtyById[id] ?? "0");
    if (!Number.isInteger(qty) || qty === 0) {
      toast.error("Enter a non-zero whole number (negative to reduce).");
      return;
    }
    const reason = (reasonById[id] ?? "").trim() || (qty > 0 ? "Restock" : "Manual adjustment");
    setPendingKey(id);
    startTransition(async () => {
      const result = await adjustStockAction(id, qty, reason);
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
              filtered.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono text-xs">{skuFor(product.id)}</TableCell>
                  <TableCell className="tabular-nums">{product.stock}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.stock === 0
                          ? "destructive"
                          : product.stock <= 6
                            ? "outline"
                            : "secondary"
                      }
                      className={
                        product.stock > 0 && product.stock <= 6
                          ? "border-ember text-ember"
                          : undefined
                      }
                    >
                      {product.stock === 0
                        ? "Out of stock"
                        : product.stock <= 6
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
                        value={qtyById[product.id] ?? ""}
                        onChange={(event) =>
                          setQtyById((current) => ({
                            ...current,
                            [product.id]: event.target.value,
                          }))
                        }
                      />
                      <Input
                        className="h-8 w-36"
                        placeholder="Reason"
                        value={reasonById[product.id] ?? ""}
                        onChange={(event) =>
                          setReasonById((current) => ({
                            ...current,
                            [product.id]: event.target.value,
                          }))
                        }
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={pending && pendingKey === product.id}
                        onClick={() => apply(product.id)}
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
