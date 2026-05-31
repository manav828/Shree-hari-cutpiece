import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        
        // Parse date params
        const now = new Date();
        const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const defaultEnd = now.toISOString().slice(0, 10);
        
        const startDate = searchParams.get("startDate") || defaultStart;
        const endDate = searchParams.get("endDate") || defaultEnd;

        // Fetch orders in date range
        const { data: orders, error: ordersError } = await supabaseAdmin
            .from("orders")
            .select("*")
            .gte("created_at", startDate + "T00:00:00")
            .lte("created_at", endDate + "T23:59:59")
            .order("created_at", { ascending: false });

        if (ordersError) throw ordersError;

        const orderIds = (orders ?? []).map((o) => o.id);

        // Fetch related tables in parallel if orders exist
        const [itemsRes, addressesRes, productsRes, categoriesRes] = await Promise.all([
            orderIds.length > 0
                ? supabaseAdmin.from("order_items").select("*").in("order_id", orderIds)
                : Promise.resolve({ data: [], error: null }),
            orderIds.length > 0
                ? supabaseAdmin.from("order_addresses").select("*").in("order_id", orderIds).eq("type", "shipping")
                : Promise.resolve({ data: [], error: null }),
            supabaseAdmin.from("products").select("id, category_id"),
            supabaseAdmin.from("categories").select("id, name")
        ]);

        if (itemsRes.error) throw itemsRes.error;
        if (addressesRes.error) throw addressesRes.error;
        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;

        return NextResponse.json({
            orders: orders ?? [],
            items: itemsRes.data ?? [],
            addresses: addressesRes.data ?? [],
            products: productsRes.data ?? [],
            categories: categoriesRes.data ?? []
        });

    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch reports data";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
