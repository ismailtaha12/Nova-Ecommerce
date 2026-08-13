"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { defaultCheckout, type SessionUser } from "@/lib/types";

type AuthContextValue = {
  user: SessionUser | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: SessionUser | null;
}) {
  const value = useMemo(() => ({ user }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { defaultCheckout };
