"use client";

import { useMemo, useState } from "react";
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
import type { Address, CheckoutState, DeliveryMethod, ShippingRateOption } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  cancelPendingOrderAction,
  placeOrderAction,
  previewCouponAction,
  quoteRatesAction,
} from "@/lib/actions/checkout";
import { computeTax } from "@/lib/commerce";
import { StripePayForm } from "@/components/checkout/stripe-pay-form";
import { formatPrice } from "@/lib/format";

const STEPS = ["Information", "Address", "Delivery", "Payment"] as const;

export function CheckoutFlow({
  addresses,
  stripeKey,
  taxRate,
  freeShippingThreshold,
}: {
  addresses: Address[];
  stripeKey: string;
  taxRate: number;
  freeShippingThreshold: number;
}) {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, setPending] = useState(false);
  const [rates, setRates] = useState<ShippingRateOption[]>([]);
  const [couponLabel, setCouponLabel] = useState("");
  const [discount, setDiscount] = useState(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [pendingOrder, setPendingOrder] = useState<{ id: string; number: string } | null>(null);
  const [data, setData] = useState<CheckoutState>({
    ...defaultCheckout,
    email: user?.email ?? "",
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
  });

  const shipping = data.shippingAmount ?? (subtotal >= freeShippingThreshold ? 0 : 12);
  const tax = computeTax(subtotal - discount, taxRate);
  const total = Math.round((subtotal - discount + shipping + tax) * 100) / 100;

  const selectedRate = useMemo(
    () => rates.find((rate) => rate.id === data.shippingRateId) ?? rates.find((rate) => rate.delivery === data.delivery),
    [rates, data.shippingRateId, data.delivery],
  );

  if (items.length === 0 && !pendingOrder) {
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

  async function loadRates(address = data.address) {
    const result = await quoteRatesAction({ address, subtotal });
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setRates(result.rates);
    const first = result.rates[0];
    if (first) {
      patch({
        delivery: first.delivery,
        shippingRateId: first.id,
        shippingAmount: first.amount,
        carrier: first.carrier,
        shippingService: first.service,
      });
    }
  }

  async function applyCoupon() {
    const result = await previewCouponAction(data.couponCode, subtotal);
    if ("error" in result) {
      toast.error(result.error);
      setDiscount(0);
      setCouponLabel("");
      return;
    }
    setDiscount(result.discount);
    setCouponLabel(result.coupon.code);
    toast.success(`Applied ${result.coupon.code}`);
  }

  async function startPayment() {
    setPending(true);
    const name = data.address.name.trim() || `${data.firstName} ${data.lastName}`.trim();
    const result = await placeOrderAction({
      items: items.map((item) => ({
        productId: item.productId,
        variant: item.variant,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
      shippingAddress: {
        name,
        line1: data.address.line1,
        line2: data.address.line2,
        city: data.address.city,
        state: data.address.state,
        zip: data.address.zip,
        country: data.address.country || "United States",
      },
      delivery: (selectedRate?.delivery ?? data.delivery) as DeliveryMethod,
      saveAddress: data.saveAddress && Boolean(user),
      couponCode: couponLabel || data.couponCode,
      email: data.email,
      name,
      phone: data.phone,
      shippingAmount: selectedRate?.amount ?? data.shippingAmount,
      shippingRateId: selectedRate?.id,
      carrier: selectedRate?.carrier,
      shippingService: selectedRate?.service,
    });
    setPending(false);
    if ("error" in result) {
      toast.error(result.error);
      return;
    }
    setPendingOrder({ id: result.orderId, number: result.orderNumber ?? result.orderId });
    if (result.clientSecret && stripeKey) {
      setClientSecret(result.clientSecret);
      return;
    }
    clear();
    toast.success("Order placed");
    router.push(`/checkout/success?order=${result.orderNumber ?? result.orderId}`);
  }

  function finishPaid() {
    clear();
    toast.success("Payment received");
    router.push(`/checkout/success?order=${pendingOrder?.number ?? pendingOrder?.id ?? ""}`);
  }

  return (
    <Container className="py-12 md:py-16">
      <h1 className="text-4xl font-medium tracking-tight">Checkout</h1>
      {!user ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Checking out as a guest.{" "}
          <Link href="/login?next=/checkout" className="underline-offset-4 hover:underline">
            Sign in
          </Link>{" "}
          to use saved addresses.
        </p>
      ) : null}
      <ol className="mt-8 flex gap-2 overflow-x-auto text-xs tracking-wide uppercase">
        {STEPS.map((label, i) => (
          <li key={label} className={cn("flex items-center gap-2 whitespace-nowrap", i <= step ? "text-foreground" : "text-muted-foreground")}>
            <span className={cn("flex size-6 items-center justify-center border text-[10px]", i === step && "border-foreground bg-foreground text-background")}>
              {i + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_360px]">
        <div>
          {step === 0 && (
            <form className="max-w-lg space-y-4" onSubmit={(e) => { e.preventDefault(); setStep(1); }}>
              <Field label="Email" id="email">
                <Input id="email" type="email" required value={data.email} onChange={(e) => patch({ email: e.target.value })} className="h-11" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" id="first">
                  <Input id="first" required value={data.firstName} onChange={(e) => patch({ firstName: e.target.value })} className="h-11" />
                </Field>
                <Field label="Last name" id="last">
                  <Input id="last" required value={data.lastName} onChange={(e) => patch({ lastName: e.target.value })} className="h-11" />
                </Field>
              </div>
              <Field label="Phone" id="phone">
                <Input id="phone" type="tel" value={data.phone} onChange={(e) => patch({ phone: e.target.value })} className="h-11" />
              </Field>
              <Actions />
            </form>
          )}

          {step === 1 && (
            <form
              className="max-w-lg space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void loadRates().then(() => setStep(2));
              }}
            >
              {addresses.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Saved addresses</p>
                  {addresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      className="block w-full border border-border p-3 text-left text-sm hover:border-foreground"
                      onClick={() =>
                        patch({
                          address: {
                            name: address.name,
                            line1: address.line1,
                            line2: address.line2,
                            city: address.city,
                            state: address.state,
                            zip: address.zip,
                            country: address.country,
                          },
                        })
                      }
                    >
                      {address.name} · {address.line1}, {address.city}
                    </button>
                  ))}
                </div>
              ) : null}
              <Field label="Full name" id="addrName">
                <Input
                  id="addrName"
                  required
                  value={data.address.name || `${data.firstName} ${data.lastName}`.trim()}
                  onChange={(e) => patch({ address: { ...data.address, name: e.target.value } })}
                  className="h-11"
                />
              </Field>
              <Field label="Street address" id="line1">
                <Input id="line1" required value={data.address.line1} onChange={(e) => patch({ address: { ...data.address, line1: e.target.value } })} className="h-11" />
              </Field>
              <Field label="Apartment, suite (optional)" id="line2">
                <Input id="line2" value={data.address.line2 ?? ""} onChange={(e) => patch({ address: { ...data.address, line2: e.target.value } })} className="h-11" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" id="city">
                  <Input id="city" required value={data.address.city} onChange={(e) => patch({ address: { ...data.address, city: e.target.value } })} className="h-11" />
                </Field>
                <Field label="State" id="state">
                  <Input id="state" required value={data.address.state} onChange={(e) => patch({ address: { ...data.address, state: e.target.value } })} className="h-11" />
                </Field>
                <Field label="ZIP" id="zip">
                  <Input id="zip" required value={data.address.zip} onChange={(e) => patch({ address: { ...data.address, zip: e.target.value } })} className="h-11" />
                </Field>
              </div>
              {user ? (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={data.saveAddress} onChange={(e) => patch({ saveAddress: e.target.checked })} />
                  Save this address
                </label>
              ) : null}
              <Actions onBack={() => setStep(0)} />
            </form>
          )}

          {step === 2 && (
            <form className="max-w-lg space-y-3" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              {(rates.length ? rates : [
                { id: "standard", delivery: "standard" as const, name: "Standard", detail: "4–6 business days", amount: subtotal >= freeShippingThreshold ? 0 : 12 },
              ]).map((opt) => (
                <label key={opt.id} className={cn("flex cursor-pointer items-center justify-between border p-4", data.shippingRateId === opt.id && "border-foreground")}>
                  <span>
                    <input
                      type="radio"
                      className="sr-only"
                      name="delivery"
                      checked={data.shippingRateId === opt.id || (!data.shippingRateId && data.delivery === opt.delivery)}
                      onChange={() =>
                        patch({
                          delivery: opt.delivery,
                          shippingRateId: opt.id,
                          shippingAmount: opt.amount,
                          carrier: opt.carrier,
                          shippingService: opt.service,
                        })
                      }
                    />
                    <span className="block text-sm font-medium">{opt.name}</span>
                    <span className="text-xs text-muted-foreground">{opt.detail}</span>
                  </span>
                  <span className="text-sm tabular-nums">{opt.amount === 0 ? "Free" : formatPrice(opt.amount)}</span>
                </label>
              ))}
              <Actions onBack={() => setStep(1)} />
            </form>
          )}

          {step === 3 && (
            <div className="max-w-lg space-y-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Coupon code"
                  value={data.couponCode}
                  onChange={(e) => patch({ couponCode: e.target.value })}
                  className="h-11"
                />
                <Button type="button" variant="outline" onClick={() => void applyCoupon()}>
                  Apply
                </Button>
              </div>
              {couponLabel ? <p className="text-sm text-muted-foreground">{couponLabel} saved you {formatPrice(discount)}</p> : null}
              <ReviewRow label="Contact" value={`${data.firstName} ${data.lastName} · ${data.email}`} />
              <ReviewRow label="Ship to" value={`${data.address.line1}, ${data.address.city} ${data.address.state} ${data.address.zip}`} />
              <ReviewRow label="Delivery" value={selectedRate?.name ?? data.delivery} />

              {clientSecret && stripeKey ? (
                <StripePayForm
                  clientSecret={clientSecret}
                  publishableKey={stripeKey}
                  orderNumber={pendingOrder?.number}
                  onPaid={finishPaid}
                />
              ) : (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      if (pendingOrder) void cancelPendingOrderAction(pendingOrder.id);
                      setPendingOrder(null);
                      setClientSecret(null);
                      setStep(2);
                    }}
                  >
                    Back
                  </Button>
                  <Button type="button" variant="brand" size="lg" className="flex-1" disabled={pending} onClick={() => void startPayment()}>
                    {pending ? "Placing order…" : stripeKey ? "Continue to payment" : "Place order"}
                  </Button>
                </div>
              )}
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
                  <span className="block text-xs text-muted-foreground">{i.variant}</span>
                </span>
                <span className="tabular-nums">{formatPrice(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
            {discount > 0 ? <div className="flex justify-between"><dt className="text-muted-foreground">Discount</dt><dd>-{formatPrice(discount)}</dd></div> : null}
            <div className="flex justify-between"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : formatPrice(shipping)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted-foreground">Tax</dt><dd>{formatPrice(tax)}</dd></div>
            <div className="flex justify-between border-t border-border pt-2 font-medium"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
          </dl>
          <div className="mt-6 hidden">
            <CartSummary showCheckout={false} />
          </div>
        </aside>
      </div>
    </Container>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
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
        <Button type="button" variant="outline" size="lg" onClick={onBack}>Back</Button>
      ) : (
        <Link href="/cart" className="inline-flex h-11 items-center px-4 text-sm text-muted-foreground">Return to bag</Link>
      )}
      <Button type="submit" variant="brand" size="lg" className="flex-1">Continue</Button>
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
