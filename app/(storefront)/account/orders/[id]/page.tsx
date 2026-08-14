import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/lib/data-access/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  return { title: order?.number ?? "Order" };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div>
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Order</p>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-3xl font-medium tracking-tight">{order.number}</h1>
        <p className="text-sm text-muted-foreground">{formatDate(order.date)}</p>
      </div>
      <div className="mt-4 flex gap-2">
        <Badge variant="secondary">Payment {order.paymentStatus}</Badge>
        <Badge variant="outline">Fulfillment {order.fulfillmentStatus}</Badge>
      </div>

      <ol className="mt-10 space-y-4">
        {order.timeline.map((event) => (
          <li key={event.label} className="flex gap-4">
            <span
              className={cn(
                "mt-1 size-2.5 shrink-0 rounded-full",
                event.complete ? "bg-ember" : "bg-border"
              )}
            />
            <div>
              <p className="text-sm font-medium">{event.label}</p>
              {event.date ? (
                <p className="text-xs text-muted-foreground">{formatDate(event.date)}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Pending</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      <h2 className="mt-12 text-lg font-medium">Items</h2>
      <ul className="mt-4 divide-y divide-border border-y border-border">
        {order.items.map((item) => (
          <li key={item.slug + item.variant} className="flex gap-4 py-4">
            <Link href={`/products/${item.slug}`} className="relative size-20 overflow-hidden bg-muted">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              ) : null}
            </Link>
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.variant} · Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm tabular-nums">{formatPrice(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="mt-10 grid gap-10 sm:grid-cols-2">
        <div>
          <h2 className="text-lg font-medium">Shipping address</h2>
          <address className="mt-3 text-sm not-italic text-muted-foreground leading-relaxed">
            {order.shippingAddress.name}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 ? (
              <>
                <br />
                {order.shippingAddress.line2}
              </>
            ) : null}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
          </address>
          {order.trackingUrl ? (
            <p className="mt-4 text-sm">
              Tracking:{" "}
              <a href={order.trackingUrl} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                {order.trackingNumber ?? "Open carrier page"}
              </a>
            </p>
          ) : null}
        </div>
        <div>
          <h2 className="text-lg font-medium">Totals</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">{formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="tabular-nums">{formatPrice(order.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
