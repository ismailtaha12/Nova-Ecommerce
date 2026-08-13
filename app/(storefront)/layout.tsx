import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { SearchDialog } from "@/components/navigation/search-dialog";
import { listProductSummaries } from "@/lib/data-access/products";
import { getStoreSettings } from "@/lib/data-access/admin";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [products, settings] = await Promise.all([
    listProductSummaries(),
    getStoreSettings(),
  ]);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <SiteFooter
        storeName={settings.storeName}
        origin={settings.origin}
        supportEmail={settings.supportEmail}
      />
      <CartDrawer />
      <SearchDialog products={products} />
    </>
  );
}
