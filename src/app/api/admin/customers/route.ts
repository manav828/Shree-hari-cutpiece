import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import type { AdminCustomerListItem } from "@/types/customers";

const SORT_MAP = {
    joined: "created_at",
    last_order: "last_order_date",
    ltv: "lifetime_value",
    name: "full_name",
} as const;

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const page = Math.max(Number(searchParams.get("page") || "1"), 1);
        const limit = Math.min(Math.max(Number(searchParams.get("limit") || "20"), 1), 100);
        const status = (searchParams.get("status") || "all").trim();
        const search = (searchParams.get("search") || "").trim();
        const sortBy = (searchParams.get("sortBy") || "joined") as keyof typeof SORT_MAP;
        const sortField = SORT_MAP[sortBy] ?? SORT_MAP.joined;
        const ascending = sortBy === "name";

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from("admin_customer_summary")
            .select("*", { count: "exact" });

        if (status !== "all") {
            query = query.eq("account_status", status);
        }

        if (search) {
            const escapedSearch = search.replace(/,/g, "").replace(/%/g, "");
            query = query.or([
                `email.ilike.%${escapedSearch}%`,
                `full_name.ilike.%${escapedSearch}%`,
                `phone.ilike.%${escapedSearch}%`,
            ].join(","));
        }

        const { data, count, error } = await query
            .order(sortField, { ascending, nullsFirst: false })
            .range(from, to);

        if (error) throw error;

        const customers: AdminCustomerListItem[] = (data ?? []).map((row) => ({
            id: row.id,
            email: row.email,
            full_name: row.full_name,
            phone: row.phone,
            created_at: row.created_at,
            last_sign_in_at: row.last_sign_in_at,
            account_status: row.account_status,
            total_orders: Number(row.total_orders ?? 0),
            lifetime_value: Number(row.lifetime_value ?? 0),
            last_order_date: row.last_order_date,
        }));

        const total = count ?? 0;
        const totalPages = Math.max(Math.ceil(total / limit), 1);

        return NextResponse.json({
            customers,
            page,
            limit,
            total,
            total_pages: totalPages,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch customers";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
