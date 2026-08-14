import Link from "next/link";
import { Container } from "@/components/layout/container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Order received" };

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; redirect_status?: string }>;
}) {
  const { order, redirect_status } = await searchParams;
  const failed = redirect_status === "failed";

  return (
    <Container className="py-16">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">Checkout</p>
      <h1 className="mt-3 text-4xl font-medium tracking-tight">
        {failed ? "Payment did not go through." : "Thank you."}
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        {failed
          ? "No charge was captured. You can return to checkout and try another payment method. Stock is released if the payment remains failed."
          : order
            ? `Order ${order} is confirmed. You will receive email updates as it is fulfilled and shipped.`
            : "Your order was received. Payment confirmation can take a few seconds."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        {failed ? (
          <Link href="/checkout" className={cn(buttonVariants())}>
            Return to checkout
          </Link>
        ) : (
          <Link
            href={order ? `/orders/track?number=${encodeURIComponent(order)}` : "/orders/track"}
            className={cn(buttonVariants())}
          >
            Track order
          </Link>
        )}
        <Link href="/account/orders" className={cn(buttonVariants({ variant: "outline" }))}>
          Order history
        </Link>
      </div>
    </Container>
  );
}
