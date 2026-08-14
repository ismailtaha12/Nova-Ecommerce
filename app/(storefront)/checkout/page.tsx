import { CheckoutFlow } from "@/components/checkout/checkout-flow";
import { listMyAddresses } from "@/lib/data-access/orders";
import { getSessionUser } from "@/lib/data-access/auth";
import { getStoreSettings } from "@/lib/data-access/admin";
import { stripePublishableKey } from "@/lib/payments/stripe";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getSessionUser();
  const [addresses, settings] = await Promise.all([
    user ? listMyAddresses() : Promise.resolve([]),
    getStoreSettings(),
  ]);

  return (
    <CheckoutFlow
      addresses={addresses}
      stripeKey={stripePublishableKey()}
      taxRate={settings.taxRate}
      freeShippingThreshold={settings.freeShippingThreshold}
    />
  );
}
