"use client";

import { KpiCard } from "@/components/admin/kpi-card";
import { OrdersChart, RevenueChart, TopProductsChart } from "@/components/admin/charts";
import { formatCompact, formatPrice } from "@/lib/format";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">August 2026 · demonstration figures</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatPrice(98040)} hint="+8% vs July run-rate" />
        <KpiCard label="Orders" value={formatCompact(352)} hint="Avg. $278 per order" />
        <KpiCard label="Customers" value={formatCompact(18420)} hint="412 new this month" />
        <KpiCard label="Conversion" value="3.4%" hint="Storefront sessions" />
      </div>
      <div className="mt-10 grid gap-8 xl:grid-cols-2">
        <section className="border border-border p-5">
          <h2 className="text-sm font-medium">Revenue over time</h2>
          <div className="mt-4">
            <RevenueChart />
          </div>
        </section>
        <section className="border border-border p-5">
          <h2 className="text-sm font-medium">Orders over time</h2>
          <div className="mt-4">
            <OrdersChart />
          </div>
        </section>
      </div>
      <section className="mt-8 border border-border p-5">
        <h2 className="text-sm font-medium">Top products</h2>
        <div className="mt-4">
          <TopProductsChart />
        </div>
      </section>
    </div>
  );
}
