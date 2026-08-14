import { requireAdmin } from "@/lib/data-access/auth";
import { attachCustomers } from "@/lib/data-access/orders";
import {
  mapAddress,
  mapBanner,
  mapCategory,
  mapCoupon,
  mapInventoryLog,
  mapOrder,
  mapProduct,
  mapReview,
  mapStoreSettings,
  type OrderRow,
  type ProductRow,
} from "@/lib/data-access/mappers";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminCustomer,
  AdminCustomerDetail,
  AdminDashboard,
  AnalyticsPoint,
  AnalyticsRange,
  Category,
  Coupon,
  HomepageBanner,
  InventoryLog,
  Order,
  Product,
  Review,
  StoreSettings,
  TopProductSales,
} from "@/lib/types";

const PRODUCT_SELECT =
  "*, product_variants(id, product_id, sku_key, name, price, stock, options, sort_order)" as const;
const ORDER_SELECT = "*, order_items(*), order_events(*)" as const;

export type AdminReview = Review & {
  productName: string;
  productSlug: string;
};

export type DashboardStats = {
  revenue: number;
  orders: number;
  customers: number;
  aov: number;
};

export type AnalyticsResult = DashboardStats & {
  series: AnalyticsPoint[];
  topProducts: TopProductSales[];
};

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function relation<T>(rel: T | T[] | null | undefined): T | null {
  if (!rel) return null;
  return Array.isArray(rel) ? (rel[0] ?? null) : rel;
}

function sanitizeIlike(value: string) {
  return value.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
}

export async function getAdminProductById(id: string): Promise<Product | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  return data ? mapProduct(data as ProductRow) : null;
}

export async function listAdminProducts(): Promise<Product[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return ((data ?? []) as ProductRow[]).map(mapProduct);
}

export async function listInventoryLogs(): Promise<InventoryLog[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  throwIfError(error);
  return (data ?? []).map(mapInventoryLog);
}

export async function listAdminReviews(): Promise<AdminReview[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reviews")
    .select("*, products(id, name, slug)")
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map((row) => {
    const product = relation(row.products);
    return {
      ...mapReview(row),
      productName: product?.name ?? "",
      productSlug: product?.slug ?? "",
    };
  });
}

export async function listAdminCustomers(query?: string): Promise<AdminCustomer[]> {
  await requireAdmin();
  const supabase = await createClient();
  let profilesQuery = supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone, created_at")
    .order("created_at", { ascending: false });

  const q = query ? sanitizeIlike(query) : "";
  if (q) {
    profilesQuery = profilesQuery.or(
      `email.ilike.%${q}%,first_name.ilike.%${q}%,last_name.ilike.%${q}%`
    );
  }

  const [profilesRes, ordersRes] = await Promise.all([
    profilesQuery,
    supabase.from("orders").select("user_id, total"),
  ]);
  throwIfError(profilesRes.error);
  throwIfError(ordersRes.error);

  const totals = new Map<string, { orders: number; spent: number }>();
  for (const order of ordersRes.data ?? []) {
    if (!order.user_id) continue;
    const current = totals.get(order.user_id) ?? { orders: 0, spent: 0 };
    current.orders += 1;
    current.spent += Number(order.total);
    totals.set(order.user_id, current);
  }

  return (profilesRes.data ?? []).map((row) => {
    const stats = totals.get(row.id) ?? { orders: 0, spent: 0 };
    return {
      id: row.id,
      name: `${row.first_name} ${row.last_name}`.trim() || row.email,
      email: row.email,
      phone: row.phone,
      orders: stats.orders,
      spent: stats.spent,
      joinedAt: row.created_at,
    };
  });
}

export async function getAdminCustomerById(id: string): Promise<AdminCustomerDetail | null> {
  await requireAdmin();
  const supabase = await createClient();
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email, phone, role, notes, disabled_at, created_at")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error);
  if (!profile) return null;

  const [ordersRes, addressesRes] = await Promise.all([
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("user_id", id)
      .order("placed_at", { ascending: false })
      .order("sort_order", { referencedTable: "order_events", ascending: true }),
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", id)
      .order("is_default", { ascending: false }),
  ]);
  throwIfError(ordersRes.error);
  throwIfError(addressesRes.error);

  const orderHistory = ((ordersRes.data ?? []) as OrderRow[]).map(mapOrder).map((order) => ({
    ...order,
    customerName: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
    customerEmail: profile.email,
  }));
  const spent = orderHistory.reduce((sum, order) => sum + order.total, 0);

  return {
    id: profile.id,
    name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
    email: profile.email,
    phone: profile.phone,
    role: profile.role as AdminCustomerDetail["role"],
    notes: profile.notes ?? "",
    disabled: profile.disabled_at != null,
    orders: orderHistory.length,
    spent,
    joinedAt: profile.created_at,
    addresses: (addressesRes.data ?? []).map(mapAddress),
    orderHistory,
  };
}

