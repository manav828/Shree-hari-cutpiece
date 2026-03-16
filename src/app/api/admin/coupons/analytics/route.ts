import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET() {
    try {
        const [
            couponsRes,
            activeCouponsRes,
            redemptionsRes,
            discountSpendRes,
            influencedRevenueRes,
        ] = await Promise.all([
            supabaseAdmin.from("coupons").select("id", { count: "exact", head: true }),
            supabaseAdmin.from("coupons").select("id", { count: "exact", head: true }).eq("status", "active"),
            supabaseAdmin.from("coupon_redemptions").select("id", { count: "exact", head: true }),
            supabaseAdmin.from("coupon_redemptions").select("discount_amount"),
            supabaseAdmin
                .from("coupon_redemptions")
                .select("order_id, orders(total_amount)")
                .not("order_id", "is", null),
        ]);

        if (couponsRes.error) throw couponsRes.error;
        if (activeCouponsRes.error) throw activeCouponsRes.error;
        if (redemptionsRes.error) throw redemptionsRes.error;
        if (discountSpendRes.error) throw discountSpendRes.error;
        if (influencedRevenueRes.error) throw influencedRevenueRes.error;

        const discountSpend = (discountSpendRes.data ?? []).reduce((sum, row) => {
            const amount = Number((row as { discount_amount?: number }).discount_amount || 0);
            return sum + amount;
        }, 0);

        const influencedRevenue = (influencedRevenueRes.data ?? []).reduce((sum, row) => {
            const orderValue = Number((row as { orders?: { total_amount?: number } | null }).orders?.total_amount || 0);
            return sum + orderValue;
        }, 0);

        return NextResponse.json({
            totalCoupons: couponsRes.count ?? 0,
            activeCoupons: activeCouponsRes.count ?? 0,
            totalRedemptions: redemptionsRes.count ?? 0,
            totalDiscountSpend: Number(discountSpend.toFixed(2)),
            influencedRevenue: Number(influencedRevenue.toFixed(2)),
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch coupon analytics";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
