import type { Json, Tables } from "@/lib/supabase/database.types";
import type {
  Address,
  Category,
  Coupon,
  FulfillmentStatus,
  HomepageBanner,
  InventoryLog,
  Order,
  OrderLine,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductVariant,
  Review,
  StoreSettings,
} from "@/lib/types";
import { defaultStoreSettings, variantPrice } from "@/lib/commerce";

export type ProductRow = Tables<"products"> & {
  product_variants?: Tables<"product_variants">[] | null;
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

function mapOptions(options: Json): Record<string, string> {
  return mapSpecs(options);
}

export function mapVariant(row: Tables<"product_variants">): ProductVariant {
  const price = row.price != null ? Number(row.price) : undefined;
  return {
    id: row.id,
    name: row.name,
    skuKey: row.sku_key,
    price: price != null && Number.isFinite(price) ? price : undefined,
    stock: Number(row.stock),
    options: mapOptions(row.options),
    sortOrder: Number(row.sort_order),
  };
}

export function mapProduct(row: ProductRow): Product {
  const compareAt =
    row.compare_at_price != null ? Number(row.compare_at_price) : undefined;
  const variants = [...(row.product_variants ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(mapVariant);
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
    category: row.category,
    categoryId: row.category_id,
    variants,
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
    variantId: row.variant_id ?? undefined,
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
    customerName: row.guest_name ?? undefined,
    customerEmail: row.guest_email ?? undefined,
    paymentStatus: row.payment_status as PaymentStatus,
    fulfillmentStatus: row.fulfillment_status as FulfillmentStatus,
    status: row.status as OrderStatus,
    items: (row.order_items ?? []).map(mapOrderLine),
    shippingAddress: mapShippingAddress(row.shipping_address),
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    tax: Number(row.tax),
    discount: Number(row.discount ?? 0),
    couponCode: row.coupon_code ?? undefined,
    total: Number(row.total),
    timeline: events.map((event) => ({
      label: event.label,
      date: event.occurred_at ?? "",
      complete: event.complete,
    })),
    carrier: row.carrier ?? undefined,
    shippingService: row.shipping_service ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    trackingUrl: row.tracking_url ?? undefined,
    labelUrl: row.label_url ?? undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
    guestPhone: row.guest_phone ?? undefined,
  };
}

export function mapInventoryLog(row: Tables<"inventory_logs">): InventoryLog {
  return {
    id: row.id,
    productId: row.product_id,
    variantId: row.variant_id ?? undefined,
    sku: row.sku,
    change: Number(row.change),
    reason: row.reason,
    date: row.created_at,
  };
}

export function mapCategory(row: Tables<"categories">): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    parentId: row.parent_id ?? undefined,
    sortOrder: Number(row.sort_order),
    archived: row.archived_at != null,
  };
}

export function mapBanner(row: Tables<"homepage_banners">): HomepageBanner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    ctaLabel: row.cta_label,
    ctaHref: row.cta_href,
    sortOrder: Number(row.sort_order),
    active: row.active,
    startsAt: row.starts_at ?? undefined,
    endsAt: row.ends_at ?? undefined,
  };
}

export function mapCoupon(row: Tables<"coupons">): Coupon {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    type: row.type,
    amount: Number(row.amount),
    minSubtotal: Number(row.min_subtotal),
    maxUses: row.max_uses,
    uses: Number(row.uses),
    startsAt: row.starts_at ?? undefined,
    expiresAt: row.expires_at ?? undefined,
    active: row.active,
  };
}

export function mapStoreSettings(row: Tables<"store_settings"> | null): StoreSettings {
  if (!row) return defaultStoreSettings;
  return {
    storeName: row.store_name,
    origin: row.origin,
    supportEmail: row.support_email,
    taxRate: Number(row.tax_rate ?? defaultStoreSettings.taxRate),
    freeShippingThreshold: Number(
      row.free_shipping_threshold ?? defaultStoreSettings.freeShippingThreshold,
    ),
    fallbackStandardShipping: Number(
      row.fallback_standard_shipping ?? defaultStoreSettings.fallbackStandardShipping,
    ),
    fallbackExpressShipping: Number(
      row.fallback_express_shipping ?? defaultStoreSettings.fallbackExpressShipping,
    ),
    fallbackOvernightShipping: Number(
      row.fallback_overnight_shipping ?? defaultStoreSettings.fallbackOvernightShipping,
    ),
    originName: row.origin_name ?? defaultStoreSettings.originName,
    originLine1: row.origin_line1 ?? defaultStoreSettings.originLine1,
    originCity: row.origin_city ?? defaultStoreSettings.originCity,
    originState: row.origin_state ?? defaultStoreSettings.originState,
    originZip: row.origin_zip ?? defaultStoreSettings.originZip,
    originCountry: row.origin_country ?? defaultStoreSettings.originCountry,
    demoMode: Boolean(row.demo_mode),
    updatedAt: row.updated_at,
  };
}

export { variantPrice };
