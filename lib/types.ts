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
  archived?: boolean;
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

export type SessionUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: "customer" | "admin";
  joinedAt: string;
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
  userId: string;
  customerName?: string;
  customerEmail?: string;
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

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  orders: number;
  spent: number;
  joinedAt: string;
};

export type AdminCustomerDetail = AdminCustomer & {
  role: SessionUser["role"];
  addresses: Address[];
  orderHistory: Order[];
};

export type StoreSettings = {
  storeName: string;
  origin: string;
  supportEmail: string;
  updatedAt: string;
};

export type AnalyticsRange = "30d" | "90d" | "all";

export type AnalyticsPoint = { month: string; revenue: number; orders: number };
export type TopProductSales = { name: string; sales: number; productId?: string };

export type AdminDashboard = {
  revenue: number;
  orders: number;
  customers: number;
  aov: number;
  attentionOrders: Order[];
  recentOrders: Order[];
  lowStock: Product[];
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

export const defaultCheckout: CheckoutState = {
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  address: {
    name: "",
    line1: "",
    city: "",
    state: "",
    zip: "",
    country: "United States",
  },
  delivery: "standard",
  paymentMethod: "card",
};
