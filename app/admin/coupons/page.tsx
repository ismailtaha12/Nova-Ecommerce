import { coupons } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminCouponsPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Coupons</h1>
      <div className="mt-8 overflow-x-auto border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Uses</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coupons.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-mono text-sm">{c.code}</TableCell>
                <TableCell>{c.description}</TableCell>
                <TableCell>{c.discount}</TableCell>
                <TableCell className="tabular-nums">
                  {c.uses} / {c.limit}
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === "active" ? "secondary" : "outline"}>{c.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
