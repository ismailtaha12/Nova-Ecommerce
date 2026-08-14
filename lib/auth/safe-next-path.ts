/** Reject open redirects: only same-origin relative paths. */
export function safeNextPath(value: unknown, fallback = "/account"): string {
  if (typeof value !== "string") return fallback;
  const path = value.trim();
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    path.includes("\\") ||
    path.includes("://")
  ) {
    return fallback;
  }
  return path;
}

export function isProtectedPath(path: string) {
  return path.startsWith("/account") || path.startsWith("/admin");
}
