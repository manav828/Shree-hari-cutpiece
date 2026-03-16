// Order & related TypeScript types — aligned with actual Supabase schema

// Supports custom admin-defined statuses in addition to built-ins
export type OrderStatus = string;

// Custom status created by admin in settings
export interface CustomOrderStatus {
    id: string;
    label: string;
    color: string; // hex color, e.g. "#6366f1"
    sort_order: number;
    created_at: string;
}

export type PaymentStatus =
    | "pending"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";

export type PaymentMethod = "cod" | "razorpay";

export type SellingMode = "meter" | "piece";

// ── Matches public.order_addresses ───────────────────────────────────────────
export interface OrderAddress {
    id: string;
    order_id: string;
    type: "shipping" | "billing";
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

// ── Matches public.order_items (existing + new columns) ──────────────────────
export interface OrderItem {
    id: string;
    order_id: string;
    product_id?: string | null;
    variant_id?: string | null;
    product_name: string;
    color_name?: string | null;       // existing column name
    image_url?: string | null;
    selling_mode: SellingMode;
    quantity_or_meters: number;       // existing column name
    price_per_unit: number;           // existing column name
    total_price: number;
}

// ── Matches public.order_status_history ──────────────────────────────────────
export interface OrderStatusHistory {
    id: string;
    order_id: string;
    from_status?: string | null;
    to_status: string;
    changed_by?: string | null;
    note?: string | null;
    created_at: string;
}

// ── Matches public.orders (existing + new columns) ───────────────────────────
export interface Order {
    id: string;
    order_number: string;
    user_id?: string | null;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method: PaymentMethod;
    razorpay_order_id?: string | null;
    razorpay_payment_id?: string | null;
    // existing columns
    shipping_cost: number;
    total_amount: number;
    delivery_address: string;
    contact_phone: string;
    // new extended columns
    subtotal: number;
    discount_amount: number;
    shipping_amount: number;
    coupon_id?: string | null;
    coupon_code?: string | null;
    tracking_url?: string | null;
    label_printed: boolean;
    notes?: string | null;
    created_at: string;
    updated_at: string;
}

/** Order with joined items + shipping address (listing page) */
export interface OrderWithItems extends Order {
    items: OrderItem[];
    shipping_address?: OrderAddress | null;
}

/** Full order with all relations (detail page) */
export interface OrderWithDetails extends Order {
    items: OrderItem[];
    shipping_address?: OrderAddress | null;
    billing_address?: OrderAddress | null;
    status_history: OrderStatusHistory[];
    user_email?: string | null;
}

/** Filters for listing page */
export interface OrderFilters {
    search?: string;
    status?: OrderStatus | "all";
    payment_status?: PaymentStatus | "all";
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
}

/** Paginated response */
export interface OrdersResponse {
    orders: OrderWithItems[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

/** Summary card data */
export interface OrderStats {
    total_orders: number;
    pending_orders: number;
    shipped_today: number;
    revenue_today: number;
}
