type SellingMode = "meter" | "piece";

type StorefrontEventName = "view_item" | "add_to_cart" | "filter_use" | "whatsapp_click";

export const STOREFRONT_TRACKING_EVENT = "storefront:analytics-event";

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>;
  }
}

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function toFiniteNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function trackStorefrontEvent(eventName: StorefrontEventName, payload: Record<string, unknown> = {}): void {
  if (!isBrowser()) return;

  const event = {
    event: eventName,
    event_source: "storefront",
    timestamp: new Date().toISOString(),
    ...payload,
  };

  if (!Array.isArray(window.dataLayer)) {
    window.dataLayer = [];
  }
  window.dataLayer.push(event);

  window.dispatchEvent(new CustomEvent(STOREFRONT_TRACKING_EVENT, { detail: event }));

  if (process.env.NODE_ENV !== "production") {
    console.info("[storefront-tracking]", event);
  }
}

export function trackViewItem(params: {
  productId: string;
  productSlug?: string;
  productName?: string;
  variantId?: string | null;
  unitPrice?: number;
  sellingMode?: SellingMode;
  category?: string;
}): void {
  trackStorefrontEvent("view_item", {
    product_id: params.productId,
    product_slug: params.productSlug || null,
    product_name: params.productName || null,
    variant_id: params.variantId || null,
    unit_price: toFiniteNumber(params.unitPrice),
    selling_mode: params.sellingMode || null,
    category: params.category || null,
    currency: "INR",
  });
}

export function trackAddToCart(params: {
  productId: string;
  productName?: string;
  variantId?: string | null;
  unitPrice?: number;
  quantity?: number;
  sellingMode?: SellingMode;
  source?: string;
  hasOptions?: boolean;
}): void {
  trackStorefrontEvent("add_to_cart", {
    product_id: params.productId,
    product_name: params.productName || null,
    variant_id: params.variantId || null,
    unit_price: toFiniteNumber(params.unitPrice),
    quantity: toFiniteNumber(params.quantity),
    selling_mode: params.sellingMode || null,
    source: params.source || "unknown",
    has_options: Boolean(params.hasOptions),
    currency: "INR",
  });
}

export function trackFilterUse(params: {
  category: string;
  sortBy: string;
  fabricType: string;
  occasion: string;
  pattern: string;
  colorFamily: string;
  priceBand: string;
  activeFilterCount: number;
  resultCount: number;
}): void {
  trackStorefrontEvent("filter_use", {
    category: params.category,
    sort_by: params.sortBy,
    fabric_type: params.fabricType,
    occasion: params.occasion,
    pattern: params.pattern,
    color_family: params.colorFamily,
    price_band: params.priceBand,
    active_filter_count: toFiniteNumber(params.activeFilterCount),
    result_count: toFiniteNumber(params.resultCount),
  });
}

export function trackWhatsAppClick(params: {
  location: string;
  orderNumber?: string;
  productId?: string;
  productSlug?: string;
}): void {
  trackStorefrontEvent("whatsapp_click", {
    location: params.location,
    order_number: params.orderNumber || null,
    product_id: params.productId || null,
    product_slug: params.productSlug || null,
  });
}
