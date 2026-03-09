import { supabaseAdmin as supabase } from "@/lib/supabaseAdminClient";
import type {
    Order,
    OrderFilters,
    OrderItem,
    OrderStats,
    OrderWithDetails,
    OrderWithItems,
    OrdersResponse,
    OrderAddress,
    OrderStatusHistory,
} from "@/types/orders";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function todayRange() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { start: start.toISOString(), end: end.toISOString() };
}

// ─── Retry Helper for Supabase AbortError ────────────────────────────────────

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delayMs = 500): Promise<T> {
    try {
        return await fn();
    } catch (err: any) {
        if (err.message && err.message.includes("AbortError") && retries > 0) {
            console.warn(`[Admin Orders] Retrying query due to AbortError lock timeout... (${retries} left)`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            return withRetry(fn, retries - 1, delayMs * 2);
        }
        throw err;
    }
}

// ─── Summary stats for top cards ─────────────────────────────────────────────

export async function getOrderStats(): Promise<OrderStats> {
    return withRetry(async () => {
        const { start, end } = todayRange();

        const [totalRes, pendingRes, shippedRes, revenueRes] = await Promise.all([
            supabase.from("orders").select("id", { count: "exact", head: true }),
            supabase
                .from("orders")
                .select("id", { count: "exact", head: true })
                .eq("status", "pending"),
            supabase
                .from("orders")
                .select("id", { count: "exact", head: true })
                .eq("status", "shipped")
                .gte("updated_at", start)
                .lt("updated_at", end),
            supabase
                .from("orders")
                .select("total_amount")
                .eq("payment_status", "paid")
                .gte("created_at", start)
                .lt("created_at", end),
        ]);

        const revenue_today = ((revenueRes.data ?? []) as { total_amount: number }[]).reduce(
            (sum, o) => sum + (o.total_amount ?? 0),
            0
        );

        return {
            total_orders: totalRes.count ?? 0,
            pending_orders: pendingRes.count ?? 0,
            shipped_today: shippedRes.count ?? 0,
            revenue_today,
        };
    });
}

// ─── Paginated orders list ────────────────────────────────────────────────────

export async function fetchOrders(
    filters: OrderFilters = {}
): Promise<OrdersResponse> {
    return withRetry(async () => {
        const {
            search = "",
            status = "all",
            payment_status = "all",
            date_from,
            date_to,
            page = 1,
            per_page = 25,
        } = filters;

        const from = (page - 1) * per_page;
        const to = from + per_page - 1;

        let query = supabase
            .from("orders")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (status !== "all") query = query.eq("status", status);
        if (payment_status !== "all") query = query.eq("payment_status", payment_status);
        if (date_from) query = query.gte("created_at", date_from);
        if (date_to) query = query.lte("created_at", date_to + "T23:59:59");
        // Search by order_number prefix
        if (search && /^SH-/i.test(search)) {
            query = query.ilike("order_number", `%${search}%`);
        }

        const { data: ordersData, count, error } = await query;
        if (error) throw error;

        const orders = (ordersData ?? []) as Order[];
        const orderIds = orders.map((o) => o.id);

        // Fetch items and addresses for these orders
        const [itemsRes, addressRes] = await Promise.all([
            orderIds.length > 0
                ? supabase.from("order_items").select("*").in("order_id", orderIds)
                : Promise.resolve({ data: [] as OrderItem[], error: null }),
            orderIds.length > 0
                ? supabase
                    .from("order_addresses")
                    .select("*")
                    .in("order_id", orderIds)
                    .eq("type", "shipping")
                : Promise.resolve({ data: [] as OrderAddress[], error: null }),
        ]);

        // Group by order_id
        const itemsByOrder: Record<string, OrderItem[]> = {};
        for (const item of (itemsRes.data ?? []) as OrderItem[]) {
            if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
            itemsByOrder[item.order_id].push(item);
        }

        const addressByOrder: Record<string, OrderAddress> = {};
        for (const addr of (addressRes.data ?? []) as OrderAddress[]) {
            addressByOrder[addr.order_id] = addr;
        }

        let ordersWithItems: OrderWithItems[] = orders.map((o) => ({
            ...o,
            items: itemsByOrder[o.id] ?? [],
            shipping_address: addressByOrder[o.id] ?? null,
        }));

        // Client-side filter for name/phone search (no DB view available)
        if (search && !/^SH-/i.test(search)) {
            const lower = search.toLowerCase();
            ordersWithItems = ordersWithItems.filter((o) => {
                const addr = o.shipping_address;
                // Also search in legacy delivery_address field
                return (
                    addr?.full_name.toLowerCase().includes(lower) ||
                    addr?.phone.includes(search) ||
                    o.delivery_address?.toLowerCase().includes(lower) ||
                    o.contact_phone?.includes(search)
                );
            });
        }

        const total = count ?? 0;
        return {
            orders: ordersWithItems,
            total,
            page,
            per_page,
            total_pages: Math.ceil(total / per_page),
        };
    });
}

// ─── Full order detail ────────────────────────────────────────────────────────

export async function fetchOrderById(id: string): Promise<OrderWithDetails | null> {
    return withRetry(async () => {
        const [orderRes, itemsRes, addressesRes, historyRes] = await Promise.all([
            supabase.from("orders").select("*").eq("id", id).single(),
            supabase.from("order_items").select("*").eq("order_id", id),
            supabase.from("order_addresses").select("*").eq("order_id", id),
            supabase
                .from("order_status_history")
                .select("*")
                .eq("order_id", id)
                .order("created_at", { ascending: true }),
        ]);

        if (orderRes.error || !orderRes.data) return null;

        const order = orderRes.data as Order;
        const items = (itemsRes.data ?? []) as OrderItem[];
        const addresses = (addressesRes.data ?? []) as OrderAddress[];
        const history = (historyRes.data ?? []) as OrderStatusHistory[];

        // Fallback: if no order_addresses row, build one from legacy columns
        let shipping_address: OrderAddress | null =
            addresses.find((a) => a.type === "shipping") ?? null;

        if (!shipping_address && order.delivery_address) {
            shipping_address = {
                id: "legacy",
                order_id: id,
                type: "shipping",
                full_name: "Customer",
                phone: order.contact_phone ?? "",
                address_line1: order.delivery_address,
                city: "",
                state: "",
                pincode: "",
                country: "India",
            };
        }

        return {
            ...order,
            items,
            shipping_address,
            billing_address: addresses.find((a) => a.type === "billing") ?? null,
            status_history: history,
        };
    });
}

// ─── Shipping fee from settings table ────────────────────────────────────────

export async function getShippingFee(): Promise<number> {
    const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "shipping_fee")
        .single();
    return parseFloat(data?.value ?? "50");
}
