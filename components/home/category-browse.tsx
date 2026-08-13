import Link from "next/link";
import { Container, Section } from "@/components/layout/container";
import { browseCategories } from "@/lib/catalog";

export function CategoryBrowse() {
  return (
    <Section className="border-t border-border">
      <Container>
        <p className="text-[11px] font-medium tracking-[0.22em] text-muted-foreground uppercase">
          Browse
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Shop by category.
        </h2>

        <div className="mt-10 overflow-hidden rounded-[2rem] border border-border bg-card lg:mt-12 lg:rounded-[2.5rem]">
          <div className="grid divide-y divide-border lg:grid-cols-5 lg:divide-x lg:divide-y-0">
            {browseCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={cat.href}
                className="group flex min-h-[132px] flex-col justify-between gap-8 p-7 transition-colors hover:bg-muted/45 sm:p-8"
              >
                <span className="text-sm leading-snug text-muted-foreground">
                  {cat.description}
                </span>
                <span className="text-xl font-semibold tracking-tight text-foreground transition-opacity group-hover:opacity-80">
                  {cat.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
