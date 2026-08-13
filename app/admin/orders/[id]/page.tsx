import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { OrderFulfillmentActions } from "@/components/admin/order-fulfillment-actions";
import { Badge } from "@/components/ui/badge";
import { getAdminOrderById } from "@/lib/data-access/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  return { title: order ? `${order.number} · Admin` : "Order" };
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrderById(id);
  if (!order) notFound();

  const address = order.shippingAddress;

  return (
    <div>
      <AdminPageHeader
        title={order.number}
        description={formatDate(order.date)}
        crumbs={[
          { href: "/admin/orders", label: "Orders" },
          { label: order.number },
        ]}
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Payment {order.paymentStatus}</Badge>
        <Badge variant="outline">Fulfillment {order.fulfillmentStatus}</Badge>
        <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
          {order.status}
        </Badge>
      </div>

      <div className="mt-8">
        <OrderFulfillmentActions
          orderId={order.id}
          status={order.status}
          fulfillment={order.fulfillmentStatus}
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <h2 className="text-lg font-medium">Items</h2>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {order.items.map((item) => (
              <li key={item.slug + item.variant} className="flex gap-4 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
                  {item.image ? (
                    <Image src={item.image} alt="" fill className="object-cover" sizes="64px" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.variant} · Qty {item.quantity}
                  </p>
                </div>
                <p className="text-sm tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 space-y-2 text-sm">
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
            <div className="flex justify-between font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-8">
          <section>
            <h2 className="text-sm font-medium">Customer</h2>
            <p className="mt-2 text-sm">{order.customerName || "Customer"}</p>
            {order.customerEmail ? (
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            ) : null}
            {order.userId ? (
              <Link
                href={`/admin/customers/${order.userId}`}
                className="mt-2 inline-block text-sm underline-offset-4 hover:underline"
              >
                View customer
              </Link>
            ) : null}
          </section>
          <section>
            <h2 className="text-sm font-medium">Ship to</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {address.name}
              <br />
              {address.line1}
              {address.line2 ? (
                <>
                  <br />
                  {address.line2}
                </>
              ) : null}
              <br />
              {address.city}, {address.state} {address.zip}
              <br />
              {address.country}
            </p>
          </section>
          <section>
            <h2 className="text-sm font-medium">Timeline</h2>
            <ol className="mt-3 space-y-3">
              {order.timeline.map((event) => (
                <li key={event.label} className="flex gap-3">
                  <span
                    className={cn(
                      "mt-1 size-2.5 shrink-0 rounded-full",
                      event.complete ? "bg-ember" : "bg-border"
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">{event.label}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.date ? formatDate(event.date) : "Pending"}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
