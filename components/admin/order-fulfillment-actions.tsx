"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { cancelOrderAction, updateFulfillmentAction } from "@/lib/actions/admin";
import type { FulfillmentStatus, OrderStatus } from "@/lib/types";

function nextStep(fulfillment: FulfillmentStatus, status: OrderStatus) {
  if (status === "cancelled" || status === "delivered") return null;
  if (fulfillment === "unfulfilled" || fulfillment === "partial") return "fulfilled" as const;
  if (fulfillment === "fulfilled") return "shipped" as const;
  if (fulfillment === "shipped") return "delivered" as const;
  return null;
}

const stepCopy = {
  fulfilled: { label: "Mark fulfilled", title: "Mark this order fulfilled?" },
  shipped: { label: "Mark shipped", title: "Mark this order shipped?" },
  delivered: { label: "Mark delivered", title: "Mark this order delivered?" },
};

export function OrderFulfillmentActions({
  orderId,
  status,
  fulfillment,
}: {
  orderId: string;
  status: OrderStatus;
  fulfillment: FulfillmentStatus;
}) {
  const step = nextStep(fulfillment, status);
  const [pending, startTransition] = useTransition();

  if (status === "cancelled") {
    return <p className="text-sm text-muted-foreground">This order is cancelled.</p>;
  }

  if (status === "delivered") {
    return <p className="text-sm text-muted-foreground">Delivered. No further actions.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {step ? (
        <ConfirmAction
          title={stepCopy[step].title}
          description="This updates fulfillment status and the order timeline."
          confirmLabel={stepCopy[step].label}
          onConfirm={async () => {
            const result = await updateFulfillmentAction({ orderId, step });
            if (result.error) return result;
            toast.success("Order updated");
          }}
        >
          {({ open, pending: confirming }) => (
            <Button type="button" disabled={confirming || pending} onClick={open}>
              {stepCopy[step].label}
            </Button>
          )}
        </ConfirmAction>
      ) : null}
      <ConfirmAction
        title="Cancel this order?"
        description="Stock for every line item will be returned to inventory. This cannot be undone from here."
        confirmLabel="Cancel order"
        pendingLabel="Cancelling…"
        destructive
        onConfirm={async () => {
          const result = await cancelOrderAction(orderId);
          if (result.error) return result;
          toast.success("Order cancelled and stock restored");
        }}
      >
        {({ open, pending: confirming }) => (
          <Button
            type="button"
            variant="outline"
            disabled={confirming || pending}
            onClick={() => {
              startTransition(() => open());
            }}
          >
            Cancel order
          </Button>
        )}
      </ConfirmAction>
    </div>
  );
}
