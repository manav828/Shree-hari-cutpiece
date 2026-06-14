import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("site_settings")
            .select("key, value")
            .in("key", ["show_product_reviews", "allow_user_reviews"]);

        if (error) throw error;

        const map: Record<string, string> = {};
        (data || []).forEach((row) => { map[row.key] = row.value; });

        const parseBoolean = (raw: string | undefined, defaultVal: boolean): boolean => {
            if (raw === undefined || raw === null) return defaultVal;
            const clean = String(raw).replace(/"/g, "").trim().toLowerCase();
            return clean === "true" || clean === "1";
        };

        const showProductReviews = parseBoolean(map["show_product_reviews"], true);
        const allowUserReviews = parseBoolean(map["allow_user_reviews"], true);

        return NextResponse.json({ showProductReviews, allowUserReviews });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();

        const updates: Array<{ key: string; value: string }> = [];

        if (typeof body.showProductReviews === "boolean") {
            updates.push({ key: "show_product_reviews", value: String(body.showProductReviews) });
        }
        if (typeof body.allowUserReviews === "boolean") {
            updates.push({ key: "allow_user_reviews", value: String(body.allowUserReviews) });
        }

        if (updates.length === 0) {
            return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("site_settings")
            .upsert(updates, { onConflict: "key" });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
