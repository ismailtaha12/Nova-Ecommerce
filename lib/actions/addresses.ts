"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data-access/auth";

const createAddressSchema = z.object({
  label: z.string().trim().min(1).default("Home"),
  name: z.string().trim().min(1, "Name is required"),
  line1: z.string().trim().min(1, "Street address is required"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State is required"),
  zip: z.string().trim().min(1, "ZIP is required"),
  country: z.string().trim().min(1).default("United States"),
  isDefault: z.boolean().optional(),
});

const addressIdSchema = z.object({
  addressId: z.string().uuid(),
});

function revalidateAddresses() {
  revalidatePath("/account/addresses");
  revalidatePath("/account", "layout");
  revalidatePath("/checkout");
}

export async function createAddressAction(input: unknown) {
  const user = await requireUser();
  const parsed = createAddressSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const supabase = await createClient();

  if (parsed.data.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { data, error } = await supabase
    .from("addresses")
    .insert({
      user_id: user.id,
      label: parsed.data.label,
      name: parsed.data.name,
      line1: parsed.data.line1,
      line2: parsed.data.line2 || null,
      city: parsed.data.city,
      state: parsed.data.state,
      zip: parsed.data.zip,
      country: parsed.data.country,
      is_default: parsed.data.isDefault ?? false,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidateAddresses();
  return { id: data.id };
}

export async function deleteAddressAction(input: unknown) {
  const user = await requireUser();
  const parsed = addressIdSchema.safeParse(
    typeof input === "string" ? { addressId: input } : input
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("addresses")
    .delete()
    .eq("id", parsed.data.addressId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidateAddresses();
  return { ok: true as const };
}

export async function setDefaultAddressAction(input: unknown) {
  const user = await requireUser();
  const parsed = addressIdSchema.safeParse(
    typeof input === "string" ? { addressId: input } : input
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid address" };
  }

  const supabase = await createClient();
  const { data: address, error: lookupError } = await supabase
    .from("addresses")
    .select("id")
    .eq("id", parsed.data.addressId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupError) return { error: lookupError.message };
  if (!address) return { error: "Address not found." };

  const { error: unsetError } = await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", user.id);

  if (unsetError) return { error: unsetError.message };

  const { error } = await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", address.id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidateAddresses();
  return { ok: true as const };
}
