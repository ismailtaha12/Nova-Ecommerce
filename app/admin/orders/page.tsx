import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrdersFilters } from "@/components/admin/orders-filters";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAllOrders } from "@/lib/data-access/orders";
import { formatDate, formatPrice } from "@/lib/format";
import type { FulfillmentStatus, OrderStatus } from "@/lib/types";
import { ShoppingBag } from "lucide-react";

const orderStatuses: OrderStatus[] = [
  "processing",
  "paid",
  "fulfilled",
  "shipped",
  "delivered",
  "cancelled",
];
const fulfillmentStatuses: FulfillmentStatus[] = [
  "unfulfilled",
  "partial",
  "fulfilled",
  "shipped",
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; fulfillment?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = orderStatuses.includes(params.status as OrderStatus)
    ? (params.status as OrderStatus)
    : "all";
  const fulfillment = fulfillmentStatuses.includes(params.fulfillment as FulfillmentStatus)
    ? (params.fulfillment as FulfillmentStatus)
    : "all";

  const orders = await listAllOrders({ q, status, fulfillment });
  const filtered = Boolean(q || status !== "all" || fulfillment !== "all");

  return (
    <div>
      <AdminPageHeader
        title="Orders"
        description="Fulfill, ship, or cancel from the order detail."
      />
      <OrdersFilters q={q} status={status} fulfillment={fulfillment} />
      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title={filtered ? "No matching orders" : "No orders yet"}
          description={
            filtered
              ? "Try a different order number or clear the filters."
              : "When customers check out, orders will show up here."
          }
        />
      ) : (
        <div className="overflow-x-auto border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Fulfillment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-medium hover:underline"
                    >
                      {order.number}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{order.customerName || "Customer"}</p>
                    <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                  </TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{order.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{order.fulfillmentStatus}</Badge>
                  </TableCell>
                  <TableCell className="capitalize">{order.status}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatPrice(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
