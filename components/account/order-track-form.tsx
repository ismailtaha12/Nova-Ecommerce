"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { trackOrderAction } from "@/lib/actions/checkout";
import type { Order } from "@/lib/types";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function OrderTrackForm() {
  const searchParams = useSearchParams();
  const [number, setNumber] = useState(searchParams.get("number") ?? "");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await trackOrderAction(number, email);
      if ("error" in result && result.error) {
        setError(result.error);
        setOrder(null);
        return;
      }
      setError(null);
      setOrder(result.order ?? null);
    });
  }

  return (
    <Container className="py-16">
      <h1 className="text-4xl font-medium tracking-tight">Track an order</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Enter the order number from your confirmation email and the email used at checkout.
      </p>
      <form className="mt-8 max-w-md space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="number">Order number</Label>
          <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} required className="h-11" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" disabled={pending}>{pending ? "Looking up…" : "Track order"}</Button>
      </form>

      {order ? (
        <div className="mt-12 max-w-lg">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{order.number}</Badge>
            <Badge variant="outline">Payment {order.paymentStatus}</Badge>
            <Badge variant="outline">{order.status}</Badge>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">{formatDate(order.date)}</p>
          {order.trackingUrl ? (
            <p className="mt-4 text-sm">
              Tracking:{" "}
              <a href={order.trackingUrl} className="underline-offset-4 hover:underline" target="_blank" rel="noreferrer">
                {order.trackingNumber ?? "Open carrier page"}
              </a>
            </p>
          ) : null}
          <ul className="mt-6 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.slug + item.variant} className="flex justify-between">
                <span>{item.name} · {item.variant} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm font-medium">Total {formatPrice(order.total)}</p>
        </div>
      ) : null}
    </Container>
  );
}
