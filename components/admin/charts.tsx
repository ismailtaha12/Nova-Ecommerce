"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AnalyticsPoint, TopProductSales } from "@/lib/types";

const tooltipStyle = {
  background: "#fbfaf7",
  border: "1px solid #e6e2dc",
  borderRadius: 4,
  fontSize: 12,
};

function formatAxisRevenue(value: number) {
  if (value >= 1000) return `$${value / 1000}k`;
  return `$${value}`;
}

export function RevenueChart({ data }: { data: AnalyticsPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="#e6e2dc" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 12, fill: "#8a8680" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => formatAxisRevenue(Number(v))}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
          <Area type="monotone" dataKey="revenue" stroke="#c45c26" fill="#c45c26" fillOpacity={0.12} strokeWidth={1.5} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersChart({ data }: { data: AnalyticsPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid stroke="#e6e2dc" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="orders" fill="#0c0c0c" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TopProductsChart({ data }: { data: TopProductSales[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
          <CartesianGrid stroke="#e6e2dc" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 12, fill: "#8a8680" }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 12, fill: "#0c0c0c" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="sales" fill="#8a8680" radius={[0, 2, 2, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
