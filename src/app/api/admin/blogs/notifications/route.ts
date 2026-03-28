import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { toNumber } from "@/lib/blogs";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const limit = Math.min(50, Math.max(1, toNumber(searchParams.get("limit"), 10)));

        const { data, error } = await supabaseAdmin
            .from("blog_publish_notifications")
            .select("id, post_id, status, message, details, created_at, blog_posts(title, slug)")
            .order("created_at", { ascending: false })
            .limit(limit);

        if (error) throw error;

        return NextResponse.json({ notifications: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load publish notifications";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
