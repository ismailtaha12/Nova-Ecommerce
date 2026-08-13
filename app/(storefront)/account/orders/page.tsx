"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/stores/auth-store";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default function OrdersPage() {
  const { orders } = useAuth();
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Orders</h1>
      <ul className="mt-8 divide-y divide-border border-y border-border">
        {orders.map((order) => (
          <li key={order.id}>
            <Link href={`/account/orders/${order.id}`} className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center">
              <div className="flex -space-x-3">
                {order.items.slice(0, 3).map((item) => (
                  <span key={item.slug} className="relative size-14 overflow-hidden border border-background bg-muted">
                    <Image src={item.image} alt="" fill className="object-cover" sizes="56px" />
                  </span>
                ))}
              </div>
              <div className="flex-1">
                <p className="font-medium">{order.number}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(order.date)} · {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </p>
              </div>
              <Badge variant="secondary">{order.status}</Badge>
              <p className="text-sm tabular-nums">{formatPrice(order.total)}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
