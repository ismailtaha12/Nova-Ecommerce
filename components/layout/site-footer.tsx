import Link from "next/link";
import { Container } from "@/components/layout/container";
import { NovaMark } from "@/components/navigation/nova-mark";
import { NewsletterForm } from "@/components/layout/newsletter-form";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/products", label: "All products" },
      { href: "/products?category=audio", label: "Audio" },
      { href: "/products?category=wearables", label: "Wearables" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/orders/track", label: "Order status" },
      { href: "/account", label: "Account" },
      { href: "/products", label: "Shipping" },
      { href: "/products", label: "Returns" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/", label: "About Nova" },
      { href: "/", label: "Design" },
      { href: "/admin", label: "Admin" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/", label: "Privacy" },
      { href: "/", label: "Terms" },
      { href: "/", label: "Warranty" },
    ],
  },
];

export function SiteFooter({
  storeName = "Nova",
  origin = "San Francisco",
  supportEmail = "support@nova.example",
}: {
  storeName?: string;
  origin?: string;
  supportEmail?: string;
}) {
  return (
    <footer className="mt-auto border-t border-border bg-background">
      <Container className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <NovaMark />
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            Consumer electronics, designed with restraint. Designed in {origin}.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Support:{" "}
            <a href={`mailto:${supportEmail}`} className="hover:text-foreground">
              {supportEmail}
            </a>
          </p>
          <NewsletterForm />
        </div>
        {columns.map((col) => (
          <div key={col.title} className="lg:col-span-2">
            <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              {col.title}
            </p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-foreground/80 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <Container className="flex flex-col gap-2 border-t border-border py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {storeName}. All rights reserved.</p>
        <p>A fictional storefront for demonstration.</p>
      </Container>
    </footer>
  );
}
