import Link from "next/link";
import { Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustomersSearch } from "@/components/admin/customers-search";
import { EmptyState } from "@/components/states/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listAdminCustomers } from "@/lib/data-access/admin";
import { formatDate, formatPrice } from "@/lib/format";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const customers = await listAdminCustomers(q);

  return (
    <div>
      <AdminPageHeader
        title="Customers"
        description="Accounts, order counts, and lifetime spend."
      />
      <CustomersSearch q={q} />
      {customers.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "No matching customers" : "No customers yet"}
          description={
            q ? "Try a different name or email." : "The first sign-up will appear here."
          }
        />
      ) : (
        <div className="overflow-x-auto border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <Link
                      href={`/admin/customers/${customer.id}`}
                      className="font-medium hover:underline"
                    >
                      {customer.name}
                    </Link>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell className="tabular-nums">{customer.orders}</TableCell>
                  <TableCell className="tabular-nums">{formatPrice(customer.spent)}</TableCell>
                  <TableCell>{formatDate(customer.joinedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
