"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { NovaMark } from "@/components/navigation/nova-mark";
import { Container } from "@/components/layout/container";
import { Button, buttonVariants } from "@/components/ui/button";
import { useCart } from "@/lib/stores/cart-store";
import { useWishlist } from "@/lib/stores/wishlist-store";
import { useAuth } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Store" },
  { href: "/products", label: "Products" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const scrolledRef = useRef(false);
  const { count, setCartOpen, setSearchOpen } = useCart();
  const { ids } = useWishlist();
  const { user } = useAuth();

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const y = window.scrollY;
      const next = scrolledRef.current ? y > 8 : y > 16;
      if (next !== scrolledRef.current) {
        scrolledRef.current = next;
        setScrolled(next);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setSearchOpen]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 h-16 border-b bg-background/80 backdrop-blur-md backdrop-saturate-150",
        "transition-[background-color,border-color,box-shadow] duration-300 ease-out",
        scrolled
          ? "border-border/80 bg-background/95 shadow-[0_1px_0_0_rgba(12,12,12,0.04)]"
          : "border-transparent"
      )}
    >
      <Container className="grid h-full grid-cols-[1fr_auto_1fr] items-center gap-4">
        <Link href="/" aria-label="Nova home" className="justify-self-start shrink-0">
          <NovaMark />
        </Link>

        <nav
          className="hidden items-center justify-center gap-8 justify-self-center lg:flex"
          aria-label="Primary"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13px] tracking-wide text-foreground/80 transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-self-end gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setSearchOpen(true)}
          >
            <Search strokeWidth={1.5} />
          </Button>
          <Link
            href="/account"
            aria-label={user ? "Account" : "Sign in"}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}
          >
            <User strokeWidth={1.5} />
            {user ? (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-ember" />
            ) : null}
          </Link>
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "relative"
            )}
          >
            <Heart strokeWidth={1.5} />
            {ids.length > 0 ? (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-ember" />
            ) : null}
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Bag, ${count} items`}
            className="relative"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag strokeWidth={1.5} />
            {count > 0 ? (
              <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] text-background">
                {count}
              </span>
            ) : null}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X strokeWidth={1.5} /> : <Menu strokeWidth={1.5} />}
          </Button>
        </div>
      </Container>

      {mobileOpen ? (
        <nav
          className="absolute inset-x-0 top-16 border-t border-border bg-background lg:hidden"
          aria-label="Mobile"
        >
          <Container className="flex flex-col py-6">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="border-b border-border py-4 text-lg tracking-tight"
              >
                {link.label}
              </Link>
            ))}
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
