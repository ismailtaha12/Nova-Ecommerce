import { afterEach, describe, expect, it, vi } from "vitest";
import { defaultStoreSettings } from "@/lib/commerce";
import { quoteShippingRates, validateShippingAddress } from "@/lib/shipping/shippo";
import { guestAddress } from "@/lib/test/fixtures";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("validateShippingAddress without Shippo", () => {
  it("accepts a US ZIP", async () => {
    vi.stubEnv("SHIPPO_API_KEY", "");
    const result = await validateShippingAddress(guestAddress);
    expect(result.ok).toBe(true);
  });

  it("rejects a too-short postal code", async () => {
    vi.stubEnv("SHIPPO_API_KEY", "");
    const result = await validateShippingAddress({ ...guestAddress, zip: "1" });
    expect(result.ok).toBe(false);
  });
});

describe("quoteShippingRates without Shippo", () => {
  it("returns fallback rates and free standard above the threshold", async () => {
    vi.stubEnv("SHIPPO_API_KEY", "");
    const rates = await quoteShippingRates({
      address: guestAddress,
      subtotal: 80,
      settings: defaultStoreSettings,
    });
    expect(rates.map((rate) => rate.id)).toEqual(["standard", "express", "overnight"]);
    expect(rates.find((rate) => rate.delivery === "standard")?.amount).toBe(0);
    expect(rates.find((rate) => rate.delivery === "express")?.amount).toBe(18);
  });
});

describe("validateShippingAddress with Shippo", () => {
  it("maps an invalid Shippo response to an error", async () => {
    vi.stubEnv("SHIPPO_API_KEY", "shippo_test_key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            validation_results: { is_valid: false, messages: [{ text: "ZIP not found" }] },
          }),
          { status: 200 },
        ),
      ),
    );
    const result = await validateShippingAddress(guestAddress);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("ZIP not found");
  });
});
