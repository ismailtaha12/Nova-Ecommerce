import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { KpiCard } from "@/components/admin/kpi-card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAdminDashboard } from "@/lib/data-access/admin";
import { categoryName } from "@/lib/catalog";
import { formatCompact, formatDate, formatPrice, stockLabel } from "@/lib/format";

export default async function AdminDashboardPage() {
  const dashboard = await getAdminDashboard();

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="What needs attention today, plus store totals."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatPrice(dashboard.revenue)} href="/admin/analytics" />
        <KpiCard
          label="Orders"
          value={formatCompact(dashboard.orders)}
          hint={`Avg. ${formatPrice(dashboard.aov)} per order`}
          href="/admin/orders"
        />
        <KpiCard
          label="Customers"
          value={formatCompact(dashboard.customers)}
          href="/admin/customers"
        />
        <KpiCard label="AOV" value={formatPrice(dashboard.aov)} href="/admin/analytics" />
      </div>

      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-sm font-medium">Needs fulfillment</h2>
            <Link href="/admin/orders?fulfillment=unfulfilled" className="text-xs underline-offset-4 hover:underline">
              View unfulfilled
            </Link>
          </div>
          {dashboard.attentionOrders.length === 0 ? (
            <p className="border border-border px-4 py-8 text-sm text-muted-foreground">
              No open fulfillment work.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.attentionOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                          {order.number}
                        </Link>
                        <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>
                      </TableCell>
                      <TableCell className="text-sm">{order.customerName || order.customerEmail}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatPrice(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <h2 className="text-sm font-medium">Low stock</h2>
            <Link href="/admin/inventory" className="text-xs underline-offset-4 hover:underline">
              Inventory
            </Link>
          </div>
          {dashboard.lowStock.length === 0 ? (
            <p className="border border-border px-4 py-8 text-sm text-muted-foreground">
              All active products are above 6 units.
            </p>
          ) : (
            <div className="overflow-x-auto border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.lowStock.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Link
                          href={`/admin/products/${product.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {categoryName(product.category)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.stock === 0 ? "destructive" : "outline"}>
                          {stockLabel(product.stock)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <h2 className="text-sm font-medium">Recent orders</h2>
          <Link href="/admin/orders" className="text-xs underline-offset-4 hover:underline">
            All orders
          </Link>
        </div>
        {dashboard.recentOrders.length === 0 ? (
          <p className="border border-border px-4 py-8 text-sm text-muted-foreground">
            No orders yet.
          </p>
        ) : (
          <div className="overflow-x-auto border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                        {order.number}
                      </Link>
                      <p className="text-xs text-muted-foreground">{formatDate(order.date)}</p>
                    </TableCell>
                    <TableCell className="text-sm">{order.customerName || order.customerEmail}</TableCell>
                    <TableCell className="capitalize">{order.status}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatPrice(order.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
