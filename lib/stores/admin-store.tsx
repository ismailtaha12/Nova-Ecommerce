"use client";

import { useContext, createContext } from "react";
import type { Product } from "@/lib/types";

type AdminContextValue = {
  products: Product[];
  createProduct: (product: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  archiveProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
};

const AdminContext = createContext<AdminContextValue | null>(null);

const empty: AdminContextValue = {
  products: [],
  createProduct: () => {},
  updateProduct: () => {},
  archiveProduct: () => {},
  adjustStock: () => {},
};

export function useAdmin() {
  return useContext(AdminContext) ?? empty;
}
