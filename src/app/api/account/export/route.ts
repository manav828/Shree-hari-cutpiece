import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/apiAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(req: NextRequest) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const [authUserRes, profileRes, addressesRes, preferencesRes, ordersRes] = await Promise.all([
            supabaseAdmin.auth.admin.getUserById(userId),
            supabaseAdmin
                .from("user_profiles")
                .select("id, full_name, phone, account_status, created_at, updated_at")
                .eq("id", userId)
                .maybeSingle(),
            supabaseAdmin
                .from("user_addresses")
                .select("id, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default_shipping, is_default_billing, created_at")
                .eq("user_id", userId)
                .eq("is_deleted", false)
                .order("created_at", { ascending: false }),
            supabaseAdmin
                .from("user_profiles")
                .select("newsletter_opt_in, marketing_opt_in, sms_opt_in, preferred_language")
                .eq("id", userId)
                .maybeSingle(),
            supabaseAdmin
                .from("orders")
                .select("id, order_number, created_at, status, payment_status, total_amount")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(200),
        ]);

        if (profileRes.error) throw profileRes.error;
        if (addressesRes.error) throw addressesRes.error;
        if (preferencesRes.error) throw preferencesRes.error;
        if (ordersRes.error) throw ordersRes.error;

        const payload = {
            exported_at: new Date().toISOString(),
            account: {
                id: userId,
                email: authUserRes.data.user?.email ?? "",
                profile: profileRes.data ?? null,
                preferences: preferencesRes.data ?? null,
            },
            addresses: addressesRes.data ?? [],
            orders: ordersRes.data ?? [],
        };

        return NextResponse.json(payload, {
            status: 200,
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to export account data";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
