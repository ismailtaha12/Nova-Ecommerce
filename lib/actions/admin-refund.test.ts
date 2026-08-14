import { beforeEach, describe, expect, it, vi } from "vitest";
import { createMockSupabase, createQueryBuilder } from "@/lib/test/supabase-mock";

const { requireAdmin, createClient, refundPayment } = vi.hoisted(() => ({
  requireAdmin: vi.fn(),
  createClient: vi.fn(),
  refundPayment: vi.fn(),
}));

vi.mock("@/lib/data-access/auth", () => ({ requireAdmin }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("@/lib/payments/stripe", () => ({ refundPayment }));

import { refundOrderAction } from "@/lib/actions/admin";

describe("refundOrderAction", () => {
  beforeEach(() => {
    requireAdmin.mockResolvedValue({ id: "admin", role: "admin" });
  });

  it("rejects a missing order", async () => {
    createClient.mockResolvedValue(
      createMockSupabase({ from: () => createQueryBuilder({ data: null }) }),
    );
    expect(await refundOrderAction("missing")).toEqual({ error: "Order not found." });
  });

  it("rejects an already refunded order", async () => {
    createClient.mockResolvedValue(
      createMockSupabase({
        from: () =>
          createQueryBuilder({
            data: { id: "ord_1", stripe_payment_intent_id: "pi_1", payment_status: "refunded" },
          }),
      }),
    );
    expect(await refundOrderAction("ord_1")).toEqual({ error: "Already refunded." });
    expect(refundPayment).not.toHaveBeenCalled();
  });

  it("refunds Stripe then restocks", async () => {
    const supabase = createMockSupabase({
      from: () =>
        createQueryBuilder({
          data: { id: "ord_1", stripe_payment_intent_id: "pi_1", payment_status: "paid" },
        }),
    });
    createClient.mockResolvedValue(supabase);
    refundPayment.mockResolvedValue({ id: "re_1" });

    expect(await refundOrderAction("ord_1")).toEqual({ ok: true });
    expect(refundPayment).toHaveBeenCalledWith("pi_1");
    expect(supabase.rpc).toHaveBeenCalledWith("restock_order", { p_order_id: "ord_1" });
  });

  it("does not restock if Stripe refund fails", async () => {
    const supabase = createMockSupabase({
      from: () =>
        createQueryBuilder({
          data: { id: "ord_1", stripe_payment_intent_id: "pi_1", payment_status: "paid" },
        }),
    });
    createClient.mockResolvedValue(supabase);
    refundPayment.mockRejectedValue(new Error("card already refunded"));

    expect(await refundOrderAction("ord_1")).toEqual({ error: "card already refunded" });
    expect(supabase.rpc).not.toHaveBeenCalled();
  });
});
