import { describe, expect, it } from "vitest";
import { isProtectedPath, safeNextPath } from "@/lib/auth/safe-next-path";

describe("isProtectedPath", () => {
  it("protects account and admin, not checkout or catalog", () => {
    expect(isProtectedPath("/account")).toBe(true);
    expect(isProtectedPath("/account/orders")).toBe(true);
    expect(isProtectedPath("/admin/orders")).toBe(true);
    expect(isProtectedPath("/checkout")).toBe(false);
    expect(isProtectedPath("/checkout/success")).toBe(false);
    expect(isProtectedPath("/orders/track")).toBe(false);
    expect(isProtectedPath("/products")).toBe(false);
  });
});

describe("safeNextPath", () => {
  it("allows same-origin relative paths", () => {
    expect(safeNextPath("/checkout")).toBe("/checkout");
    expect(safeNextPath("/account/orders")).toBe("/account/orders");
  });

  it("rejects open redirects", () => {
    expect(safeNextPath("https://evil.example/phish")).toBe("/account");
    expect(safeNextPath("//evil.example")).toBe("/account");
    expect(safeNextPath("/\\evil")).toBe("/account");
    expect(safeNextPath("javascript:alert(1)")).toBe("/account");
    expect(safeNextPath(null)).toBe("/account");
  });
});
