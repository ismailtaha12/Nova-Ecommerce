"use client";

import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export function StripePayForm({
  clientSecret,
  publishableKey,
  orderNumber,
  onPaid,
}: {
  clientSecret: string;
  publishableKey: string;
  orderNumber?: string;
  onPaid: () => void;
}) {
  const stripePromise = useMemo(() => loadStripe(publishableKey), [publishableKey]);
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "flat" } }}>
      <InnerPay onPaid={onPaid} orderNumber={orderNumber} />
    </Elements>
  );
}

function InnerPay({ onPaid, orderNumber }: { onPaid: () => void; orderNumber?: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    if (!stripe || !elements) return;
    setPending(true);
    setError(null);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/checkout/success${orderNumber ? `?order=${encodeURIComponent(orderNumber)}` : ""}`,
      },
      redirect: "if_required",
    });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Payment failed.");
      return;
    }
    onPaid();
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button type="button" variant="brand" size="lg" className="w-full" disabled={pending || !stripe} onClick={() => void pay()}>
        {pending ? "Processing…" : "Pay now"}
      </Button>
    </div>
  );
}
