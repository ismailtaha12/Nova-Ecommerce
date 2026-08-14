import { z } from "zod";

export const shippingAddressSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  line1: z.string().trim().min(1, "Street address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  zip: z.string().trim().min(1, "ZIP is required"),
  country: z.string().trim().min(1).default("United States"),
});

export const cartItemSchema = z.object({
  productId: z.string().min(1),
  variant: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().positive(),
});

export const placeOrderSchema = z.object({
  items: z.array(cartItemSchema).min(1, "Cart is empty"),
  shippingAddress: shippingAddressSchema,
  delivery: z.enum(["standard", "express", "overnight"]),
  saveAddress: z.boolean().optional(),
  couponCode: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid email"),
  name: z.string().trim().min(1, "Name is required"),
  phone: z.string().trim().optional(),
  shippingAmount: z.number().nonnegative().optional(),
  shippingRateId: z.string().optional(),
  carrier: z.string().optional(),
  shippingService: z.string().optional(),
});

export const trackOrderSchema = z.object({
  number: z.string().trim().min(3),
  email: z.string().trim().email(),
});

export type PlaceOrderInput = z.infer<typeof placeOrderSchema>;
