"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Menu } from "lucide-react";
import { NovaMark } from "@/components/navigation/nova-mark";
import { adminNavGroups, isAdminNavActive } from "@/components/admin/admin-nav";
import { signOutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type AdminUser = {
  firstName: string;
  lastName: string;
  email: string;
};

function displayName(user: AdminUser) {
  const name = `${user.firstName} ${user.lastName}`.trim();
  return name || user.email;
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-col gap-6 px-3 pb-6" aria-label="Admin">
      {adminNavGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-[11px] tracking-[0.16em] text-muted-foreground uppercase">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isAdminNavActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
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
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter({ user }: { user: AdminUser }) {
  return (
    <div className="mt-auto space-y-3 border-t border-border px-5 py-4">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{displayName(user)}</p>
        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <Box className="size-3.5" />
        View storefront
      </Link>
      <form action={signOutAction}>
        <Button type="submit" variant="outline" size="sm" className="w-full">
          Sign out
        </Button>
      </form>
    </div>
  );
}

export function AdminSidebar({ user }: { user: AdminUser }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-14 items-center px-5">
          <Link href="/admin" aria-label="Admin home">
            <NovaMark compact />
          </Link>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto pt-2">
          <NavLinks pathname={pathname} />
        </div>
        <SidebarFooter user={user} />
      </aside>

      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link href="/admin" aria-label="Admin home">
          <NovaMark compact />
        </Link>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" size="icon-sm" aria-label="Open admin menu" />
            }
          >
            <Menu className="size-4" />
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b border-border">
              <SheetTitle>Admin</SheetTitle>
            </SheetHeader>
            <div className="flex h-full flex-col overflow-y-auto pt-4">
              <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
              <SidebarFooter user={user} />
            </div>
          </SheetContent>
        </Sheet>
      </header>
    </>
  );
}
