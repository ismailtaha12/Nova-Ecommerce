export type ProductVariant = {
  id: string;
  name: string;
  skuKey: string;
  price?: number;
  stock: number;
  options: Record<string, string>;
  sortOrder: number;
};

export type ProductCategory = string;

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  parentId?: string;
  sortOrder: number;
  archived?: boolean;
};

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
  categoryId: string;
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

export type HomepageBanner = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  active: boolean;
  startsAt?: string;
  endsAt?: string;
};

export type CouponType = "percent" | "fixed";

export type Coupon = {
  id: string;
  code: string;
  description: string;
  type: CouponType;
  amount: number;
  minSubtotal: number;
  maxUses: number | null;
  uses: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
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
  variantId?: string;
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
  userId: string | null;
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
  discount: number;
  couponCode?: string;
  total: number;
  timeline: OrderTimelineEvent[];
  carrier?: string;
  shippingService?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  labelUrl?: string;
  stripePaymentIntentId?: string;
  guestPhone?: string;
};

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  variant: string;
  variantId?: string;
  price: number;
  quantity: number;
  stock: number;
};

export type InventoryLog = {
  id: string;
  productId: string;
  variantId?: string;
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
  disabled?: boolean;
};

export type AdminCustomerDetail = AdminCustomer & {
  role: SessionUser["role"];
  notes: string;
  addresses: Address[];
  orderHistory: Order[];
};

export type StoreSettings = {
  storeName: string;
  origin: string;
  supportEmail: string;
  taxRate: number;
  freeShippingThreshold: number;
  fallbackStandardShipping: number;
  fallbackExpressShipping: number;
  fallbackOvernightShipping: number;
  originName: string;
  originLine1: string;
  originCity: string;
  originState: string;
  originZip: string;
  originCountry: string;
  demoMode: boolean;
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

export type ShippingRateOption = {
  id: string;
  delivery: DeliveryMethod;
  name: string;
  detail: string;
  amount: number;
  carrier?: string;
  service?: string;
};

export type CheckoutState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: Omit<Address, "id" | "label" | "isDefault">;
  delivery: DeliveryMethod;
  paymentMethod: "card" | "apple-mock";
  couponCode: string;
  saveAddress: boolean;
  shippingRateId?: string;
  shippingAmount?: number;
  carrier?: string;
  shippingService?: string;
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
  couponCode: "",
  saveAddress: false,
};
