import type { Coupon, CouponEligibilityInput, CouponEligibilityResult } from "@/types/coupons";

export function normalizeCouponCode(code: string): string {
    return code.trim().toUpperCase();
}

export function isCouponActive(coupon: Coupon, now = new Date()): boolean {
    if (coupon.status !== "active") return false;
    const startsAt = new Date(coupon.starts_at);
    if (Number.isNaN(startsAt.getTime())) return false;
    if (now < startsAt) return false;
    if (coupon.ends_at) {
        const endsAt = new Date(coupon.ends_at);
        if (!Number.isNaN(endsAt.getTime()) && now > endsAt) return false;
    }
    return true;
}

export function calculateCouponDiscount(coupon: Coupon, subtotal: number): number {
    if (subtotal <= 0) return 0;

    if (coupon.discount_type === "percentage") {
        const baseDiscount = (subtotal * coupon.discount_value) / 100;
        const capped = coupon.max_discount_cap ? Math.min(baseDiscount, coupon.max_discount_cap) : baseDiscount;
        return Math.min(capped, subtotal);
    }

    const fixedDiscount = coupon.discount_value;
    return Math.min(fixedDiscount, subtotal);
}

export function evaluateCouponEligibility(input: CouponEligibilityInput): CouponEligibilityResult {
    const {
        coupon,
        subtotal,
        userId,
        userCompletedOrders = 0,
        isAssignedUser = false,
        userRedemptions = 0,
        globalRedemptions = 0,
        now = new Date(),
    } = input;

    if (!isCouponActive(coupon, now)) {
        return { isEligible: false, reason: "Coupon is inactive or expired." };
    }

    if (coupon.min_cart_subtotal && subtotal < coupon.min_cart_subtotal) {
        return { isEligible: false, reason: `Minimum order amount is ₹${coupon.min_cart_subtotal}.` };
    }

    if (coupon.specific_user_only && !userId) {
        return { isEligible: false, reason: "Please login to use this coupon." };
    }

    if (coupon.specific_user_only && !isAssignedUser) {
        return { isEligible: false, reason: "This coupon is available for selected users only." };
    }

    if (
        coupon.max_completed_orders_for_eligibility !== null
        && coupon.max_completed_orders_for_eligibility !== undefined
        && userCompletedOrders > coupon.max_completed_orders_for_eligibility
    ) {
        return {
            isEligible: false,
            reason: `Available only for customers with up to ${coupon.max_completed_orders_for_eligibility} completed orders.`,
        };
    }

    if (coupon.global_usage_limit !== null && coupon.global_usage_limit !== undefined) {
        if (globalRedemptions >= coupon.global_usage_limit) {
            return { isEligible: false, reason: "Coupon usage limit has been reached." };
        }
    }

    if (coupon.per_user_usage_limit !== null && coupon.per_user_usage_limit !== undefined) {
        if (!userId) {
            return { isEligible: false, reason: "Please login to use this coupon." };
        }
        if (userRedemptions >= coupon.per_user_usage_limit) {
            return { isEligible: false, reason: "You have already used this coupon the maximum number of times." };
        }
    }

    return { isEligible: true };
}
