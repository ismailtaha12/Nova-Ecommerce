import type { OrderRow } from "@/lib/data-access/mappers";

export const guestAddress = {
  name: "Ada Lovelace",
  line1: "100 Market Street",
  city: "Oakland",
  state: "CA",
  zip: "94607",
  country: "United States",
};

export function makeOrderRow(overrides: Partial<OrderRow> = {}): OrderRow {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    number: "NV-00001",
    user_id: null,
    placed_at: "2026-08-14T12:00:00.000Z",
    payment_status: "pending",
    fulfillment_status: "unfulfilled",
    status: "processing",
    shipping_address: guestAddress,
    subtotal: 100,
    shipping: 12,
    tax: 8.5,
    total: 120.5,
    delivery: "standard",
    discount: 0,
    coupon_code: null,
    guest_email: "ada@example.com",
    guest_name: "Ada Lovelace",
    guest_phone: "+15555550100",
    stripe_payment_intent_id: null,
    carrier: null,
    shipping_service: null,
    tracking_number: null,
    tracking_url: null,
    label_url: null,
    shippo_transaction_id: null,
    shipping_rate_id: "rate_1",
    stock_released_at: null,
    order_items: [
      {
        id: "item-1",
        order_id: "11111111-1111-1111-1111-111111111111",
        product_id: "pulse",
        slug: "pulse",
        name: "Pulse",
        image: "/products/pulse.png",
        variant: "Black",
        variant_id: "pulse:black",
        price: 100,
        quantity: 1,
      },
    ],
    order_events: [
      {
        id: "evt-1",
        order_id: "11111111-1111-1111-1111-111111111111",
        label: "Order placed",
        occurred_at: "2026-08-14T12:00:00.000Z",
        complete: true,
        sort_order: 0,
      },
    ],
    ...overrides,
  };
}

export function validPlaceOrderInput() {
  return {
    items: [{ productId: "pulse", variant: "Black", variantId: "pulse:black", quantity: 1 }],
    shippingAddress: guestAddress,
    delivery: "standard" as const,
    email: "ada@example.com",
    name: "Ada Lovelace",
    phone: "+15555550100",
    shippingAmount: 12,
    shippingRateId: "rate_1",
  };
}
