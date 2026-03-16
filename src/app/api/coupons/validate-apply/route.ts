import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { calculateCouponDiscount, evaluateCouponEligibility, normalizeCouponCode } from "@/lib/coupons";
import type { Coupon } from "@/types/coupons";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const code = normalizeCouponCode(body?.code || "");
        const subtotal = Number(body?.subtotal || 0);
        const userId = body?.userId as string | undefined;

        if (!code) {
            return NextResponse.json({ valid: false, message: "Please enter a coupon code." }, { status: 400 });
        }

        const { data: couponData, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .ilike("code", code)
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        if (!couponData) {
            return NextResponse.json({ valid: false, message: "Invalid coupon code." }, { status: 404 });
        }

        const coupon = couponData as Coupon;

        let userCompletedOrders = 0;
        if (userId) {
            const { count } = await supabaseAdmin
                .from("orders")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId)
                .in("status", ["delivered", "completed"]);
            userCompletedOrders = count ?? 0;
        }

        const [assignmentRes, redemptionRes] = await Promise.all([
            userId
                ? supabaseAdmin
                    .from("coupon_user_assignments")
                    .select("id", { count: "exact", head: true })
                    .eq("coupon_id", coupon.id)
                    .eq("user_id", userId)
                : Promise.resolve({ count: 0 }),
            supabaseAdmin
                .from("coupon_redemptions")
                .select("user_id")
                .eq("coupon_id", coupon.id),
        ]);

        const redemptions = (redemptionRes.data ?? []) as { user_id: string | null }[];
        const globalRedemptions = redemptions.length;
        const userRedemptions = userId
            ? redemptions.filter((row) => row.user_id === userId).length
            : 0;

        const eligibility = evaluateCouponEligibility({
            coupon,
            subtotal,
            userId,
            userCompletedOrders,
            isAssignedUser: (assignmentRes.count ?? 0) > 0,
            userRedemptions,
            globalRedemptions,
        });

        if (!eligibility.isEligible) {
            return NextResponse.json({ valid: false, message: eligibility.reason }, { status: 400 });
        }

        const discountAmount = calculateCouponDiscount(coupon, subtotal);
        const finalSubtotal = Math.max(subtotal - discountAmount, 0);

        return NextResponse.json({
            valid: true,
            message: "Coupon applied successfully.",
            coupon,
            discountAmount,
            finalSubtotal,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to validate coupon";
        return NextResponse.json({ valid: false, message }, { status: 500 });
    }
}
