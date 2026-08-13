"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { CartSummary } from "@/components/cart/cart-line";
import { EmptyCart } from "@/components/states/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/stores/cart-store";
import { useAuth, defaultCheckout } from "@/lib/stores/auth-store";
import type { CheckoutState, DeliveryMethod, Order } from "@/lib/types";
import { cn } from "@/lib/utils";

const STEPS = [
  "Information",
  "Address",
  "Delivery",
  "Payment",
  "Review",
] as const;

const deliveryOptions: { id: DeliveryMethod; name: string; detail: string; price: string }[] = [
  { id: "standard", name: "Standard", detail: "4–6 business days", price: "Free over $75" },
  { id: "express", name: "Express", detail: "2 business days", price: "$18" },
  { id: "overnight", name: "Overnight", detail: "Next business day", price: "$32" },
];

export function CheckoutFlow() {
  const { items, subtotal, shipping, tax, total, clear } = useCart();
  const { user, addOrder } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [fail, setFail] = useState(false);
  const [data, setData] = useState<CheckoutState>({
    ...defaultCheckout,
    email: user?.email ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    address: user?.addresses[0]
      ? {
          name: user.addresses[0].name,
          line1: user.addresses[0].line1,
          line2: user.addresses[0].line2,
          city: user.addresses[0].city,
          state: user.addresses[0].state,
          zip: user.addresses[0].zip,
          country: user.addresses[0].country,
        }
      : defaultCheckout.address,
  });

  if (items.length === 0) {
    return (
      <Container className="py-16">
        <h1 className="text-4xl font-medium tracking-tight">Checkout</h1>
        <EmptyCart />
      </Container>
    );
  }

  function patch(p: Partial<CheckoutState>) {
    setData((d) => ({ ...d, ...p }));
  }

  function next() {
    setFail(false);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function placeOrder() {
    if (fail) {
      toast.error("Payment could not be processed. Try again.");
      return;
    }
    const id = `ord-${Math.floor(Math.random() * 90000 + 10000)}`;
    const number = `NV-${id.slice(4)}`;
    const order: Order = {
      id,
      number,
      date: new Date().toISOString().slice(0, 10),
      paymentStatus: "paid",
      fulfillmentStatus: "unfulfilled",
      status: "processing",
      items: items.map((i) => ({
        productId: i.productId,
        slug: i.slug,
        name: i.name,
        image: i.image,
        color: i.color,
        variant: i.variant,
        price: i.price,
        quantity: i.quantity,
      })),
      shippingAddress: {
        id: "new",
        label: "Shipping",
        ...data.address,
        name: `${data.firstName} ${data.lastName}`,
      },
      subtotal,
      shipping,
      tax,
      total,
      timeline: [
        { label: "Order placed", date: new Date().toISOString(), complete: true },
        { label: "Payment confirmed", date: new Date().toISOString(), complete: true },
        { label: "Fulfilled", date: "", complete: false },
        { label: "Shipped", date: "", complete: false },
        { label: "Delivered", date: "", complete: false },
      ],
    };
    addOrder(order);
    clear();
    toast.success("Order placed");
    router.push(`/account/orders/${id}`);
  }

  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-4xl font-medium tracking-tight">Checkout</h1>
      <ol className="mt-8 flex gap-2 overflow-x-auto text-xs tracking-wide uppercase">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap",
              i <= step ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <span
              className={cn(
                "flex size-6 items-center justify-center border text-[10px]",
                i === step && "border-foreground bg-foreground text-background",
                i < step && "border-ember bg-ember text-ember-foreground"
              )}
            >
              {i + 1}
            </span>
            {label}
            {i < STEPS.length - 1 ? <span className="text-border">/</span> : null}
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 0 && (
            <form
              className="max-w-lg space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <Field label="Email" id="email">
                <Input
                  id="email"
                  type="email"
                  required
                  value={data.email}
                  onChange={(e) => patch({ email: e.target.value })}
                  className="h-11"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" id="first">
                  <Input
                    id="first"
                    required
                    value={data.firstName}
                    onChange={(e) => patch({ firstName: e.target.value })}
                    className="h-11"
                  />
                </Field>
                <Field label="Last name" id="last">
                  <Input
                    id="last"
                    required
                    value={data.lastName}
                    onChange={(e) => patch({ lastName: e.target.value })}
                    className="h-11"
                  />
                </Field>
              </div>
              <Field label="Phone" id="phone">
                <Input
                  id="phone"
                  type="tel"
                  value={data.phone}
                  onChange={(e) => patch({ phone: e.target.value })}
                  className="h-11"
                />
              </Field>
              <Actions onBack={undefined} />
            </form>
          )}

          {step === 1 && (
            <form
              className="max-w-lg space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <Field label="Street address" id="line1">
                <Input
                  id="line1"
                  required
                  value={data.address.line1}
                  onChange={(e) =>
                    patch({ address: { ...data.address, line1: e.target.value } })
                  }
                  className="h-11"
                />
              </Field>
              <Field label="Apartment, suite (optional)" id="line2">
                <Input
                  id="line2"
                  value={data.address.line2 ?? ""}
                  onChange={(e) =>
                    patch({ address: { ...data.address, line2: e.target.value } })
                  }
                  className="h-11"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" id="city">
                  <Input
                    id="city"
                    required
                    value={data.address.city}
                    onChange={(e) =>
                      patch({ address: { ...data.address, city: e.target.value } })
                    }
                    className="h-11"
                  />
                </Field>
                <Field label="State" id="state">
                  <Input
                    id="state"
                    required
                    value={data.address.state}
                    onChange={(e) =>
                      patch({ address: { ...data.address, state: e.target.value } })
                    }
                    className="h-11"
                  />
                </Field>
                <Field label="ZIP" id="zip">
                  <Input
                    id="zip"
                    required
                    value={data.address.zip}
                    onChange={(e) =>
                      patch({ address: { ...data.address, zip: e.target.value } })
                    }
                    className="h-11"
                  />
                </Field>
              </div>
              <Actions onBack={() => setStep(0)} />
            </form>
          )}

          {step === 2 && (
            <form
              className="max-w-lg space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              {deliveryOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between border p-4",
                    data.delivery === opt.id && "border-foreground"
                  )}
                >
                  <span>
                    <input
                      type="radio"
                      className="sr-only"
                      name="delivery"
                      checked={data.delivery === opt.id}
                      onChange={() => patch({ delivery: opt.id })}
                    />
                    <span className="block text-sm font-medium">{opt.name}</span>
                    <span className="text-xs text-muted-foreground">{opt.detail}</span>
                  </span>
                  <span className="text-sm tabular-nums">{opt.price}</span>
                </label>
              ))}
              <Actions onBack={() => setStep(1)} />
            </form>
          )}

          {step === 3 && (
            <form
              className="max-w-lg space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                next();
              }}
            >
              <p className="text-sm text-muted-foreground">
                This is a demonstration checkout. No real payment is collected.
              </p>
              <div className="border border-border p-5">
                <p className="text-sm font-medium">Card on file</p>
                <p className="mt-1 text-sm text-muted-foreground">Visa ending in 4242</p>
                <p className="mt-1 text-xs text-muted-foreground">Exp 12/28 · Billing ZIP 94107</p>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={fail}
                  onChange={(e) => setFail(e.target.checked)}
                />
                Simulate payment failure
              </label>
              <Actions onBack={() => setStep(2)} />
            </form>
          )}

          {step === 4 && (
            <div className="max-w-lg space-y-6">
              <ReviewRow label="Contact" value={`${data.firstName} ${data.lastName} · ${data.email}`} />
              <ReviewRow
                label="Ship to"
                value={`${data.address.line1}, ${data.address.city} ${data.address.state} ${data.address.zip}`}
              />
              <ReviewRow
                label="Delivery"
                value={deliveryOptions.find((d) => d.id === data.delivery)?.name ?? ""}
              />
              <ReviewRow label="Payment" value="Visa ···· 4242" />
              <div className="flex gap-3">
                <Button type="button" variant="outline" size="lg" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button type="button" variant="brand" size="lg" className="flex-1" onClick={placeOrder}>
                  Place order
                </Button>
              </div>
            </div>
          )}
        </div>

        <aside className="h-fit border border-border p-6 lg:sticky lg:top-24">
          <h2 className="text-sm font-medium">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.key} className="flex justify-between gap-3">
                <span>
                  {i.name} × {i.quantity}
                  <span className="block text-xs text-muted-foreground">
                    {i.color} · {i.variant}
                  </span>
                </span>
                <span className="tabular-nums">${(i.price * i.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <CartSummary showCheckout={false} />
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background p-3 lg:hidden">
        <p className="mb-2 text-center text-sm tabular-nums">Total ${total.toFixed(2)}</p>
      </div>
    </Container>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function Actions({ onBack }: { onBack?: () => void }) {
  return (
    <div className="flex gap-3 pt-4">
      {onBack ? (
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
      ) : (
        <Link href="/cart" className="inline-flex h-11 items-center px-4 text-sm text-muted-foreground">
          Return to bag
        </Link>
      )}
      <Button type="submit" variant="brand" size="lg" className="flex-1">
        Continue
      </Button>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
