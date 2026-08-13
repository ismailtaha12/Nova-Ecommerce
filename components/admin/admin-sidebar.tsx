"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Box,
  LayoutDashboard,
  Package,
  Settings,
  ShoppingBag,
  Tag,
  Ticket,
  Users,
  Warehouse,
  Star,
} from "lucide-react";
import { NovaMark } from "@/components/navigation/nova-mark";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/inventory", label: "Inventory", icon: Warehouse },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-full flex-col border-b border-border bg-card lg:h-screen lg:w-56 lg:border-r lg:border-b-0">
      <div className="flex h-14 items-center px-5">
        <Link href="/admin" aria-label="Admin home">
          <NovaMark compact />
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6" aria-label="Admin">
        {items.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-sm whitespace-nowrap transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="size-4" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Link
        href="/"
        className="mt-auto hidden px-5 py-4 text-xs text-muted-foreground hover:text-foreground lg:block"
      >
        <Box className="mr-2 inline size-3.5" />
        View storefront
      </Link>
    </aside>
  );
}
