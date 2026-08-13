import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AnalyticsRangeLinks } from "@/components/admin/analytics-range";
import { OrdersChart, RevenueChart, TopProductsChart } from "@/components/admin/charts";
import { KpiCard } from "@/components/admin/kpi-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAnalytics } from "@/lib/data-access/admin";
import { formatCompact, formatPrice } from "@/lib/format";
import type { AnalyticsRange } from "@/lib/types";

function parseRange(value: string | undefined): AnalyticsRange {
  if (value === "30d" || value === "90d") return value;
  return "all";
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const params = await searchParams;
  const range = parseRange(params.range);
  const analytics = await getAnalytics(range);

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Revenue, orders, and what is selling."
        action={<AnalyticsRangeLinks range={range} />}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatPrice(analytics.revenue)} />
        <KpiCard label="Orders" value={formatCompact(analytics.orders)} />
        <KpiCard label="Customers" value={formatCompact(analytics.customers)} />
        <KpiCard label="AOV" value={formatPrice(analytics.aov)} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section className="border border-border p-5">
          <h2 className="text-sm font-medium">Revenue</h2>
          {analytics.series.length ? (
            <div className="mt-4">
              <RevenueChart data={analytics.series} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No orders in this range.</p>
          )}
        </section>
        <section className="border border-border p-5">
          <h2 className="text-sm font-medium">Orders</h2>
          {analytics.series.length ? (
            <div className="mt-4">
              <OrdersChart data={analytics.series} />
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No orders in this range.</p>
          )}
        </section>
      </div>
      <section className="mt-8 border border-border p-5">
        <h2 className="text-sm font-medium">Top products</h2>
        {analytics.topProducts.length ? (
          <div className="mt-4 grid gap-8 lg:grid-cols-2">
            <TopProductsChart data={analytics.topProducts} />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analytics.topProducts.map((product) => (
                  <TableRow key={product.productId ?? product.name}>
                    <TableCell>
                      {product.productId ? (
                        <Link
                          href={`/admin/products/${product.productId}/edit`}
                          className="hover:underline"
                        >
                          {product.name}
                        </Link>
                      ) : (
                        product.name
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{product.sales}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No product sales yet.</p>
        )}
      </section>
    </div>
  );
}
