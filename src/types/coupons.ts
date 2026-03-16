export type CouponDiscountType = "percentage" | "fixed";
export type CouponStatus = "active" | "inactive" | "archived";

export interface Coupon {
    id: string;
    code: string;
    name: string;
    description: string | null;
    discount_type: CouponDiscountType;
    discount_value: number;
    max_discount_cap: number | null;
    min_cart_subtotal: number | null;
    max_completed_orders_for_eligibility: number | null;
    global_usage_limit: number | null;
    per_user_usage_limit: number | null;
    status: CouponStatus;
    starts_at: string;
    ends_at: string | null;
    show_on_home_banner: boolean;
    show_on_checkout_modal: boolean;
    specific_user_only: boolean;
    destination_url: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CouponEligibilityInput {
    coupon: Coupon;
    subtotal: number;
    userId?: string | null;
    userCompletedOrders?: number;
    isAssignedUser?: boolean;
    userRedemptions?: number;
    globalRedemptions?: number;
    now?: Date;
}

export interface CouponEligibilityResult {
    isEligible: boolean;
    reason?: string;
}

export interface CouponValidationResponse {
    valid: boolean;
    message: string;
    coupon?: Coupon;
    discountAmount?: number;
    finalSubtotal?: number;
}
