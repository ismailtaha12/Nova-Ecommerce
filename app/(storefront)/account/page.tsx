import Link from "next/link";
import { getSessionUser } from "@/lib/data-access/auth";
import { listMyAddresses, listMyOrders } from "@/lib/data-access/orders";
import { formatDate, formatPrice } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Account" };

export default async function AccountOverviewPage() {
  const [user, orders, addresses] = await Promise.all([
    getSessionUser(),
    listMyOrders(),
    listMyAddresses(),
  ]);
  if (!user) return null;

  const latest = orders[0];
  const defaultCity =
    addresses.find((addr) => addr.isDefault)?.city ?? addresses[0]?.city ?? "—";

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">
        Hello, {user.firstName || "there"}.
      </h1>
      <p className="mt-2 text-muted-foreground">Member since {formatDate(user.joinedAt)}</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Email" value={user.email} />
        <Stat label="Default city" value={defaultCity} />
      </div>
      {latest ? (
        <div className="mt-12">
          <h2 className="text-lg font-medium">Latest order</h2>
          <Link
            href={`/account/orders/${latest.id}`}
            className="mt-4 block border border-border p-5 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center justify-between">
              <p className="font-medium">{latest.number}</p>
              <Badge variant="secondary">{latest.status}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDate(latest.date)} · {formatPrice(latest.total)}
            </p>
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-5">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 text-sm">{value}</p>
    </div>
  );
}
