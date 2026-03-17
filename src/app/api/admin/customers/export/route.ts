import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const SORT_MAP = {
    joined: "created_at",
    last_order: "last_order_date",
    ltv: "lifetime_value",
    name: "full_name",
} as const;

function csvCell(value: unknown) {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes("\n") || str.includes("\"")) {
        return `"${str.replace(/\"/g, '""')}"`;
    }
    return str;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const status = (searchParams.get("status") || "all").trim();
        const search = (searchParams.get("search") || "").trim();
        const registeredAfter = (searchParams.get("registeredAfter") || "").trim();
        const registeredBefore = (searchParams.get("registeredBefore") || "").trim();
        const lastOrderAfter = (searchParams.get("lastOrderAfter") || "").trim();
        const lastOrderBefore = (searchParams.get("lastOrderBefore") || "").trim();
        const orderCount = (searchParams.get("orderCount") || "all").trim();
        const ltvMin = searchParams.get("ltvMin");
        const ltvMax = searchParams.get("ltvMax");
        const sortBy = (searchParams.get("sortBy") || "joined") as keyof typeof SORT_MAP;
        const sortField = SORT_MAP[sortBy] ?? SORT_MAP.joined;
        const ascending = sortBy === "name";

        let query = supabaseAdmin
            .from("admin_customer_summary")
            .select("*")
            .order(sortField, { ascending, nullsFirst: false })
            .limit(10000);

        if (status !== "all") {
            query = query.eq("account_status", status);
        }

        if (registeredAfter) {
            query = query.gte("created_at", `${registeredAfter}T00:00:00`);
        }

        if (registeredBefore) {
            query = query.lte("created_at", `${registeredBefore}T23:59:59`);
        }

        if (lastOrderAfter) {
            query = query.gte("last_order_date", `${lastOrderAfter}T00:00:00`);
        }

        if (lastOrderBefore) {
            query = query.lte("last_order_date", `${lastOrderBefore}T23:59:59`);
        }

        if (ltvMin && ltvMin.trim() !== "") {
            const min = Number(ltvMin);
            if (!Number.isNaN(min)) query = query.gte("lifetime_value", min);
        }

        if (ltvMax && ltvMax.trim() !== "") {
            const max = Number(ltvMax);
            if (!Number.isNaN(max)) query = query.lte("lifetime_value", max);
        }

        if (orderCount !== "all") {
            if (orderCount === "0") query = query.eq("total_orders", 0);
            if (orderCount === "1-5") query = query.gte("total_orders", 1).lte("total_orders", 5);
            if (orderCount === "5-10") query = query.gte("total_orders", 5).lte("total_orders", 10);
            if (orderCount === "10+") query = query.gte("total_orders", 10);
        }

        if (search) {
            const escapedSearch = search.replace(/,/g, "").replace(/%/g, "");
            query = query.or([
                `email.ilike.%${escapedSearch}%`,
                `full_name.ilike.%${escapedSearch}%`,
                `phone.ilike.%${escapedSearch}%`,
            ].join(","));
        }

        const { data, error } = await query;
        if (error) throw error;

        const rows = data ?? [];
        const headers = [
            "id",
            "full_name",
            "email",
            "phone",
            "account_status",
            "total_orders",
            "lifetime_value",
            "last_order_date",
            "last_sign_in_at",
            "created_at",
        ];

        const csvLines = [
            headers.join(","),
            ...rows.map((row) => [
                csvCell(row.id),
                csvCell(row.full_name),
                csvCell(row.email),
                csvCell(row.phone),
                csvCell(row.account_status),
                csvCell(row.total_orders),
                csvCell(row.lifetime_value),
                csvCell(row.last_order_date),
                csvCell(row.last_sign_in_at),
                csvCell(row.created_at),
            ].join(",")),
        ];

        const csv = csvLines.join("\n");
        const fileName = `customers-export-${new Date().toISOString().slice(0, 10)}.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename=\"${fileName}\"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to export customers";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
