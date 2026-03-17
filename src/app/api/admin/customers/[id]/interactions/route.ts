import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const customerId = params.id;
        const { searchParams } = new URL(req.url);

        const limit = Math.min(Math.max(Number(searchParams.get("limit") || "20"), 1), 100);
        const offset = Math.max(Number(searchParams.get("offset") || "0"), 0);

        const from = offset;
        const to = offset + limit - 1;

        const { data, count, error } = await supabaseAdmin
            .from("customer_interaction_logs")
            .select("id, event_type, note, created_at, created_by", { count: "exact" })
            .eq("user_id", customerId)
            .order("created_at", { ascending: false })
            .range(from, to);

        if (error) throw error;

        return NextResponse.json({
            data: data ?? [],
            total: count ?? 0,
            limit,
            offset,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch interactions";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
