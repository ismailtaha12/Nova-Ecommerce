"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import type { HomepageBanner, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function HeroSection({
  product,
  banners,
}: {
  product: Product | null;
  banners: HomepageBanner[];
}) {
  const [index, setIndex] = useState(0);
  const banner = banners[index];
  const fallbackTitle = "Technology, beautifully designed.";
  const fallbackSubtitle =
    "Devices built from honest materials and quiet engineering. Nothing extra, nothing missing.";

  return (
    <section className="relative overflow-hidden bg-background lg:flex lg:min-h-[calc(100svh-4rem)] lg:items-center">
      <Container className="grid w-full items-center gap-10 py-10 sm:py-12 lg:grid-cols-2 lg:gap-14 lg:py-14">
        <div className="max-w-xl">
          <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase animate-fade-rise">
            {product ? `New — ${product.name}` : "Featured"}
          </p>
          <h1
            className="mt-5 text-4xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] animate-fade-rise"
            style={{ animationDelay: "60ms" }}
          >
            {banner?.title ?? fallbackTitle}
          </h1>
          <p
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-rise"
            style={{ animationDelay: "120ms" }}
          >
            {banner?.subtitle ?? fallbackSubtitle}
          </p>
          <div className="mt-8 animate-fade-rise" style={{ animationDelay: "180ms" }}>
            <Link
              href={banner?.ctaHref ?? "/products"}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {banner?.ctaLabel ?? "Shop now"}
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            {product ? (
              <p className="mt-4 text-sm text-muted-foreground">
                Starting with{" "}
                <Link
                  href={`/products/${product.slug}`}
                  className="font-medium text-foreground underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
                >
                  {product.name}
                </Link>{" "}
                · {formatPrice(product.price)}
              </p>
            ) : null}
          </div>
          {banners.length > 1 ? (
            <div className="mt-8 flex gap-2">
              {banners.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show banner ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-1.5 w-8 rounded-full",
                    i === index ? "bg-foreground" : "bg-border",
                  )}
                />
              ))}
            </div>
          ) : null}
        </div>

        {(banner?.image || product?.images[0]) ? (
          <div className="relative animate-fade-rise" style={{ animationDelay: "240ms" }}>
            <div className="relative mx-auto h-[min(44vh,380px)] w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#efeae2] sm:h-[min(48vh,420px)] lg:mx-0 lg:h-[min(54vh,500px)] lg:max-w-none">
              <div
                aria-hidden="true"
                className="absolute bottom-[14%] left-1/2 h-8 w-[62%] -translate-x-1/2 rounded-[100%] bg-ink/12 blur-2xl"
              />
              <div className="absolute inset-0 flex items-center justify-center p-8 pb-16 animate-slow-float">
                <Image
                  src={banner?.image || product!.images[0]}
                  alt={banner?.title ?? product?.name ?? ""}
                  width={520}
                  height={520}
                  priority
                  className="h-full w-full object-contain drop-shadow-[0_24px_40px_rgba(12,12,12,0.12)]"
                />
              </div>
              {product ? (
                <Link
                  href={`/products/${product.slug}`}
                  className={cn(
                    "absolute bottom-5 left-5 flex items-center gap-4 rounded-2xl bg-white px-5 py-3.5",
                    "shadow-[0_8px_30px_rgba(12,12,12,0.08)] transition-transform duration-200 hover:-translate-y-0.5",
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium text-foreground">{product.name}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground tabular-nums">
                      {formatPrice(product.price)}
                    </span>
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full bg-muted">
                    <ArrowRight className="size-4" strokeWidth={1.5} />
                  </span>
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
