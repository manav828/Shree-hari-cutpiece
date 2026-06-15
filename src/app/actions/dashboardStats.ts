"use server";

import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export interface ComparisonMetric {
    period: string;
    revenue: number;
    orders: number;
}

export interface ChartPoint {
    label: string;
    revenue: number;
    orders: number;
    monthKey: string; // "YYYY-MM"
}

export interface LiveStats {
    totalSales: number;
    activeOrders: number;
    totalProducts: number;
    totalCustomers: number;
}

export interface RecentOrder {
    id: string;
    order_number: string;
    created_at: string;
    status: string;
    total_amount: number;
    customer_name: string;
}

export interface LowStockVariant {
    id: string;
    product_name: string;
    color_name: string;
    sku: string | null;
    stock: number;
}

export interface DashboardMetricsResponse {
    liveStats: LiveStats;
    comparisons: ComparisonMetric[];
    chartData: ChartPoint[];
    disabledRlsTables?: string[];
    recentOrders?: RecentOrder[];
    lowStockVariants?: LowStockVariant[];
}

export async function fetchDashboardMetrics(): Promise<DashboardMetricsResponse> {
    try {
        // 1. Fetch live overview stats, recent orders, and low stock variants from database
        const [
            { count: totalProductsCount },
            { count: totalCustomersCount },
            { count: activeOrdersCount },
            { data: paidOrdersData },
            recentOrdersRes,
            lowStockRes
        ] = await Promise.all([
            supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
            supabaseAdmin.from("profiles").select("id", { count: "exact", head: true }),
            supabaseAdmin.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "processing", "shipped"]),
            supabaseAdmin.from("orders").select("total_amount").eq("payment_status", "paid"),
            supabaseAdmin.from("orders").select(`
                id,
                order_number,
                created_at,
                status,
                total_amount,
                profiles (
                    full_name
                )
            `).order("created_at", { ascending: false }).limit(8),
            supabaseAdmin.from("product_variants").select(`
                id,
                color_name,
                stock,
                sku,
                products (
                    name
                )
            `).lt("stock", 20).order("stock", { ascending: true }).limit(10)
        ]);

        const totalSalesSum = (paidOrdersData ?? []).reduce(
            (sum, o) => sum + Number(o.total_amount || 0),
            0
        );

        const liveStats: LiveStats = {
            totalSales: totalSalesSum,
            activeOrders: activeOrdersCount ?? 0,
            totalProducts: totalProductsCount ?? 0,
            totalCustomers: totalCustomersCount ?? 0
        };

        if (recentOrdersRes.error) {
            console.error("Error fetching recent orders:", recentOrdersRes.error);
        }
        if (lowStockRes.error) {
            console.error("Error fetching low stock variants:", lowStockRes.error);
        }

        const recentOrders: RecentOrder[] = (recentOrdersRes.data ?? []).map((o: any) => ({
            id: o.id,
            order_number: o.order_number,
            created_at: o.created_at,
            status: o.status,
            total_amount: Number(o.total_amount || 0),
            customer_name: o.profiles?.full_name || "Guest"
        }));

        const lowStockVariants: LowStockVariant[] = (lowStockRes.data ?? []).map((v: any) => ({
            id: v.id,
            product_name: v.products?.name || "Unknown Product",
            color_name: v.color_name,
            sku: v.sku,
            stock: v.stock
        }));

        // 2. Fetch all non-cancelled orders to compute comparisons and charts
        const { data: orders, error } = await supabaseAdmin
            .from("orders")
            .select("total_amount, status, created_at")
            .neq("status", "cancelled")
            .gte("created_at", "2025-01-01T00:00:00.000Z")
            .order("created_at", { ascending: true });

        if (error) throw error;

        const orderList = (orders ?? []).map(o => ({
            total_amount: Number(o.total_amount || 0),
            created_at: new Date(o.created_at)
        }));

        const now = new Date();

        // Time comparisons helpers
        const getStartOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
        
        const todayStart = getStartOfDay(now);
        const yesterdayStart = new Date(todayStart);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const getStartOfWeek = (d: Date) => {
            const start = getStartOfDay(d);
            const day = start.getDay();
            start.setDate(start.getDate() - day);
            return start;
        };
        const thisWeekStart = getStartOfWeek(now);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);

        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);

        const stats = {
            today: { revenue: 0, orders: 0 },
            yesterday: { revenue: 0, orders: 0 },
            thisWeek: { revenue: 0, orders: 0 },
            lastWeek: { revenue: 0, orders: 0 },
            thisMonth: { revenue: 0, orders: 0 },
            lastMonth: { revenue: 0, orders: 0 },
            thisYear: { revenue: 0, orders: 0 },
            lastYear: { revenue: 0, orders: 0 }
        };

        for (const order of orderList) {
            const d = order.created_at;
            const amt = order.total_amount;

            // Today
            if (d >= todayStart) {
                stats.today.revenue += amt;
                stats.today.orders += 1;
            }
            // Yesterday
            else if (d >= yesterdayStart && d < todayStart) {
                stats.yesterday.revenue += amt;
                stats.yesterday.orders += 1;
            }

            // This Week
            if (d >= thisWeekStart) {
                stats.thisWeek.revenue += amt;
                stats.thisWeek.orders += 1;
            }
            // Last Week
            else if (d >= lastWeekStart && d < thisWeekStart) {
                stats.lastWeek.revenue += amt;
                stats.lastWeek.orders += 1;
            }

            // This Month
            if (d >= thisMonthStart) {
                stats.thisMonth.revenue += amt;
                stats.thisMonth.orders += 1;
            }
            // Last Month
            else if (d >= lastMonthStart && d < thisMonthStart) {
                stats.lastMonth.revenue += amt;
                stats.lastMonth.orders += 1;
            }

            // This Year
            if (d >= thisYearStart) {
                stats.thisYear.revenue += amt;
                stats.thisYear.orders += 1;
            }
            // Last Year
            else if (d >= lastYearStart && d < thisYearStart) {
                stats.lastYear.revenue += amt;
                stats.lastYear.orders += 1;
            }
        }

        const comparisons: ComparisonMetric[] = [
            { period: "Today", revenue: stats.today.revenue, orders: stats.today.orders },
            { period: "Yesterday", revenue: stats.yesterday.revenue, orders: stats.yesterday.orders },
            { period: "This Week", revenue: stats.thisWeek.revenue, orders: stats.thisWeek.orders },
            { period: "Last Week", revenue: stats.lastWeek.revenue, orders: stats.lastWeek.orders },
            { period: "This Month", revenue: stats.thisMonth.revenue, orders: stats.thisMonth.orders },
            { period: "Last Month", revenue: stats.lastMonth.revenue, orders: stats.lastMonth.orders },
            { period: "This Year", revenue: stats.thisYear.revenue, orders: stats.thisYear.orders },
            { period: "Last Year", revenue: stats.lastYear.revenue, orders: stats.lastYear.orders }
        ];

        // 3. Generate monthly chart points
        const chartPointsMap = new Map<string, ChartPoint>();
        const chartPointsOrder: string[] = [];

        for (let i = 12; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const monthKey = `${yyyy}-${mm}`;
            const label = d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

            chartPointsMap.set(monthKey, {
                label,
                revenue: 0,
                orders: 0,
                monthKey
            });
            chartPointsOrder.push(monthKey);
        }

        for (const order of orderList) {
            const d = order.created_at;
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const monthKey = `${yyyy}-${mm}`;

            if (chartPointsMap.has(monthKey)) {
                const pt = chartPointsMap.get(monthKey)!;
                pt.revenue += order.total_amount;
                pt.orders += 1;
            }
        }

        const chartData = chartPointsOrder.map(key => chartPointsMap.get(key)!);

        // Fetch disabled RLS tables dynamically
        let disabledRlsTables: string[] = [];
        try {
            const { data: rlsData, error: rlsError } = await supabaseAdmin.rpc("get_disabled_rls_tables");
            if (!rlsError && rlsData) {
                disabledRlsTables = rlsData.map((row: any) => row.table_name);
            }
        } catch (rlsErr) {
            console.error("Failed to query disabled RLS tables:", rlsErr);
        }

        return { liveStats, comparisons, chartData, disabledRlsTables, recentOrders, lowStockVariants };
    } catch (err: any) {
        console.error("Error fetching dashboard statistics:", err);
        return {
            liveStats: { totalSales: 0, activeOrders: 0, totalProducts: 0, totalCustomers: 0 },
            comparisons: [],
            chartData: [],
            disabledRlsTables: [],
            recentOrders: [],
            lowStockVariants: []
        };
    }
}
