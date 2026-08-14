import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CustomerManageForm } from "@/components/admin/customer-manage-form";
import { getAdminCustomerById } from "@/lib/data-access/admin";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getAdminCustomerById(id);
  if (!customer) notFound();

  return (
    <div>
      <AdminPageHeader
        title={customer.name}
        description={customer.email}
        crumbs={[
          { href: "/admin/customers", label: "Customers" },
          { label: customer.name },
        ]}
      />
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{customer.role}</Badge>
        <Badge variant="outline">{customer.orders} orders</Badge>
        <Badge variant="outline">{formatPrice(customer.spent)} spent</Badge>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Joined {formatDate(customer.joinedAt)}
        {customer.phone ? ` · ${customer.phone}` : ""}
        {customer.disabled ? " · Suspended" : ""}
      </p>
      <CustomerManageForm customerId={customer.id} notes={customer.notes} disabled={Boolean(customer.disabled)} />

      <section className="mt-10">
        <h2 className="text-lg font-medium">Addresses</h2>
        {customer.addresses.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No saved addresses.</p>
        ) : (
          <ul className="mt-4 grid gap-4 md:grid-cols-2">
            {customer.addresses.map((address) => (
              <li key={address.id} className="border border-border p-4 text-sm">
                <p className="font-medium">
                  {address.label}
                  {address.isDefault ? " · Default" : ""}
                </p>
                <p className="mt-2 text-muted-foreground">
                  {address.name}
                  <br />
                  {address.line1}
                  {address.line2 ? (
                    <>
                      <br />
                      {address.line2}
                    </>
                  ) : null}
                  <br />
                  {address.city}, {address.state} {address.zip}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-medium">Orders</h2>
        {customer.orderHistory.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No orders yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customer.orderHistory.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.number}
                      </Link>
                    </TableCell>
                    <TableCell>{formatDate(order.date)}</TableCell>
                    <TableCell className="capitalize">{order.status}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(order.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
