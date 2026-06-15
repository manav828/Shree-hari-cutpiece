import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export type StateGroup = {
  id: string;
  name: string;
  states: string[];
  charge: number;
};

export type ShippingRatesConfig = {
  defaultFee: number;
  freeThreshold: number;
  codFee: number;
  codAdvanceType: "none" | "flat" | "percent";
  codAdvanceValue: number;
  stateGroups: StateGroup[];
  taxMode: "none" | "add_extra" | "included";
  taxRate: number;
};

export async function getShippingRatesConfig(): Promise<ShippingRatesConfig> {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "shipping_default_fee",
        "shipping_free_threshold",
        "shipping_cod_fee",
        "shipping_cod_advance_type",
        "shipping_cod_advance_value",
        "shipping_state_groups",
        "tax_mode",
        "tax_rate",
      ]);

    if (error) throw error;

    const settingsMap: Record<string, string> = (data ?? []).reduce<Record<string, string>>((acc, row) => {
      let val = row.value;
      if (typeof val === "string") {
        try {
          val = JSON.parse(val);
        } catch {
          // Fallback
        }
      }
      acc[row.key] = String(val ?? "");
      return acc;
    }, {});

    let stateGroups: StateGroup[] = [];
    if (settingsMap["shipping_state_groups"]) {
      try {
        stateGroups = JSON.parse(settingsMap["shipping_state_groups"]);
      } catch {
        // Fallback if it is not valid JSON
      }
    }

    return {
      defaultFee: Number(settingsMap["shipping_default_fee"] ?? 99),
      freeThreshold: Number(settingsMap["shipping_free_threshold"] ?? 999),
      codFee: Number(settingsMap["shipping_cod_fee"] ?? 0),
      codAdvanceType: (settingsMap["shipping_cod_advance_type"] || "none") as "none" | "flat" | "percent",
      codAdvanceValue: Number(settingsMap["shipping_cod_advance_value"] ?? 0),
      stateGroups: Array.isArray(stateGroups) ? stateGroups : [],
      taxMode: (settingsMap["tax_mode"] || "none") as "none" | "add_extra" | "included",
      taxRate: Number(settingsMap["tax_rate"] ?? 0),
    };
  } catch (err) {
    console.error("Error loading shipping/tax rates config:", err);
    return {
      defaultFee: 99,
      freeThreshold: 999,
      codFee: 0,
      codAdvanceType: "none",
      codAdvanceValue: 0,
      stateGroups: [],
      taxMode: "none",
      taxRate: 0,
    };
  }
}

export type CheckoutDetails = {
  subtotal: number;
  discount: number;
  discountedSubtotal: number;
  shippingFee: number;
  codFee: number;
  taxAmount: number;
  totalAmount: number;
  advanceAmount: number;
  remainingAmount: number;
};

export function calculateCheckoutDetails(
  subtotal: number,
  discount: number,
  state: string,
  paymentMethod: string,
  config: ShippingRatesConfig
): CheckoutDetails {
  const discountedSubtotal = Math.max(subtotal - discount, 0);

  // 1. Calculate shipping fee (0 if subtotal matches/exceeds threshold)
  let shippingFee = config.defaultFee;
  if (discountedSubtotal >= config.freeThreshold) {
    shippingFee = 0;
  } else {
    // Check if state is in any specific state groups
    const matchedGroup = config.stateGroups.find((g) =>
      g.states.some((s) => s.toLowerCase() === state.toLowerCase())
    );
    if (matchedGroup) {
      shippingFee = matchedGroup.charge;
    }
  }

  // 2. COD Surcharge
  const isCod = paymentMethod.toLowerCase() === "cod";
  const appliedCodFee = isCod ? config.codFee : 0;

  // 3. Tax calculation
  let taxAmount = 0;
  let totalBeforeTax = discountedSubtotal + shippingFee + appliedCodFee;
  let totalAmount = totalBeforeTax;

  if (config.taxMode === "add_extra") {
    taxAmount = Math.round(discountedSubtotal * (config.taxRate / 100));
    totalAmount = totalBeforeTax + taxAmount;
  } else if (config.taxMode === "included") {
    // Tax is included in the discounted subtotal
    taxAmount = Math.round(discountedSubtotal - (discountedSubtotal / (1 + config.taxRate / 100)));
  }

  // 4. Advance payment amount for COD
  let advanceAmount = 0;
  if (isCod) {
    if (config.codAdvanceType === "flat") {
      advanceAmount = Math.min(config.codAdvanceValue, totalAmount);
    } else if (config.codAdvanceType === "percent") {
      advanceAmount = Math.round((config.codAdvanceValue / 100) * totalAmount);
    }
  }

  const remainingAmount = totalAmount - advanceAmount;

  return {
    subtotal,
    discount,
    discountedSubtotal,
    shippingFee,
    codFee: appliedCodFee,
    taxAmount,
    totalAmount,
    advanceAmount,
    remainingAmount,
  };
}
