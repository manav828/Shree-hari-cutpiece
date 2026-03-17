import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET() {
    try {
        const [
            couponsRes,
            activeCouponsRes,
            redemptionsRes,
            redemptionRowsRes,
        ] = await Promise.all([
            supabaseAdmin.from("coupons").select("id", { count: "exact", head: true }),
            supabaseAdmin.from("coupons").select("id", { count: "exact", head: true }).eq("status", "active"),
            supabaseAdmin.from("coupon_redemptions").select("id", { count: "exact", head: true }),
            supabaseAdmin.from("coupon_redemptions").select("discount_amount, order_id"),
        ]);

        if (couponsRes.error) throw couponsRes.error;
        if (activeCouponsRes.error) throw activeCouponsRes.error;
        if (redemptionsRes.error) throw redemptionsRes.error;
        if (redemptionRowsRes.error) throw redemptionRowsRes.error;

        const redemptionRows = redemptionRowsRes.data ?? [];

        const discountSpend = redemptionRows.reduce((sum, row) => {
            const amount = Number((row as { discount_amount?: number }).discount_amount || 0);
            return sum + amount;
        }, 0);

        const orderIds = Array.from(new Set(
            redemptionRows
                .map((row) => (row as { order_id?: string | null }).order_id)
                .filter((orderId): orderId is string => Boolean(orderId)),
        ));

        let influencedRevenue = 0;
        if (orderIds.length > 0) {
            const { data: orderRows, error: ordersError } = await supabaseAdmin
                .from("orders")
                .select("id, total_amount")
                .in("id", orderIds);

            if (ordersError) throw ordersError;

            influencedRevenue = (orderRows ?? []).reduce((sum, row) => {
                const total = Number((row as { total_amount?: number }).total_amount || 0);
                return sum + total;
            }, 0);
        }

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
