import { listMyAddresses } from "@/lib/data-access/orders";
import { Badge } from "@/components/ui/badge";
import { AddAddressForm } from "@/components/account/add-address-form";

export const metadata = { title: "Addresses" };

export default async function AddressesPage() {
  const addresses = await listMyAddresses();

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Addresses</h1>
      {addresses.length === 0 ? (
        <p className="mt-8 text-sm text-muted-foreground">No addresses saved yet.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <article key={addr.id} className="border border-border p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{addr.label}</p>
                {addr.isDefault ? <Badge variant="secondary">Default</Badge> : null}
              </div>
              <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
                {addr.name}
                <br />
                {addr.line1}
                {addr.line2 ? (
                  <>
                    <br />
                    {addr.line2}
                  </>
                ) : null}
                <br />
                {addr.city}, {addr.state} {addr.zip}
              </address>
            </article>
          ))}
        </div>
      )}
      <AddAddressForm />
    </div>
  );
}
