import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { normalizeCouponCode } from "@/lib/coupons";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("coupons")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ coupons: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch coupons";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const code = normalizeCouponCode(body.code ?? "");
        if (!code) {
            return NextResponse.json({ error: "Coupon code is required." }, { status: 400 });
        }

        const payload = {
            code,
            name: body.name?.trim() || code,
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
            status: body.status || "active",
            starts_at: body.starts_at || new Date().toISOString(),
            ends_at: body.ends_at || null,
            show_on_home_banner: Boolean(body.show_on_home_banner),
            show_on_checkout_modal: body.show_on_checkout_modal !== false,
            specific_user_only: Boolean(body.specific_user_only),
            destination_url: body.destination_url?.trim() || null,
        };

        if (!["percentage", "fixed"].includes(payload.discount_type)) {
            return NextResponse.json({ error: "Invalid discount type." }, { status: 400 });
        }

        if (!payload.discount_value || payload.discount_value <= 0) {
            return NextResponse.json({ error: "Discount value must be greater than 0." }, { status: 400 });
        }

        const { data: coupon, error: insertError } = await supabaseAdmin
            .from("coupons")
            .insert(payload)
            .select("*")
            .single();

        if (insertError) throw insertError;

        const assignedUserIds: string[] = Array.isArray(body.assigned_user_ids)
            ? body.assigned_user_ids.filter(Boolean)
            : [];

        if (assignedUserIds.length > 0 && coupon?.id) {
            const assignmentRows = assignedUserIds.map((userId) => ({
                coupon_id: coupon.id,
                user_id: userId,
            }));
            const { error: assignmentError } = await supabaseAdmin
                .from("coupon_user_assignments")
                .insert(assignmentRows);

            if (assignmentError) throw assignmentError;
        }

        return NextResponse.json({ coupon }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create coupon";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
