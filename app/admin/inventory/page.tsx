"use client";

import { useAdmin } from "@/lib/stores/admin-store";
import { inventoryLogs } from "@/lib/data";
import { skuFor, stockLabel } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function InventoryPage() {
  const { products, adjustStock } = useAdmin();

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Inventory</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Low stock at 6 units or fewer. Halo Mini is currently sold through.
      </p>
      <div className="mt-8 overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>State</TableHead>
              <TableHead className="text-right">Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="font-mono text-xs">{skuFor(p.id)}</TableCell>
                <TableCell className="tabular-nums">{p.stock}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      p.stock === 0 ? "destructive" : p.stock <= 6 ? "outline" : "secondary"
                    }
                    className={p.stock > 0 && p.stock <= 6 ? "border-ember text-ember" : undefined}
                  >
                    {p.stock === 0 ? "Out of stock" : p.stock <= 6 ? "Low stock" : "In stock"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      adjustStock(p.id, -1);
                      toast("Stock updated");
                    }}
                  >
                    −1
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ml-2"
                    onClick={() => {
                      adjustStock(p.id, 10);
                      toast("Restocked +10");
                    }}
                  >
                    +10
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <h2 className="mt-12 text-lg font-medium">Recent changes</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border text-sm">
        {inventoryLogs.map((log) => (
          <li key={log.id} className="flex justify-between py-3">
            <span>
              {log.sku} · {log.reason}
            </span>
            <span className={log.change < 0 ? "text-ember tabular-nums" : "tabular-nums"}>
              {log.change > 0 ? "+" : ""}
              {log.change} · {log.date}
            </span>
          </li>
        ))}
      </ul>
      <p className="sr-only">{stockLabel(0)}</p>
    </div>
  );
}
