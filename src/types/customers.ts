export type CustomerAccountStatus = "active" | "suspended" | "blocked";

export interface AdminCustomerListItem {
    id: string;
    email: string | null;
    full_name: string | null;
    phone: string | null;
    created_at: string;
    last_sign_in_at: string | null;
    account_status: CustomerAccountStatus | null;
    total_orders: number;
    lifetime_value: number;
    last_order_date: string | null;
}

export interface AdminCustomersListResponse {
    customers: AdminCustomerListItem[];
    page: number;
    limit: number;
    total: number;
    total_pages: number;
}

export interface CustomerOrderSummary {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    payment_status: string;
    subtotal: number;
    shipping_amount: number;
    total_amount: number;
    discount_amount: number;
    coupon_code: string | null;
    item_lines: number;
    units_count: number;
    shipping_city: string | null;
    shipping_state: string | null;
    shipping_pincode: string | null;
}

export interface CustomerAddress {
    id: string;
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2: string | null;
    city: string;
    state: string;
    pincode: string;
    country: string;
    is_default_shipping: boolean;
    is_default_billing: boolean;
    created_at: string;
}

export interface CustomerInteraction {
    id: string;
    event_type: string;
    note: string | null;
    created_at: string;
    created_by: string | null;
}

export interface AdminCustomerDetails {
    customer: AdminCustomerListItem;
    total_spent: number;
    avg_order_value: number;
    repeat_purchase_rate: number;
    orders: CustomerOrderSummary[];
    addresses: CustomerAddress[];
    interactions: CustomerInteraction[];
    internal_notes: string | null;
    preferences: {
        newsletter_opt_in: boolean;
        marketing_opt_in: boolean;
        sms_opt_in: boolean;
        preferred_language: string;
    };
}
