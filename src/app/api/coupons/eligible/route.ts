import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { evaluateCouponEligibility, calculateCouponDiscount } from "@/lib/coupons";
import type { Coupon } from "@/types/coupons";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const subtotal = Number(body?.subtotal || 0);
        const userId = body?.userId as string | undefined;

        const { data: couponsData, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .eq("show_on_checkout_modal", true)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) throw error;

        const coupons = (couponsData ?? []) as Coupon[];
        if (coupons.length === 0) return NextResponse.json({ coupons: [] });

        let userCompletedOrders = 0;
        if (userId) {
            const { count } = await supabaseAdmin
                .from("orders")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .in("status", ["delivered", "completed"]);
            userCompletedOrders = count ?? 0;
        }

        const couponIds = coupons.map((coupon) => coupon.id);
        const assignmentSet = new Set<string>();
        const userRedemptionsMap = new Map<string, number>();
        const globalRedemptionsMap = new Map<string, number>();

        if (couponIds.length > 0) {
            if (userId) {
                const { data: assignments } = await supabaseAdmin
                    .from("coupon_user_assignments")
                    .select("coupon_id")
                    .eq("user_id", userId)
                    .in("coupon_id", couponIds);

                for (const row of assignments ?? []) {
                    assignmentSet.add((row as { coupon_id: string }).coupon_id);
                }
            }

            const { data: allRedemptions } = await supabaseAdmin
                .from("coupon_redemptions")
                .select("coupon_id, user_id")
                .in("coupon_id", couponIds);

            for (const row of allRedemptions ?? []) {
                const redemption = row as { coupon_id: string; user_id: string | null };
                globalRedemptionsMap.set(
                    redemption.coupon_id,
                    (globalRedemptionsMap.get(redemption.coupon_id) ?? 0) + 1,
                );

                if (userId && redemption.user_id === userId) {
                    userRedemptionsMap.set(
                        redemption.coupon_id,
                        (userRedemptionsMap.get(redemption.coupon_id) ?? 0) + 1,
                    );
                }
            }
        }

        const eligibleCoupons = coupons
            .map((coupon) => {
                const eligibility = evaluateCouponEligibility({
                    coupon,
                    subtotal,
                    userId,
                    userCompletedOrders,
                    isAssignedUser: assignmentSet.has(coupon.id),
                    userRedemptions: userRedemptionsMap.get(coupon.id) ?? 0,
                    globalRedemptions: globalRedemptionsMap.get(coupon.id) ?? 0,
                });

                if (!eligibility.isEligible) return null;

                const discountAmount = calculateCouponDiscount(coupon, subtotal);

                return {
                    id: coupon.id,
                    code: coupon.code,
                    name: coupon.name,
                    description: coupon.description,
                    discount_type: coupon.discount_type,
                    discount_value: coupon.discount_value,
                    min_cart_subtotal: coupon.min_cart_subtotal,
                    max_completed_orders_for_eligibility: coupon.max_completed_orders_for_eligibility,
                    ends_at: coupon.ends_at,
                    discount_preview: discountAmount,
                };
            })
            .filter(Boolean)
            .sort((a, b) => (b?.discount_preview ?? 0) - (a?.discount_preview ?? 0));

        return NextResponse.json({ coupons: eligibleCoupons });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch eligible coupons";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
