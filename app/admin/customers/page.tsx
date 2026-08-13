import { adminCustomers } from "@/lib/data";
import { formatDate, formatPrice } from "@/lib/format";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminCustomersPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Customers</h1>
      <div className="mt-8 overflow-x-auto border border-border">
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
            {adminCustomers.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell className="tabular-nums">{c.orders}</TableCell>
                <TableCell className="tabular-nums">{formatPrice(c.spent)}</TableCell>
                <TableCell>{formatDate(c.joinedAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
