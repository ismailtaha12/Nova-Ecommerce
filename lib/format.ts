export function formatPrice(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatCompact(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function stockLabel(stock: number) {
  if (stock <= 0) return "Out of stock";
  if (stock <= 6) return `Only ${stock} left`;
  return "In stock";
}

export function skuFor(productId: string, color?: string, variant?: string) {
  const parts = [productId, color, variant]
    .filter(Boolean)
    .map((s) => s!.replace(/\s+/g, "").slice(0, 8).toUpperCase());
  return `NV-${parts.join("-")}`;
}
