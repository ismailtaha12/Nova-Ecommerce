import type {
  AdminCustomer,
  Coupon,
  Customer,
  InventoryLog,
  Order,
  Review,
} from "@/lib/types";
import { products } from "@/lib/data/products";

const u = (id: string, w = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const browseCategories = [
  {
    slug: "audio",
    name: "Audio",
    description: "Headphones, earbuds and sound",
    href: "/products?category=audio",
  },
  {
    slug: "wearables",
    name: "Wearables",
    description: "Watches and daily companions",
    href: "/products?category=wearables",
  },
  {
    slug: "phones",
    name: "Phones",
    description: "Flagship pocket computing",
    href: "/products?category=wearables",
  },
  {
    slug: "tablets",
    name: "Tablets",
    description: "Canvas for work and ideas",
    href: "/products?category=power",
  },
  {
    slug: "home",
    name: "Home",
    description: "Sound and ambience for spaces",
    href: "/products?category=lighting",
  },
] as const;

export const reviews: Review[] = [
  {
    id: "r1",
    productId: "pulse",
    author: "Maya Chen",
    rating: 5,
    title: "The commute disappeared.",
    body: "ANC is the best I have used without that pressurized feeling. The sand color looks better in person than on a screen.",
    date: "2026-06-12",
    verified: true,
  },
  {
    id: "r2",
    productId: "pulse",
    author: "Jonah Ellis",
    rating: 4,
    title: "Almost perfect.",
    body: "Sound is even and unfatiguing. I wish the case were a little slimmer, but the cups are genuinely comfortable after three hours.",
    date: "2026-05-02",
    verified: true,
  },
  {
    id: "r3",
    productId: "arc",
    author: "Priya Nair",
    rating: 5,
    title: "Finally, earbuds that stay put.",
    body: "I run in them. They do not fall out. Calls are clear enough that people stop asking if I am outside.",
    date: "2026-07-19",
    verified: true,
  },
  {
    id: "r4",
    productId: "halo",
    author: "Chris Adeyemi",
    rating: 5,
    title: "Filled the apartment without shouting.",
    body: "Room calibration took two minutes. Bass is present, not bloated. It looks like furniture, which is the point.",
    date: "2026-04-08",
    verified: true,
  },
  {
    id: "r5",
    productId: "orbit",
    author: "Elena Voss",
    rating: 4,
    title: "A watch I actually wear.",
    body: "Battery lasts the week. The interface is restrained. Notifications are optional and stay that way.",
    date: "2026-03-22",
    verified: true,
  },
  {
    id: "r6",
    productId: "beam",
    author: "Sam Ortiz",
    rating: 5,
    title: "My desk looks finished.",
    body: "Color temperature tracking through the afternoon is subtle and correct. Build quality is what the price suggests.",
    date: "2026-02-14",
    verified: true,
  },
];

export const demoCustomer: Customer = {
  id: "cust-demo",
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex.rivera@example.com",
  phone: "+1 (415) 555-0148",
  joinedAt: "2024-11-03",
  addresses: [
    {
      id: "addr-1",
      label: "Home",
      name: "Alex Rivera",
      line1: "128 Stillman Street",
      line2: "Apt 4B",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
      country: "United States",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Office",
      name: "Alex Rivera",
      line1: "500 Third Street",
      city: "San Francisco",
      state: "CA",
      zip: "94107",
      country: "United States",
    },
  ],
};

const home = demoCustomer.addresses[0];

export const orders: Order[] = [
  {
    id: "ord-88421",
    number: "NV-88421",
    date: "2026-07-28",
    paymentStatus: "paid",
    fulfillmentStatus: "shipped",
    status: "shipped",
    items: [
      {
        productId: "pulse",
        slug: "pulse-headphones",
        name: "Pulse Headphones",
        image: products[0].images[0],
        variant: "Travel case",
        price: 349,
        quantity: 1,
      },
      {
        productId: "charge-hub",
        slug: "charge-hub",
        name: "Charge Hub",
        image: products.find((p) => p.id === "charge-hub")!.images[0],
        variant: "US plug",
        price: 89,
        quantity: 1,
      },
    ],
    shippingAddress: home,
    subtotal: 438,
    shipping: 0,
    tax: 37.23,
    total: 475.23,
    timeline: [
      { label: "Order placed", date: "2026-07-28T09:14:00", complete: true },
      { label: "Payment confirmed", date: "2026-07-28T09:14:12", complete: true },
      { label: "Fulfilled", date: "2026-07-28T16:40:00", complete: true },
      { label: "Shipped", date: "2026-07-29T11:02:00", complete: true },
      { label: "Delivered", date: "2026-08-01T00:00:00", complete: false },
    ],
  },
  {
    id: "ord-87102",
    number: "NV-87102",
    date: "2026-05-11",
    paymentStatus: "paid",
    fulfillmentStatus: "fulfilled",
    status: "delivered",
    items: [
      {
        productId: "arc",
        slug: "arc-earbuds",
        name: "Arc Earbuds",
        image: products.find((p) => p.id === "arc")!.images[0],
        variant: "Standard",
        price: 179,
        quantity: 1,
      },
    ],
    shippingAddress: home,
    subtotal: 179,
    shipping: 8,
    tax: 15.9,
    total: 202.9,
    timeline: [
      { label: "Order placed", date: "2026-05-11T13:02:00", complete: true },
      { label: "Payment confirmed", date: "2026-05-11T13:02:08", complete: true },
      { label: "Fulfilled", date: "2026-05-11T18:10:00", complete: true },
      { label: "Shipped", date: "2026-05-12T09:00:00", complete: true },
      { label: "Delivered", date: "2026-05-14T15:22:00", complete: true },
    ],
  },
];

export const inventoryLogs: InventoryLog[] = [
  { id: "log-1", productId: "halo-mini", sku: "NV-HALOMINI", change: -12, reason: "Order batch", date: "2026-08-10" },
  { id: "log-2", productId: "halo-mini", sku: "NV-HALOMINI", change: -18, reason: "Sold through", date: "2026-08-08" },
  { id: "log-3", productId: "beam-floor", sku: "NV-BEAMFLR", change: -4, reason: "Order NV-88301", date: "2026-08-07" },
  { id: "log-4", productId: "pulse", sku: "NV-PULSE", change: 40, reason: "Restock", date: "2026-08-04" },
  { id: "log-5", productId: "orbit", sku: "NV-ORBIT", change: 16, reason: "Restock", date: "2026-08-01" },
];

export const coupons: Coupon[] = [
  { id: "c1", code: "WELCOME10", description: "10% off first order", discount: "10%", status: "active", uses: 1840, limit: 5000 },
  { id: "c2", code: "STUDIO50", description: "$50 off select audio", discount: "$50", status: "active", uses: 312, limit: 800 },
  { id: "c3", code: "SUMMER26", description: "Seasonal shipping promo", discount: "Free ship", status: "expired", uses: 2201, limit: 2201 },
  { id: "c4", code: "FALL-PRE", description: "Fall preview, 15% off lighting", discount: "15%", status: "scheduled", uses: 0, limit: 1000 },
];

export const adminCustomers: AdminCustomer[] = [
  { id: "ac1", name: "Alex Rivera", email: "alex.rivera@example.com", orders: 2, spent: 678.13, joinedAt: "2024-11-03" },
  { id: "ac2", name: "Maya Chen", email: "maya.chen@example.com", orders: 5, spent: 2140, joinedAt: "2023-08-19" },
  { id: "ac3", name: "Jonah Ellis", email: "jonah.ellis@example.com", orders: 1, spent: 349, joinedAt: "2026-04-02" },
  { id: "ac4", name: "Priya Nair", email: "priya.nair@example.com", orders: 8, spent: 1890.5, joinedAt: "2022-12-11" },
  { id: "ac5", name: "Elena Voss", email: "elena.voss@example.com", orders: 3, spent: 997, joinedAt: "2025-01-28" },
];

export const revenueSeries = [
  { month: "Feb", revenue: 84200, orders: 310 },
  { month: "Mar", revenue: 91340, orders: 342 },
  { month: "Apr", revenue: 88910, orders: 328 },
  { month: "May", revenue: 102440, orders: 390 },
  { month: "Jun", revenue: 118200, orders: 441 },
  { month: "Jul", revenue: 124880, orders: 468 },
  { month: "Aug", revenue: 98040, orders: 352 },
];

export const topProducts = [
  { name: "Arc Earbuds", sales: 842 },
  { name: "Pulse Headphones", sales: 610 },
  { name: "Halo Speaker", sales: 388 },
  { name: "Charge Hub", sales: 355 },
  { name: "Orbit Sport", sales: 290 },
];

export function reviewsFor(productId: string) {
  return reviews.filter((r) => r.productId === productId);
}

export function getOrder(id: string) {
  return orders.find((o) => o.id === id || o.number === id);
}
