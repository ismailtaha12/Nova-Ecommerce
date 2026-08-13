"use client";

import { useAuth } from "@/lib/stores/auth-store";
import { Badge } from "@/components/ui/badge";

export default function AddressesPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Addresses</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {user.addresses.map((addr) => (
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
    </div>
  );
}
