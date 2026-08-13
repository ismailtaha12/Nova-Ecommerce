import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import { AppProviders } from "@/lib/stores/providers";
import { getSessionUser } from "@/lib/data-access/auth";
import { listWishlistIds } from "@/lib/data-access/orders";
import "./globals.css";

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nova — Technology, beautifully designed.",
    template: "%s · Nova",
  },
  description:
    "Nova designs consumer electronics with restraint: headphones, earbuds, speakers, wearables, and power — from San Francisco.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, wishlistIds] = await Promise.all([
    getSessionUser(),
    listWishlistIds(),
  ]);

  return (
    <html lang="en" className={`${instrument.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <AppProviders user={user} wishlistIds={wishlistIds}>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
