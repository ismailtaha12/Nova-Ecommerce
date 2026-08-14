import type { Address, DeliveryMethod, ShippingRateOption, StoreSettings } from "@/lib/types";
import { fallbackShipping } from "@/lib/commerce";

const SHIPPO_URL = "https://api.goshippo.com";

function shippoKey() {
  return process.env.SHIPPO_API_KEY;
}

async function shippo<T>(path: string, body: unknown): Promise<T> {
  const key = shippoKey();
  if (!key) throw new Error("SHIPPO_API_KEY is not configured.");
  const response = await fetch(`${SHIPPO_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `ShippoToken ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = (await response.json()) as T & { detail?: string };
  if (!response.ok) {
    throw new Error(data.detail || `Shippo request failed (${response.status})`);
  }
  return data;
}

export async function validateShippingAddress(address: Omit<Address, "id" | "label" | "isDefault">) {
  if (!shippoKey()) {
    const zip = address.zip.trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9\s-]{2,10}$/.test(zip)) {
      return { ok: false as const, error: "Enter a valid ZIP / postal code." };
    }
    return { ok: true as const, address };
  }

  type ShippoAddress = {
    is_complete?: boolean;
    validation_results?: { is_valid?: boolean; messages?: { text?: string }[] };
  };
  const result = await shippo<ShippoAddress>("/addresses/", {
    name: address.name,
    street1: address.line1,
    street2: address.line2 ?? "",
    city: address.city,
    state: address.state,
    zip: address.zip,
    country: address.country === "United States" ? "US" : address.country,
    validate: true,
  });
  const valid = result.validation_results?.is_valid !== false;
  if (!valid) {
    return {
      ok: false as const,
      error: result.validation_results?.messages?.[0]?.text ?? "Address could not be validated.",
    };
  }
  return { ok: true as const, address };
}

export async function quoteShippingRates(input: {
  address: Omit<Address, "id" | "label" | "isDefault">;
  subtotal: number;
  settings: StoreSettings;
}): Promise<ShippingRateOption[]> {
  const fallback: ShippingRateOption[] = [
    {
      id: "standard",
      delivery: "standard",
      name: "Standard",
      detail: "4–6 business days",
      amount: fallbackShipping(input.subtotal, "standard", input.settings),
    },
    {
      id: "express",
      delivery: "express",
      name: "Express",
      detail: "2 business days",
      amount: fallbackShipping(input.subtotal, "express", input.settings),
    },
    {
      id: "overnight",
      delivery: "overnight",
      name: "Overnight",
      detail: "Next business day",
      amount: fallbackShipping(input.subtotal, "overnight", input.settings),
    },
  ];

  if (!shippoKey()) return fallback;

  type ShippoRate = {
    object_id: string;
    amount: string;
    provider: string;
    servicelevel?: { name?: string };
    estimated_days?: number;
  };
  type ShippoShipment = { rates?: ShippoRate[] };

  try {
    const shipment = await shippo<ShippoShipment>("/shipments/", {
      address_from: {
        name: input.settings.originName,
        street1: input.settings.originLine1,
        city: input.settings.originCity,
        state: input.settings.originState,
        zip: input.settings.originZip,
        country: input.settings.originCountry,
      },
      address_to: {
        name: input.address.name,
        street1: input.address.line1,
        street2: input.address.line2 ?? "",
        city: input.address.city,
        state: input.address.state,
        zip: input.address.zip,
        country: input.address.country === "United States" ? "US" : input.address.country,
      },
      parcels: [
        {
          length: "10",
          width: "8",
          height: "4",
          distance_unit: "in",
          weight: "2",
          mass_unit: "lb",
        },
      ],
      async: false,
    });

    const mapped = (shipment.rates ?? [])
      .map((rate): ShippingRateOption | null => {
        const amount = Number(rate.amount);
        if (!Number.isFinite(amount)) return null;
        const name = `${rate.provider} ${rate.servicelevel?.name ?? ""}`.trim();
        const days = rate.estimated_days;
        const delivery: DeliveryMethod =
          days != null && days <= 1 ? "overnight" : days != null && days <= 2 ? "express" : "standard";
        return {
          id: rate.object_id,
          delivery,
          name,
          detail: days ? `${days} day${days === 1 ? "" : "s"}` : "Carrier transit time",
          amount,
          carrier: rate.provider,
          service: rate.servicelevel?.name,
        };
      })
      .filter((rate): rate is ShippingRateOption => Boolean(rate))
      .sort((a, b) => a.amount - b.amount)
      .slice(0, 5);

    return mapped.length > 0 ? mapped : fallback;
  } catch {
    return fallback;
  }
}

export async function purchaseShippingLabel(rateId: string) {
  type Transaction = {
    object_id: string;
    tracking_number?: string;
    tracking_url_provider?: string;
    label_url?: string;
    rate?: { provider?: string; servicelevel?: { name?: string } };
    status?: string;
    messages?: { text?: string }[];
  };
  const transaction = await shippo<Transaction>("/transactions/", {
    rate: rateId,
    label_file_type: "PDF",
    async: false,
  });
  if (transaction.status && transaction.status !== "SUCCESS") {
    throw new Error(transaction.messages?.[0]?.text ?? "Label purchase failed.");
  }
  return {
    transactionId: transaction.object_id,
    trackingNumber: transaction.tracking_number ?? "",
    trackingUrl: transaction.tracking_url_provider ?? "",
    labelUrl: transaction.label_url ?? "",
    carrier: transaction.rate?.provider ?? "",
    service: transaction.rate?.servicelevel?.name ?? "",
  };
}
