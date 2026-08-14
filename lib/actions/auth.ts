"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/data-access/auth";
import { safeNextPath } from "@/lib/auth/safe-next-path";

function validationError(error: z.ZodError): { error: string } {
  return { error: error.issues[0]?.message ?? "Invalid input" };
}

function formRecord(formData: FormData) {
  return Object.fromEntries(
    [...formData.entries()].map(([key, value]) => [
      key,
      typeof value === "string" ? value : "",
    ])
  );
}

async function requestOrigin() {
  const headerList = await headers();
  const origin = headerList.get("origin");
  if (origin) return origin;
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  if (!host) return "http://localhost:3000";
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

const signUpSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
  next: z.string().optional(),
});

const resetSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUpAction(formData: FormData) {
  const parsed = signUpSchema.safeParse(formRecord(formData));
  if (!parsed.success) return validationError(parsed.error);

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/account`,
      data: {
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
      },
    },
  });

  if (error) return { error: error.message };

  if (!data.session) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    if (signInError) {
      return {
        error: "Check your email to confirm your account.",
        needsConfirm: true,
      };
    }
  }

  revalidatePath("/", "layout");
  redirect("/account");
}

export async function signInAction(formData: FormData) {
  const parsed = signInSchema.safeParse(formRecord(formData));
  if (!parsed.success) return validationError(parsed.error);

  const next = safeNextPath(parsed.data.next);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: "Invalid email or password." };

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function resetPasswordAction(formData: FormData) {
  const parsed = resetSchema.safeParse(formRecord(formData));
  if (!parsed.success) return validationError(parsed.error);

  const origin = await requestOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/auth/update-password`,
  });

  if (error) return { error: error.message };
  return { ok: true as const };
}

export async function updatePasswordAction(formData: FormData) {
  await requireUser();
  const parsed = updatePasswordSchema.safeParse(formRecord(formData));
  if (!parsed.success) return validationError(parsed.error);

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  redirect("/account");
}
