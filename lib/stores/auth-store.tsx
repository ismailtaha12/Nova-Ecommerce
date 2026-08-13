"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CheckoutState, Customer, Order } from "@/lib/types";
import { demoCustomer, orders as seedOrders } from "@/lib/data";

type AuthContextValue = {
  user: Customer | null;
  login: () => void;
  logout: () => void;
  updateProfile: (patch: Partial<Customer>) => void;
  orders: Order[];
  addOrder: (order: Order) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const defaultCheckout: CheckoutState = {
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>(seedOrders);

  const login = useCallback(() => setUser(demoCustomer), []);
  const logout = useCallback(() => setUser(null), []);
  const updateProfile = useCallback((patch: Partial<Customer>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);
  const addOrder = useCallback((order: Order) => {
    setOrders((prev) => [order, ...prev]);
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, updateProfile, orders, addOrder }),
    [user, login, logout, updateProfile, orders, addOrder]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { defaultCheckout };
