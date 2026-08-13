import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SessionUser } from "@/lib/types";

const PROFILE_SELECT =
  "id, first_name, last_name, email, phone, role, created_at" as const;

type ProfileRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
  created_at: string;
};

async function getClaimsIdentity() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  const id = typeof claims?.sub === "string" ? claims.sub : null;
  const email = typeof claims?.email === "string" ? claims.email : "";
  return { supabase, id, email };
}

function mapProfile(profile: ProfileRow): SessionUser {
  return {
    id: profile.id,
    email: profile.email,
    firstName: profile.first_name,
    lastName: profile.last_name,
    phone: profile.phone,
    role: profile.role as SessionUser["role"],
    joinedAt: profile.created_at,
  };
}

async function loadProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

async function ensureProfile(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string,
  email: string,
): Promise<ProfileRow> {
  const existing = await loadProfile(supabase, id);
  if (existing) return existing;

  const { error: insertError } = await supabase.from("profiles").insert({
    id,
    email,
    first_name: "",
    last_name: "",
    role: "customer",
  });

  if (insertError && insertError.code !== "23505") {
    throw new Error(insertError.message);
  }

  const profile = await loadProfile(supabase, id);
  if (!profile) {
    throw new Error("Account profile could not be created.");
  }
  return profile;
}

export async function requireUser(): Promise<{ id: string; email: string }> {
  const { id, email } = await getClaimsIdentity();
  if (!id) {
    redirect("/login");
  }
  return { id, email };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const { supabase, id, email } = await getClaimsIdentity();
  if (!id) return null;

  const profile = await ensureProfile(supabase, id, email);
  return mapProfile(profile);
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?next=/admin");
  }
  if (user.role !== "admin") {
    redirect("/");
  }
  return user;
}
