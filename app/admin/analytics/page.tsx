"use client";

import { KpiCard } from "@/components/admin/kpi-card";
import { OrdersChart, RevenueChart, TopProductsChart } from "@/components/admin/charts";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Analytics</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <KpiCard label="AOV" value="$278" />
        <KpiCard label="Return rate" value="2.1%" />
        <KpiCard label="Repeat purchase" value="28%" />
      </div>
      <div className="mt-8 grid gap-8">
        <section className="border border-border p-5">
          <h2 className="text-sm font-medium">Revenue</h2>
          <RevenueChart />
        </section>
        <section className="border border-border p-5">
          <h2 className="text-sm font-medium">Orders</h2>
          <OrdersChart />
        </section>
        <section className="border border-border p-5">
          <h2 className="text-sm font-medium">Top products</h2>
          <TopProductsChart />
        </section>
      </div>
    </div>
  );
}
