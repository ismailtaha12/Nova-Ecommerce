"use client";

import Link from "next/link";
import { orders } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Orders</h1>
      <div className="mt-8 overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Fulfillment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o) => (
              <TableRow key={o.id}>
                <TableCell>
                  <Link href={`/account/orders/${o.id}`} className="font-medium hover:underline">
                    {o.number}
                  </Link>
                </TableCell>
                <TableCell>{formatDate(o.date)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{o.paymentStatus}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{o.fulfillmentStatus}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{formatPrice(o.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
