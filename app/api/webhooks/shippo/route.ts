import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { mapOrder, type OrderRow } from "@/lib/data-access/mappers";
import { notifyOrderEvent } from "@/lib/notifications";

export async function POST(request: NextRequest) {
  const token = process.env.SHIPPO_WEBHOOK_TOKEN;
  if (token) {
    const header = request.headers.get("x-shippo-token") ?? request.nextUrl.searchParams.get("token");
    if (header !== token) return new Response("Unauthorized", { status: 401 });
  }

  const payload = (await request.json()) as {
    event?: string;
    data?: {
      tracking_number?: string;
      tracking_status?: { status?: string };
      tracking_url_provider?: string;
    };
  };

  const tracking = payload.data?.tracking_number;
  if (!tracking) return Response.json({ received: true });

  const supabase = createAdminClient();
  const { data: row } = await supabase
    .from("orders")
    .select("*, order_items(*), order_events(*)")
    .eq("tracking_number", tracking)
    .maybeSingle();
  if (!row) return Response.json({ received: true });

  const status = (payload.data?.tracking_status?.status ?? "").toUpperCase();
  if (status === "TRANSIT" || status === "UNKNOWN") {
    await supabase
      .from("orders")
      .update({
        fulfillment_status: "shipped",
        status: "shipped",
        tracking_url: payload.data?.tracking_url_provider ?? row.tracking_url,
      })
      .eq("id", row.id);
    await supabase
      .from("order_events")
      .update({ complete: true, occurred_at: new Date().toISOString() })
      .eq("order_id", row.id)
      .eq("label", "Shipped");
    await notifyOrderEvent(mapOrder(row as OrderRow), "shipment");
  }

  if (status === "DELIVERED") {
    await supabase.from("orders").update({ status: "delivered" }).eq("id", row.id);
    await supabase
      .from("order_events")
      .update({ complete: true, occurred_at: new Date().toISOString() })
      .eq("order_id", row.id)
      .eq("label", "Delivered");
    await notifyOrderEvent({ ...mapOrder(row as OrderRow), status: "delivered" }, "delivered");
  }

  return Response.json({ received: true });
}
