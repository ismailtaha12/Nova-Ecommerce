import { getSessionUser, requireAdmin, requireUser } from "@/lib/data-access/auth";
import { mapAddress, mapOrder, type OrderRow } from "@/lib/data-access/mappers";
import { createClient } from "@/lib/supabase/server";
import type { Address, FulfillmentStatus, Order, OrderStatus } from "@/lib/types";

const ORDER_SELECT = "*, order_items(*), order_events(*)" as const;

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

function sanitizeOrderKey(id: string) {
  return id.replace(/[^a-zA-Z0-9-]/g, "");
}

function sanitizeIlike(value: string) {
  return value.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();
}

type ProfileLite = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
};

function customerLabel(profile: ProfileLite | undefined, fallback = "Customer") {
  if (!profile) return fallback;
  return `${profile.first_name} ${profile.last_name}`.trim() || profile.email || fallback;
}

export async function attachCustomers(orders: Order[]): Promise<Order[]> {
  const ids = [...new Set(orders.map((order) => order.userId).filter(Boolean))];
  if (ids.length === 0) return orders;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .in("id", ids);
  throwIfError(error);

  const profiles = new Map((data ?? []).map((row) => [row.id, row]));
  return orders.map((order) => {
    const profile = profiles.get(order.userId);
    return {
      ...order,
      customerName: customerLabel(profile),
      customerEmail: profile?.email ?? "",
    };
  });
}

export async function listMyOrders(): Promise<Order[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("user_id", user.id)
    .order("placed_at", { ascending: false })
    .order("sort_order", { referencedTable: "order_events", ascending: true });
  throwIfError(error);
  return ((data ?? []) as OrderRow[]).map(mapOrder);
}

export async function getOrderById(id: string): Promise<Order | null> {
  await requireUser();
  const key = sanitizeOrderKey(id);
  if (!key) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .or(`id.eq.${key},number.eq.${key}`)
    .order("sort_order", { referencedTable: "order_events", ascending: true })
    .maybeSingle();
  throwIfError(error);
  return data ? mapOrder(data as OrderRow) : null;
}

export async function getAdminOrderById(id: string): Promise<Order | null> {
  await requireAdmin();
  const key = sanitizeOrderKey(id);
  if (!key) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .or(`id.eq.${key},number.eq.${key}`)
    .order("sort_order", { referencedTable: "order_events", ascending: true })
    .maybeSingle();
  throwIfError(error);
  if (!data) return null;
  const [order] = await attachCustomers([mapOrder(data as OrderRow)]);
  return order ?? null;
}

export type AdminOrderFilters = {
  q?: string;
  status?: OrderStatus | "all";
  fulfillment?: FulfillmentStatus | "all";
};

export async function listAllOrders(filters: AdminOrderFilters = {}): Promise<Order[]> {
  await requireAdmin();
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(ORDER_SELECT)
    .order("placed_at", { ascending: false })
    .order("sort_order", { referencedTable: "order_events", ascending: true });

  const q = filters.q ? sanitizeIlike(filters.q) : "";
  if (q) {
    query = query.ilike("number", `%${q}%`);
  }
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.fulfillment && filters.fulfillment !== "all") {
    query = query.eq("fulfillment_status", filters.fulfillment);
  }

  const { data, error } = await query;
  throwIfError(error);
  return attachCustomers(((data ?? []) as OrderRow[]).map(mapOrder));
}

export async function listMyAddresses(): Promise<Address[]> {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map(mapAddress);
}

export async function listWishlistIds(): Promise<string[]> {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map((row) => row.product_id);
}
