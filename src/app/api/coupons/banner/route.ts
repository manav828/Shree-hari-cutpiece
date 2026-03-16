import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { evaluateCouponEligibility } from "@/lib/coupons";
import type { Coupon } from "@/types/coupons";

export async function GET(req: NextRequest) {
    try {
        const userId = req.nextUrl.searchParams.get("userId");

        const { data: couponsData, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .eq("show_on_home_banner", true)
            .eq("status", "active")
            .order("created_at", { ascending: false })
            .limit(20);

        if (error) throw error;

        const coupons = (couponsData ?? []) as Coupon[];
        if (coupons.length === 0) {
            return NextResponse.json({ coupons: [] });
        }

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
        const assignmentMap = new Map<string, boolean>();

        if (userId && couponIds.length > 0) {
            const { data: assignments } = await supabaseAdmin
                .from("coupon_user_assignments")
                .select("coupon_id")
                .eq("user_id", userId)
                .in("coupon_id", couponIds);

            for (const row of assignments ?? []) {
                assignmentMap.set((row as { coupon_id: string }).coupon_id, true);
            }
        }

        const eligibleCoupons = coupons
            .filter((coupon) => {
                const eligibility = evaluateCouponEligibility({
                    coupon,
                    subtotal: Number.MAX_SAFE_INTEGER,
                    userId,
                    userCompletedOrders,
                    isAssignedUser: assignmentMap.has(coupon.id),
                });
                return eligibility.isEligible;
            })
            .map((coupon) => ({
                id: coupon.id,
                code: coupon.code,
                title: coupon.name,
                description: coupon.description,
                destination_url: coupon.destination_url || "/shop",
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
            }));

        return NextResponse.json({ coupons: eligibleCoupons });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch banner coupons";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
