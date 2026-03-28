import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;

function clampLimit(value: number) {
    if (!Number.isFinite(value)) return DEFAULT_LIMIT;
    return Math.min(Math.max(value, 1), MAX_LIMIT);
}

function cleanQuery(value: string) {
    return value.replace(/[%_]/g, "").trim();
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = cleanQuery(searchParams.get("query") || "");
        const idsParam = (searchParams.get("ids") || "").trim();
        const limit = clampLimit(Number(searchParams.get("limit") || DEFAULT_LIMIT));

        let baseQuery = supabaseAdmin
            .from("products")
            .select("id, name, slug")
            .eq("is_active", true);

        if (idsParam) {
            const ids = idsParam
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);

            if (ids.length === 0) {
                return NextResponse.json({ products: [] });
            }

            const { data, error } = await baseQuery.in("id", ids);
            if (error) throw error;

            const products = (data ?? []) as Array<{ id: string; name: string; slug: string | null }>;
            const orderMap = new Map(ids.map((id, index) => [id, index]));
            const ordered = products.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));

            return NextResponse.json({ products: ordered });
        }

        if (query.length < 2) {
            return NextResponse.json({ products: [] });
        }

        const { data, error } = await baseQuery
            .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
            .order("name", { ascending: true })
            .limit(limit);

        if (error) throw error;

        return NextResponse.json({ products: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to search products";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
