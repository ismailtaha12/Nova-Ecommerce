export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="border border-border bg-card p-5">
      <p className="text-[11px] tracking-[0.2em] text-muted-foreground uppercase">{label}</p>
      <p className="mt-3 text-3xl font-medium tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