export async function getAnalytics(range: AnalyticsRange = "all"): Promise<AnalyticsResult> {
  await requireAdmin();
  const supabase = await createClient();

  let ordersQuery = supabase
    .from("orders")
    .select("id, placed_at, total, user_id, payment_status")
    .eq("payment_status", "paid");
  if (range !== "all") {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (range === "30d" ? 30 : 90));
    ordersQuery = ordersQuery.gte("placed_at", start.toISOString());
  }

  const [ordersRes, itemsRes, customersRes] = await Promise.all([
    ordersQuery,
    supabase.from("order_items").select("name, quantity, product_id, order_id"),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  throwIfError(ordersRes.error);
  throwIfError(itemsRes.error);
  throwIfError(customersRes.error);

  const orders = ordersRes.data ?? [];
  const revenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
  const orderCount = orders.length;
  const customers = customersRes.count ?? 0;
  const aov = orderCount ? revenue / orderCount : 0;

  const byMonth = new Map<string, AnalyticsPoint>();
  for (const order of orders) {
    const date = new Date(order.placed_at);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    const month = date.toLocaleString("en-US", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
    const current = byMonth.get(key) ?? { month, revenue: 0, orders: 0 };
    current.revenue += Number(order.total);
    current.orders += 1;
    byMonth.set(key, current);
  }

  const series = [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, point]) => point);

  const orderIds = new Set(orders.map((order) => order.id));
  const itemRows = (itemsRes.data ?? []).filter(
    (item) => range === "all" || orderIds.has(item.order_id)
  );

  const sales = new Map<string, TopProductSales>();
  for (const item of itemRows) {
    const current = sales.get(item.product_id) ?? {
      name: item.name,
      sales: 0,
      productId: item.product_id,
    };
    current.sales += Number(item.quantity);
    sales.set(item.product_id, current);
  }

  const topProducts = [...sales.values()]
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return {
    series,
    topProducts,
    revenue,
    orders: orderCount,
    customers,
    aov,
  };
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  await requireAdmin();
  const supabase = await createClient();

  const [analytics, attentionRes, recentRes, lowStockRes] = await Promise.all([
    getAnalytics("all"),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .neq("status", "cancelled")
      .in("fulfillment_status", ["unfulfilled", "partial"])
      .order("placed_at", { ascending: false })
      .order("sort_order", { referencedTable: "order_events", ascending: true })
      .limit(8),
    supabase
      .from("orders")
      .select(ORDER_SELECT)
      .order("placed_at", { ascending: false })
      .order("sort_order", { referencedTable: "order_events", ascending: true })
      .limit(8),
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .is("archived_at", null)
      .lte("stock", 6)
      .order("stock", { ascending: true })
      .limit(8),
  ]);

  throwIfError(attentionRes.error);
  throwIfError(recentRes.error);
  throwIfError(lowStockRes.error);

  const [attentionOrders, recentOrders] = await Promise.all([
    attachCustomers(((attentionRes.data ?? []) as OrderRow[]).map(mapOrder)),
    attachCustomers(((recentRes.data ?? []) as OrderRow[]).map(mapOrder)),
  ]);

  return {
    revenue: analytics.revenue,
    orders: analytics.orders,
    customers: analytics.customers,
    aov: analytics.aov,
    attentionOrders,
    recentOrders,
    lowStock: ((lowStockRes.data ?? []) as ProductRow[]).map(mapProduct),
  };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const analytics = await getAnalytics();
  return {
    revenue: analytics.revenue,
    orders: analytics.orders,
    customers: analytics.customers,
    aov: analytics.aov,
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) return mapStoreSettings(null);
  return mapStoreSettings(data);
}

export async function listAdminCategories(): Promise<Category[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });
  throwIfError(error);
  return (data ?? []).map(mapCategory);
}

export async function listAdminBanners(): Promise<HomepageBanner[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("homepage_banners")
    .select("*")
    .order("sort_order", { ascending: true });
  throwIfError(error);
  return (data ?? []).map(mapBanner);
}

export async function listAdminCoupons(): Promise<Coupon[]> {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map(mapCoupon);
}
