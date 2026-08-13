export type ProductVariant = {
  id: string;
  name: string;
};

export type ProductCategory =
  | "audio"
  | "wearables"
  | "lighting"
  | "power";

export type Product = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  category: ProductCategory;
  variants: ProductVariant[];
  images: string[];
  stock: number;
  featured?: boolean;
  bestSeller?: boolean;
  newest?: boolean;
  onSale?: boolean;
  specs: Record<string, string>;
  shipping: string;
  returns: string;
};

export type Review = {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
};

export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinedAt: string;
  addresses: Address[];
};

export type OrderStatus = "processing" | "paid" | "fulfilled" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "paid" | "pending" | "failed" | "refunded";
export type FulfillmentStatus = "unfulfilled" | "partial" | "fulfilled" | "shipped";

export type OrderLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  quantity: number;
};

export type OrderTimelineEvent = {
  label: string;
  date: string;
  complete: boolean;
};

export type Order = {
  id: string;
  number: string;
  date: string;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  status: OrderStatus;
  items: OrderLine[];
  shippingAddress: Address;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  timeline: OrderTimelineEvent[];
};

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  quantity: number;
  stock: number;
};

export type InventoryLog = {
  id: string;
  productId: string;
  sku: string;
  change: number;
  reason: string;
  date: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discount: string;
  status: "active" | "expired" | "scheduled";
  uses: number;
  limit: number;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joinedAt: string;
};

export type SortOption =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

export type DeliveryMethod = "standard" | "express" | "overnight";

export type CheckoutState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Omit<Address, "id" | "label" | "isDefault">;
  delivery: DeliveryMethod;
  paymentMethod: "card" | "apple-mock";
};
