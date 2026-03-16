import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { normalizeCouponCode } from "@/lib/coupons";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const couponId = params.id;

        const [{ data: coupon, error: couponError }, { data: assignments, error: assignmentsError }] = await Promise.all([
            supabaseAdmin.from("coupons").select("*").eq("id", couponId).single(),
            supabaseAdmin.from("coupon_user_assignments").select("user_id").eq("coupon_id", couponId),
        ]);

        if (couponError) throw couponError;
        if (assignmentsError) throw assignmentsError;

        return NextResponse.json({
            coupon,
            assigned_user_ids: (assignments ?? []).map((row: { user_id: string }) => row.user_id),
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch coupon";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const couponId = params.id;
        const body = await req.json();

        const updatePayload: Record<string, unknown> = {
            name: body.name?.trim(),
            description: body.description?.trim() || null,
            discount_type: body.discount_type,
            discount_value: Number(body.discount_value || 0),
            max_discount_cap: body.max_discount_cap ? Number(body.max_discount_cap) : null,
            min_cart_subtotal: body.min_cart_subtotal ? Number(body.min_cart_subtotal) : null,
            max_completed_orders_for_eligibility: body.max_completed_orders_for_eligibility !== "" && body.max_completed_orders_for_eligibility !== null
                ? Number(body.max_completed_orders_for_eligibility)
                : null,
            global_usage_limit: body.global_usage_limit ? Number(body.global_usage_limit) : null,
            per_user_usage_limit: body.per_user_usage_limit ? Number(body.per_user_usage_limit) : null,
            status: body.status,
            starts_at: body.starts_at,
            ends_at: body.ends_at || null,
            show_on_home_banner: Boolean(body.show_on_home_banner),
            show_on_checkout_modal: body.show_on_checkout_modal !== false,
            specific_user_only: Boolean(body.specific_user_only),
            destination_url: body.destination_url?.trim() || null,
        };

        if (typeof body.code === "string" && body.code.trim()) {
            updatePayload.code = normalizeCouponCode(body.code);
        }

        Object.keys(updatePayload).forEach((key) => {
            if (typeof updatePayload[key] === "undefined") {
                delete updatePayload[key];
            }
        });

        const { data: coupon, error } = await supabaseAdmin
            .from("coupons")
            .update(updatePayload)
            .eq("id", couponId)
            .select("*")
            .single();

        if (error) throw error;

        if (Array.isArray(body.assigned_user_ids)) {
            const assignedUserIds = body.assigned_user_ids.filter(Boolean);
            await supabaseAdmin.from("coupon_user_assignments").delete().eq("coupon_id", couponId);

            if (assignedUserIds.length > 0) {
                const rows = assignedUserIds.map((userId: string) => ({
                    coupon_id: couponId,
                    user_id: userId,
                }));
                const { error: assignmentError } = await supabaseAdmin
                    .from("coupon_user_assignments")
                    .insert(rows);
                if (assignmentError) throw assignmentError;
            }
        }

        return NextResponse.json({ coupon });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update coupon";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
