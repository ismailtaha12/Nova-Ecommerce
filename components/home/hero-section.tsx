import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/layout/container";
import { products } from "@/lib/data";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

const heroProduct = products[0];

const specs = [
  { value: "40 hrs", label: "Battery life" },
  { value: "265 g", label: "Aluminium build" },
  { value: "2 yrs", label: "Nova care" },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background lg:flex lg:min-h-[calc(100svh-4rem)] lg:items-center">
      <Container className="grid w-full items-center gap-10 py-10 sm:py-12 lg:grid-cols-2 lg:gap-14 lg:py-14">
        <div className="max-w-xl">
          <p
            className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase animate-fade-rise"
          >
            New — Pulse
          </p>
          <h1
            className="mt-5 text-4xl leading-[1.02] font-semibold tracking-tight text-balance sm:text-5xl lg:text-[3.5rem] xl:text-[3.75rem] animate-fade-rise"
            style={{ animationDelay: "60ms" }}
          >
            Technology, beautifully designed.
          </h1>
          <p
            className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg animate-fade-rise"
            style={{ animationDelay: "120ms" }}
          >
            Devices built from honest materials and quiet engineering. Nothing
            extra, nothing missing.
          </p>
          <div
            className="mt-8 animate-fade-rise"
            style={{ animationDelay: "180ms" }}
          >
            <Link
              href="/products"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-8 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              Shop now
              <ArrowRight className="size-4" strokeWidth={1.5} />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Starting with{" "}
              <Link
                href={`/products/${heroProduct.slug}`}
                className="font-medium text-foreground underline-offset-4 transition-opacity hover:opacity-70 hover:underline"
              >
                {heroProduct.name}
              </Link>{" "}
              · {formatPrice(heroProduct.price)}
            </p>
          </div>
          <div
            className="mt-10 border-t border-border pt-8 animate-fade-rise"
            style={{ animationDelay: "240ms" }}
          >
            <dl className="grid grid-cols-3 gap-4 sm:gap-8">
              {specs.map((spec) => (
                <div key={spec.label}>
                  <dt className="text-base font-medium tabular-nums sm:text-lg">
                    {spec.value}
                  </dt>
                  <dd className="mt-1 text-xs text-muted-foreground sm:text-sm">
                    {spec.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div
          className="relative animate-fade-rise"
          style={{ animationDelay: "240ms" }}
        >
          <div className="relative mx-auto h-[min(44vh,380px)] w-full max-w-lg overflow-hidden rounded-[2rem] bg-[#efeae2] sm:h-[min(48vh,420px)] lg:mx-0 lg:h-[min(54vh,500px)] lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute bottom-[14%] left-1/2 h-8 w-[62%] -translate-x-1/2 rounded-[100%] bg-ink/12 blur-2xl"
            />
            <div className="absolute inset-0 flex items-center justify-center p-8 pb-16 animate-slow-float">
              <Image
                src={heroProduct.images[0]}
                alt={heroProduct.name}
                width={520}
                height={520}
                priority
                className="h-full w-full object-contain drop-shadow-[0_24px_40px_rgba(12,12,12,0.12)]"
              />
            </div>
            <Link
              href={`/products/${heroProduct.slug}`}
              className={cn(
                "absolute bottom-5 left-5 flex items-center gap-4 rounded-2xl bg-white px-5 py-3.5",
                "shadow-[0_8px_30px_rgba(12,12,12,0.08)] transition-transform duration-200 hover:-translate-y-0.5"
              )}
            >
              <span>
                <span className="block text-sm font-medium text-foreground">
                  {heroProduct.name}
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground tabular-nums">
                  {formatPrice(heroProduct.price)}
                </span>
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-muted">
                <ArrowRight className="size-4" strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
