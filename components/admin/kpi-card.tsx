import Link from "next/link";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 text-3xl font-medium tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </>
  );

  const className = cn(
    "border border-border bg-card p-5",
    href && "block transition-colors hover:bg-muted/40"
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return <div className={className}>{inner}</div>;
}
