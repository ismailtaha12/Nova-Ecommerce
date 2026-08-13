import type { Json, Tables } from "@/lib/supabase/database.types";
import type {
  Address,
  FulfillmentStatus,
  InventoryLog,
  Order,
  OrderLine,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductCategory,
  ProductVariant,
  Review,
} from "@/lib/types";

export type ProductRow = Tables<"products"> & {
  product_variants?:
    | Pick<Tables<"product_variants">, "id" | "name" | "sku_key">[]
    | null;
};

export type OrderRow = Tables<"orders"> & {
  order_items?: Tables<"order_items">[] | null;
  order_events?: Tables<"order_events">[] | null;
};

function asRecord(
  value: Json | null | undefined,
): Record<string, Json | undefined> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Json | undefined>;
  }
  return {};
}

function str(value: Json | undefined, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function mapSpecs(specs: Json): Record<string, string> {
  const obj = asRecord(specs);
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value == null) continue;
    out[key] = typeof value === "string" ? value : String(value);
  }
  return out;
}

function mapVariant(
  row: Pick<Tables<"product_variants">, "id" | "name">,
): ProductVariant {
  return { id: row.id, name: row.name };
}

export function mapProduct(row: ProductRow): Product {
  const compareAt =
    row.compare_at_price != null ? Number(row.compare_at_price) : undefined;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    tagline: row.tagline,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: Number.isFinite(compareAt) ? compareAt : undefined,
    rating: Number(row.rating),
    reviewCount: Number(row.review_count),
    category: row.category as ProductCategory,
    variants: (row.product_variants ?? []).map(mapVariant),
    images: row.images ?? [],
    stock: Number(row.stock),
    featured: row.featured,
    bestSeller: row.best_seller,
    newest: row.newest,
    onSale: row.on_sale,
    archived: row.archived_at != null,
    specs: mapSpecs(row.specs),
    shipping: row.shipping,
    returns: row.returns,
  };
}

export function mapReview(row: Tables<"reviews">): Review {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author,
    rating: Number(row.rating),
    title: row.title,
    body: row.body,
    date: row.created_at,
    verified: row.verified,
  };
}

export function mapAddress(row: Tables<"addresses">): Address {
  return {
    id: row.id,
    label: row.label,
    name: row.name,
    line1: row.line1,
    line2: row.line2 ?? undefined,
    city: row.city,
    state: row.state,
    zip: row.zip,
    country: row.country,
    isDefault: row.is_default,
  };
}

function mapShippingAddress(value: Json): Address {
  const obj = asRecord(value);
  const line2 = str(obj.line2);
  return {
    id: str(obj.id, "shipping"),
    label: str(obj.label, "Shipping"),
    name: str(obj.name),
    line1: str(obj.line1),
    line2: line2 || undefined,
    city: str(obj.city),
    state: str(obj.state),
    zip: str(obj.zip),
    country: str(obj.country, "United States"),
    isDefault: Boolean(obj.isDefault ?? obj.is_default),
  };
}

function mapOrderLine(row: Tables<"order_items">): OrderLine {
  return {
    productId: row.product_id,
    slug: row.slug,
    name: row.name,
    image: row.image,
    variant: row.variant,
    price: Number(row.price),
    quantity: Number(row.quantity),
  };
}

export function mapOrder(row: OrderRow): Order {
  const events = [...(row.order_events ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return {
    id: row.id,
    number: row.number,
    date: row.placed_at,
    userId: row.user_id,
    paymentStatus: row.payment_status as PaymentStatus,
    fulfillmentStatus: row.fulfillment_status as FulfillmentStatus,
    status: row.status as OrderStatus,
    items: (row.order_items ?? []).map(mapOrderLine),
    shippingAddress: mapShippingAddress(row.shipping_address),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    total: Number(row.total),
    timeline: events.map((event) => ({
      label: event.label,
      date: event.occurred_at ?? "",
      complete: event.complete,
    })),
  };
}

export function mapInventoryLog(row: Tables<"inventory_logs">): InventoryLog {
  return {
    id: row.id,
    productId: row.product_id,
    sku: row.sku,
    change: Number(row.change),
    reason: row.reason,
    date: row.created_at,
  };
}
