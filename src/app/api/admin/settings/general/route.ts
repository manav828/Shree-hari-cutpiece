import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("site_settings")
            .select("key, value")
            .eq("key", "website_name")
            .maybeSingle();

        if (error) throw error;

        const websiteName = data?.value || "The Artisanal Archive";

        return NextResponse.json({ websiteName });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const websiteName = String(body.websiteName || "").trim();

        if (!websiteName) {
            return NextResponse.json({ error: "Website name cannot be empty." }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("site_settings")
            .upsert({ key: "website_name", value: websiteName }, { onConflict: "key" });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
