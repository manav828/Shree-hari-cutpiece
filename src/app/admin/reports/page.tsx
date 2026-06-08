"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";
import { Input } from "@/components/admin/ui/Input";
import {
    TrendingUp,
    ShoppingBag,
    Calendar,
    Download,
    Search,
    MapPin,
    Tag,
    CreditCard,
    Layers,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    BarChart3,
    Clock,
} from "lucide-react";

// ─── Types & Interfaces ──────────────────────────────────────────────────────

type Order = {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    payment_method: string | null;
    total_amount: number;
    subtotal: number;
    discount_amount: number;
    coupon_code: string | null;
    created_at: string;
    delivery_address?: string | null;
    contact_phone?: string | null;
    shipping_cost?: number | null;
    shipping_amount?: number | null;
};

type OrderItem = {
    id: string;
    order_id: string;
    product_id: string | null;
    product_name: string;
    color_name: string | null;
    quantity_or_meters: number;
    price_per_unit: number;
    total_price: number;
    created_at: string;
};

type OrderAddress = {
    id: string;
    order_id: string;
    city: string | null;
    state: string | null;
    full_name?: string | null;
    phone?: string | null;
};

type ProductMapping = {
    id: string;
    category_id: string | null;
};

type CategoryMapping = {
    id: string;
    name: string;
};

type ReportsData = {
    orders: Order[];
    items: OrderItem[];
    addresses: OrderAddress[];
    products: ProductMapping[];
    categories: CategoryMapping[];
};

type DatePreset = "today" | "yesterday" | "last7" | "last30" | "thisMonth" | "lastMonth" | "thisYear" | "custom";

type TabId = "overview" | "orders" | "items" | "products" | "geography" | "coupons" | "categories" | "payments";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(n: number) {
    return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

function formatDate(isoStr: string) {
    const d = new Date(isoStr);
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function getPresetDates(preset: DatePreset): { start: string; end: string } {
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    
    // Helper to get ISO date string in local date
    const toLocalDateString = (d: Date) => {
        const local = new Date(d.getTime() - tzOffset);
        return local.toISOString().slice(0, 10);
    };

    switch (preset) {
        case "today": {
            const start = toLocalDateString(now);
            return { start, end: start };
        }
        case "yesterday": {
            const yesterday = new Date(now);
            yesterday.setDate(now.getDate() - 1);
            const start = toLocalDateString(yesterday);
            return { start, end: start };
        }
        case "last7": {
            const start = new Date(now);
            start.setDate(now.getDate() - 6);
            return { start: toLocalDateString(start), end: toLocalDateString(now) };
        }
        case "last30": {
            const start = new Date(now);
            start.setDate(now.getDate() - 29);
            return { start: toLocalDateString(start), end: toLocalDateString(now) };
        }
        case "thisMonth": {
            const start = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start: toLocalDateString(start), end: toLocalDateString(now) };
        }
        case "lastMonth": {
            const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const end = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: toLocalDateString(start), end: toLocalDateString(end) };
        }
        case "thisYear": {
            const start = new Date(now.getFullYear(), 0, 1);
            return { start: toLocalDateString(start), end: toLocalDateString(now) };
        }
        default:
            return { start: "", end: "" };
    }
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AdminReports() {
    const [preset, setPreset] = useState<DatePreset>("last30");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeTab, setActiveTab] = useState<TabId>("overview");
    const [data, setData] = useState<ReportsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Table controls
    const [searchQuery, setSearchQuery] = useState("");
    const [sortField, setSortField] = useState<string>("");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(25);
    
    // Overview sub-tab (temporal grouping mode)
    const [timeGrouping, setTimeGrouping] = useState<"day" | "week" | "month" | "year">("day");

    // Initialize date inputs on preset change
    useEffect(() => {
        if (preset !== "custom") {
            const range = getPresetDates(preset);
            setStartDate(range.start);
            setEndDate(range.end);
        }
    }, [preset]);

    // Load data from API handler
    const fetchReportsData = useCallback(async () => {
        if (!startDate || !endDate) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/reports?startDate=${startDate}&endDate=${endDate}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load reports");
            setData(json);
            setCurrentPage(1); // Reset page on date filter change
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load reports");
        } finally {
            setLoading(false);
        }
    }, [startDate, endDate]);

    useEffect(() => {
        fetchReportsData();
    }, [fetchReportsData]);

    // ─── Aggregations ─────────────────────────────────────────────────────────

    // Summary Metric Badges (Gross, Returns, Net, AOV, Total Orders)
    const metrics = useMemo(() => {
        if (!data) return { gross: 0, returns: 0, net: 0, totalOrders: 0, aov: 0 };
        
        const nonCancelled = data.orders.filter(o => o.status !== "cancelled");
        const totalOrders = nonCancelled.length;

        const gross = nonCancelled.reduce((sum, o) => sum + Number(o.total_amount), 0);
        
        const returns = data.orders.reduce((sum, o) => {
            const isRefunded = o.status === "refunded" || o.payment_status === "refunded";
            const isReturned = o.status === "returned";
            return isRefunded || isReturned ? sum + Number(o.total_amount) : sum;
        }, 0);

        const net = gross - returns;
        const aov = totalOrders > 0 ? net / totalOrders : 0;

        return { gross, returns, net, totalOrders, aov };
    }, [data]);

    // 1. Overview Trends (grouped dynamically by day, week, month, or year)
    const overviewData = useMemo(() => {
        if (!data) return [];
        const nonCancelled = data.orders.filter(o => o.status !== "cancelled");
        
        const groups: Record<string, { label: string; orders: number; gross: number; returns: number; net: number }> = {};

        nonCancelled.forEach((o) => {
            const d = new Date(o.created_at);
            let groupKey = "";
            let groupLabel = "";

            if (timeGrouping === "day") {
                groupKey = o.created_at.slice(0, 10);
                groupLabel = formatDate(o.created_at);
            } else if (timeGrouping === "week") {
                // Get start of the week (Sunday)
                const day = d.getDay();
                const diff = d.getDate() - day;
                const sunday = new Date(d.setDate(diff));
                groupKey = sunday.toISOString().slice(0, 10);
                groupLabel = `Week of ${formatDate(sunday.toISOString())}`;
            } else if (timeGrouping === "month") {
                groupKey = o.created_at.slice(0, 7);
                groupLabel = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
            } else {
                groupKey = o.created_at.slice(0, 4);
                groupLabel = String(d.getFullYear());
            }

            if (!groups[groupKey]) {
                groups[groupKey] = { label: groupLabel, orders: 0, gross: 0, returns: 0, net: 0 };
            }
            
            groups[groupKey].orders += 1;
            groups[groupKey].gross += Number(o.total_amount);
        });

        // Add returns separately to correctly map to corresponding date ranges
        data.orders.forEach((o) => {
            const isRefunded = o.status === "refunded" || o.payment_status === "refunded";
            const isReturned = o.status === "returned";
            if (!isRefunded && !isReturned) return;

            const d = new Date(o.created_at);
            let groupKey = "";

            if (timeGrouping === "day") {
                groupKey = o.created_at.slice(0, 10);
            } else if (timeGrouping === "week") {
                const day = d.getDay();
                const diff = d.getDate() - day;
                const sunday = new Date(d.setDate(diff));
                groupKey = sunday.toISOString().slice(0, 10);
            } else if (timeGrouping === "month") {
                groupKey = o.created_at.slice(0, 7);
            } else {
                groupKey = o.created_at.slice(0, 4);
            }

            if (groups[groupKey]) {
                groups[groupKey].returns += Number(o.total_amount);
            }
        });

        return Object.keys(groups)
            .map((key) => {
                const g = groups[key];
                return {
                    key,
                    label: g.label,
                    orders: g.orders,
                    gross: g.gross,
                    returns: g.returns,
                    net: g.gross - g.returns,
                    aov: g.orders > 0 ? (g.gross - g.returns) / g.orders : 0,
                };
            })
            .sort((a, b) => b.key.localeCompare(a.key));
    }, [data, timeGrouping]);

    // 2. Orders report
    const ordersData = useMemo(() => {
        if (!data) return [];
        return data.orders.map((o) => {
            const addr = data.addresses.find(a => a.order_id === o.id);
            return {
                id: o.id,
                order_number: o.order_number,
                created_at: o.created_at,
                customer: addr?.full_name || o.delivery_address || "Customer",
                phone: addr?.phone || o.contact_phone || "—",
                payment_method: o.payment_method || "COD",
                subtotal: Number(o.subtotal),
                discount: Number(o.discount_amount),
                shipping: Number(o.shipping_amount || o.shipping_cost || 0),
                total: Number(o.total_amount),
                status: o.status,
                payment_status: o.payment_status,
            };
        });
    }, [data]);

    // 3. Product-wise order items report
    const itemsData = useMemo(() => {
        if (!data) return [];
        return data.items.map((item) => {
            const order = data.orders.find(o => o.id === item.order_id);
            return {
                id: item.id,
                order_number: order?.order_number || "—",
                created_at: item.created_at,
                product_name: item.product_name,
                color: item.color_name || "—",
                quantity: Number(item.quantity_or_meters),
                price_per_unit: Number(item.price_per_unit),
                total_price: Number(item.total_price),
                status: order?.status || "—",
            };
        });
    }, [data]);

    // 4. Product performance aggregated sales
    const productsData = useMemo(() => {
        if (!data) return [];
        const aggregates: Record<string, { name: string; quantity: number; revenue: number; orders: Set<string> }> = {};

        data.items.forEach((item) => {
            const key = item.product_id || item.product_name;
            const order = data.orders.find(o => o.id === item.order_id);
            if (order?.status === "cancelled") return;

            if (!aggregates[key]) {
                aggregates[key] = { name: item.product_name, quantity: 0, revenue: 0, orders: new Set() };
            }

            aggregates[key].quantity += Number(item.quantity_or_meters);
            aggregates[key].revenue += Number(item.total_price);
            aggregates[key].orders.add(item.order_id);
        });

        return Object.keys(aggregates).map((key) => {
            const agg = aggregates[key];
            return {
                key,
                product_name: agg.name,
                total_qty: agg.quantity,
                total_revenue: agg.revenue,
                order_count: agg.orders.size,
                aov: agg.orders.size > 0 ? agg.revenue / agg.orders.size : 0,
            };
        });
    }, [data]);

    // 5. Geographic sales
    const geographyData = useMemo(() => {
        if (!data) return [];
        const stateAggs: Record<string, { orders: number; gross: number }> = {};
        const cityAggs: Record<string, { state: string; orders: number; gross: number }> = {};

        data.addresses.forEach((addr) => {
            const order = data.orders.find(o => o.id === addr.order_id);
            if (!order || order.status === "cancelled") return;

            const state = (addr.state || "Unknown State").trim().replace(/\s+/g, " ");
            const city = (addr.city || "Unknown City").trim().replace(/\s+/g, " ");

            // Standardize capitalization
            const stdState = state.replace(/\b\w/g, c => c.toUpperCase());
            const stdCity = city.replace(/\b\w/g, c => c.toUpperCase());

            const cityKey = `${stdCity}, ${stdState}`;

            if (!stateAggs[stdState]) stateAggs[stdState] = { orders: 0, gross: 0 };
            stateAggs[stdState].orders += 1;
            stateAggs[stdState].gross += Number(order.total_amount);

            if (!cityAggs[cityKey]) cityAggs[cityKey] = { state: stdState, orders: 0, gross: 0 };
            cityAggs[cityKey].orders += 1;
            cityAggs[cityKey].gross += Number(order.total_amount);
        });

        // We combine state and city arrays or allow toggle. We'll return combined state list & city list inside our view
        const statesList = Object.keys(stateAggs).map((name) => ({
            type: "State",
            name,
            orders: stateAggs[name].orders,
            gross: stateAggs[name].gross,
            aov: stateAggs[name].orders > 0 ? stateAggs[name].gross / stateAggs[name].orders : 0,
        }));

        const citiesList = Object.keys(cityAggs).map((name) => ({
            type: "City",
            name,
            orders: cityAggs[name].orders,
            gross: cityAggs[name].gross,
            aov: cityAggs[name].orders > 0 ? cityAggs[name].gross / cityAggs[name].orders : 0,
        }));

        return [...statesList, ...citiesList];
    }, [data]);

    // 6. Coupon usage report
    const couponsData = useMemo(() => {
        if (!data) return [];
        const aggregates: Record<string, { code: string; usage: number; total_discount: number; driven_sales: number }> = {};

        data.orders.forEach((o) => {
            if (o.status === "cancelled") return;
            const code = o.coupon_code || null;
            if (!code) return;

            const cleanCode = code.trim().toUpperCase();

            if (!aggregates[cleanCode]) {
                aggregates[cleanCode] = { code: cleanCode, usage: 0, total_discount: 0, driven_sales: 0 };
            }

            aggregates[cleanCode].usage += 1;
            aggregates[cleanCode].total_discount += Number(o.discount_amount);
            aggregates[cleanCode].driven_sales += Number(o.total_amount);
        });

        return Object.values(aggregates);
    }, [data]);

    // 7. Category sales performance
    const categoriesData = useMemo(() => {
        if (!data) return [];
        
        // Build product mapping dictionary
        const productCatDict: Record<string, string> = {};
        data.products.forEach((p) => {
            if (p.category_id) {
                const cat = data.categories.find(c => c.id === p.category_id);
                if (cat) productCatDict[p.id] = cat.name;
            }
        });

        const aggregates: Record<string, { name: string; quantity: number; revenue: number; orderCount: Set<string> }> = {};

        data.items.forEach((item) => {
            const order = data.orders.find(o => o.id === item.order_id);
            if (order?.status === "cancelled") return;

            const categoryName = item.product_id ? (productCatDict[item.product_id] || "Uncategorized") : "Uncategorized";

            if (!aggregates[categoryName]) {
                aggregates[categoryName] = { name: categoryName, quantity: 0, revenue: 0, orderCount: new Set() };
            }

            aggregates[categoryName].quantity += Number(item.quantity_or_meters);
            aggregates[categoryName].revenue += Number(item.total_price);
            aggregates[categoryName].orderCount.add(item.order_id);
        });

        return Object.keys(aggregates).map((name) => {
            const agg = aggregates[name];
            return {
                category_name: name,
                total_qty: agg.quantity,
                total_revenue: agg.revenue,
                order_count: agg.orderCount.size,
                aov: agg.orderCount.size > 0 ? agg.revenue / agg.orderCount.size : 0,
            };
        });
    }, [data]);

    // 8. Payment Methods report
    const paymentsData = useMemo(() => {
        if (!data) return [];
        const aggregates: Record<string, { method: string; orders: number; gross: number }> = {};

        data.orders.forEach((o) => {
            if (o.status === "cancelled") return;
            const method = o.payment_method || "COD";
            const cleanMethod = method.toUpperCase().trim();

            if (!aggregates[cleanMethod]) {
                aggregates[cleanMethod] = { method: cleanMethod, orders: 0, gross: 0 };
            }

            aggregates[cleanMethod].orders += 1;
            aggregates[cleanMethod].gross += Number(o.total_amount);
        });

        return Object.values(aggregates).map((agg) => ({
            method: agg.method,
            orders: agg.orders,
            gross: agg.gross,
            aov: agg.orders > 0 ? agg.gross / agg.orders : 0,
        }));
    }, [data]);

    // ─── Sorting & Searching & Pagination Filtered List ──────────────────────────

    // Resolves current dataset according to active tab
    const rawDataset = useMemo(() => {
        switch (activeTab) {
            case "overview": return overviewData;
            case "orders": return ordersData;
            case "items": return itemsData;
            case "products": return productsData;
            case "geography": return geographyData;
            case "coupons": return couponsData;
            case "categories": return categoriesData;
            case "payments": return paymentsData;
            default: return [];
        }
    }, [activeTab, overviewData, ordersData, itemsData, productsData, geographyData, couponsData, categoriesData, paymentsData]);

    // Reset page on tab shift
    useEffect(() => {
        setCurrentPage(1);
        setSearchQuery("");
        setSortField("");
    }, [activeTab]);

    // Client-side search matching
    const searchedDataset = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return rawDataset;

        return rawDataset.filter((row: any) => {
            return Object.values(row).some((val) => {
                if (val === null || val === undefined) return false;
                return String(val).toLowerCase().includes(query);
            });
        });
    }, [rawDataset, searchQuery]);

    // Client-side sorting
    const sortedDataset = useMemo(() => {
        if (!sortField) return searchedDataset;

        const sorted = [...searchedDataset];
        sorted.sort((a: any, b: any) => {
            let valA = a[sortField];
            let valB = b[sortField];

            // Normalize nulls
            if (valA === null || valA === undefined) valA = "";
            if (valB === null || valB === undefined) valB = "";

            if (typeof valA === "string" && typeof valB === "string") {
                return sortDirection === "asc"
                    ? valA.localeCompare(valB)
                    : valB.localeCompare(valA);
            }

            // Numeric comparison
            return sortDirection === "asc"
                ? Number(valA) - Number(valB)
                : Number(valB) - Number(valA);
        });

        return sorted;
    }, [searchedDataset, sortField, sortDirection]);

    // Client-side pagination split
    const paginatedDataset = useMemo(() => {
        const from = (currentPage - 1) * limit;
        const to = from + limit;
        return sortedDataset.slice(from, to);
    }, [sortedDataset, currentPage, limit]);

    const totalPages = Math.max(1, Math.ceil(sortedDataset.length / limit));

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDirection("desc");
        }
    };

    // ─── CSV Export Functionality ────────────────────────────────────────────

    const handleExport = () => {
        if (sortedDataset.length === 0) return;

        let headers: string[] = [];
        let keys: string[] = [];

        // Define column mappings for CSV
        if (activeTab === "overview") {
            headers = ["Period", "Orders", "Gross Sales", "Returns/Refunds", "Net Sales", "Avg Order Value"];
            keys = ["label", "orders", "gross", "returns", "net", "aov"];
        } else if (activeTab === "orders") {
            headers = ["Order #", "Date", "Customer", "Phone", "Payment Method", "Subtotal", "Discount", "Shipping", "Total", "Order Status", "Payment Status"];
            keys = ["order_number", "created_at", "customer", "phone", "payment_method", "subtotal", "discount", "shipping", "total", "status", "payment_status"];
        } else if (activeTab === "items") {
            headers = ["Order #", "Date", "Product Name", "Color/SKU", "Qty/Meters", "Price Per Unit", "Total Price", "Order Status"];
            keys = ["order_number", "created_at", "product_name", "color", "quantity", "price_per_unit", "total_price", "status"];
        } else if (activeTab === "products") {
            headers = ["Product Name", "Total Quantity Sold", "Total Revenue", "Total Orders Count", "Average Order Value"];
            keys = ["product_name", "total_qty", "total_revenue", "order_count", "aov"];
        } else if (activeTab === "geography") {
            headers = ["Type", "Location Name", "Orders", "Gross Sales", "Avg Order Value"];
            keys = ["type", "name", "orders", "gross", "aov"];
        } else if (activeTab === "coupons") {
            headers = ["Coupon Code", "Usage Count", "Total Discount Given", "Driven Sales Revenue"];
            keys = ["code", "usage", "total_discount", "driven_sales"];
        } else if (activeTab === "categories") {
            headers = ["Category Name", "Total Quantity Sold", "Total Revenue", "Total Orders Count", "Average Order Value"];
            keys = ["category_name", "total_qty", "total_revenue", "order_count", "aov"];
        } else if (activeTab === "payments") {
            headers = ["Payment Method", "Orders Count", "Gross Sales", "Average Order Value"];
            keys = ["method", "orders", "gross", "aov"];
        }

        // Format CSV rows
        const csvContent = [
            headers.join(","),
            ...sortedDataset.map((row: any) =>
                keys.map((k) => {
                    let cell = row[k];
                    if (cell === null || cell === undefined) cell = "";
                    
                    // Format dates
                    if (k === "created_at") {
                        cell = new Date(cell).toISOString();
                    }

                    const cellStr = String(cell);
                    // Escape double quotes and wrap in quotes if commas exist
                    if (cellStr.includes(",") || cellStr.includes("\"") || cellStr.includes("\n")) {
                        return `"${cellStr.replace(/"/g, '""')}"`;
                    }
                    return cellStr;
                }).join(",")
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${activeTab}_report_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ─── Renderers ───────────────────────────────────────────────────────────

    // Sort Indicator Icon
    const SortIcon = ({ field }: { field: string }) => {
        if (sortField !== field) return <ArrowUpDown className="w-3.5 h-3.5 ml-1 text-gray-400 group-hover:text-gray-600 transition-colors" />;
        return (
            <span className="text-gray-900 ml-1 font-bold text-xs">
                {sortDirection === "asc" ? "▲" : "▼"}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports &amp; Analytics</h1>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                        Track orders, products performance, coupons, payment stats, and geographical data.
                    </p>
                </div>

                {/* CSV Download Trigger */}
                <button
                    onClick={handleExport}
                    disabled={loading || sortedDataset.length === 0}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Export Active Report
                </button>
            </div>

            {/* Horizontal Tabs Grid (Box Design, Icon Top, Name Bottom) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 select-none">
                {[
                    { id: "overview", label: "Overview & Trends", icon: BarChart3 },
                    { id: "orders", label: "Orders Wise", icon: ShoppingBag },
                    { id: "items", label: "Order Product Wise", icon: Clock },
                    { id: "products", label: "Individual Product Sell", icon: TrendingUp },
                    { id: "geography", label: "Geographic Sales", icon: MapPin },
                    { id: "coupons", label: "Coupon Report", icon: Tag },
                    { id: "categories", label: "Category Sales", icon: Layers },
                    { id: "payments", label: "Payment Methods", icon: CreditCard },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isCurrent = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabId)}
                            className={`flex flex-col items-center justify-center p-4 text-center border rounded-xl gap-2 transition-all cursor-pointer shadow-xs min-h-[92px] ${
                                isCurrent
                                    ? "bg-gray-950 text-white border-transparent shadow-md scale-[1.02]"
                                    : "bg-white border-gray-200 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                            }`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 ${isCurrent ? "text-indigo-400 animate-pulse" : "text-gray-400"}`} />
                            <span className="text-[11px] font-semibold leading-tight">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Filters Row */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                {/* Date presets */}
                <div className="flex flex-wrap gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200/60 max-w-fit">
                    {(["last30", "thisMonth", "lastMonth", "thisYear", "custom"] as const).map((p) => {
                        const labels: Record<string, string> = {
                            last30: "Last 30 Days",
                            thisMonth: "This Month",
                            lastMonth: "Last Month",
                            thisYear: "This Year",
                            custom: "Custom Date",
                        };
                        return (
                            <button
                                key={p}
                                onClick={() => setPreset(p)}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                                    preset === p
                                        ? "bg-white text-gray-900 shadow-xs border border-gray-200/50"
                                        : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                }`}
                            >
                                {labels[p]}
                            </button>
                        );
                    })}
                </div>

                {/* Date Inputs */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setPreset("custom");
                                setStartDate(e.target.value);
                            }}
                            className="pl-9 bg-white text-gray-700"
                            title="From date"
                        />
                    </div>
                    <span className="text-gray-400 text-sm">to</span>
                    <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setPreset("custom");
                                setEndDate(e.target.value);
                            }}
                            className="pl-9 bg-white text-gray-700"
                            title="To date"
                        />
                    </div>
                    <button
                        onClick={fetchReportsData}
                        className="px-3.5 py-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-[13px] font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
                    {error}
                </div>
            )}

            {/* Summary Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider max-w-fit">
                        Gross Sales
                    </span>
                    <p className="text-xl font-bold text-gray-900 mt-2.5 leading-none">
                        {loading ? "—" : formatPrice(metrics.gross)}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider max-w-fit">
                        Return / Refund
                    </span>
                    <p className="text-xl font-bold text-gray-900 mt-2.5 leading-none">
                        {loading ? "—" : formatPrice(metrics.returns)}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider max-w-fit">
                        Net Sales
                    </span>
                    <p className="text-xl font-bold text-gray-900 mt-2.5 leading-none">
                        {loading ? "—" : formatPrice(metrics.net)}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between">
                    <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider max-w-fit">
                        Total Orders
                    </span>
                    <p className="text-xl font-bold text-gray-900 mt-2.5 leading-none">
                        {loading ? "—" : metrics.totalOrders}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col justify-between col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider max-w-fit">
                        Avg Order (AOV)
                    </span>
                    <p className="text-xl font-bold text-gray-900 mt-2.5 leading-none">
                        {loading ? "—" : formatPrice(metrics.aov)}
                    </p>
                </div>
            </div>

            {/* Dashboard Table panel */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[450px]">
                    
                    {/* Inner controls (Overview subtabs or Search) */}
                    <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-gray-50/20">
                        <div className="flex items-center gap-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                {activeTab.replace(/([A-Z])/g, " $1")} Report
                            </h3>
                            {activeTab === "overview" && (
                                <div className="flex items-center gap-1.5 ml-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider select-none">Group By:</span>
                                    <div className="flex rounded-md border border-gray-200 bg-white p-0.5 overflow-hidden">
                                        {(["day", "week", "month", "year"] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => setTimeGrouping(t)}
                                                className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md transition-colors cursor-pointer ${
                                                    timeGrouping === t
                                                        ? "bg-gray-900 text-white"
                                                        : "text-gray-500 hover:text-gray-800"
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="relative max-w-xs w-full">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                            <Input
                                type="text"
                                placeholder={`Search ${activeTab} data...`}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white"
                            />
                        </div>
                    </div>

                    {/* Table Render */}
                    <div className="flex-1 overflow-x-auto min-h-[300px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 text-xs">
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                                Loading report metrics...
                            </div>
                        ) : sortedDataset.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-xs gap-1.5">
                                <ShoppingBag className="h-8 w-8 text-slate-300" />
                                <span>No data found for this date range.</span>
                            </div>
                        ) : (
                            <Table className="text-[13px]" wrapperClassName="border-0 rounded-none">
                                <TableHeader>
                                    <TableRow className="border-b border-gray-100 bg-gray-50/50 select-none hover:bg-gray-50/50">
                                        
                                        {/* Render Headers Dynamically based on active tab */}
                                        {activeTab === "overview" && (
                                            <>
                                                <TableHead onClick={() => handleSort("label")} className="text-left text-[10px] cursor-pointer group">
                                                    Period <SortIcon field="label" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("orders")} className="text-left text-[10px] cursor-pointer group">
                                                    Orders <SortIcon field="orders" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("gross")} className="text-left text-[10px] cursor-pointer group">
                                                    Gross Sales <SortIcon field="gross" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("returns")} className="text-left text-[10px] cursor-pointer group">
                                                    Returns <SortIcon field="returns" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("net")} className="text-left text-[10px] cursor-pointer group">
                                                    Net Sales <SortIcon field="net" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("aov")} className="text-left text-[10px] cursor-pointer group">
                                                    Avg Order Value <SortIcon field="aov" />
                                                </TableHead>
                                            </>
                                        )}

                                        {activeTab === "orders" && (
                                            <>
                                                <TableHead onClick={() => handleSort("order_number")} className="text-left text-[10px] cursor-pointer group">
                                                    Order # <SortIcon field="order_number" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("created_at")} className="text-left text-[10px] cursor-pointer group">
                                                    Date <SortIcon field="created_at" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("customer")} className="text-left text-[10px] cursor-pointer group">
                                                    Customer <SortIcon field="customer" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("payment_method")} className="text-left text-[10px] cursor-pointer group">
                                                    Payment Method <SortIcon field="payment_method" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("subtotal")} className="text-left text-[10px] cursor-pointer group">
                                                    Subtotal <SortIcon field="subtotal" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("discount")} className="text-left text-[10px] cursor-pointer group">
                                                    Discount <SortIcon field="discount" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("shipping")} className="text-left text-[10px] cursor-pointer group">
                                                    Shipping <SortIcon field="shipping" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("total")} className="text-left text-[10px] cursor-pointer group">
                                                    Total <SortIcon field="total" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("status")} className="text-left text-[10px] cursor-pointer group">
                                                    Order Status <SortIcon field="status" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("payment_status")} className="text-left text-[10px] cursor-pointer group">
                                                    Payment Status <SortIcon field="payment_status" />
                                                </TableHead>
                                            </>
                                        )}

                                        {activeTab === "items" && (
                                            <>
                                                <TableHead onClick={() => handleSort("order_number")} className="text-left text-[10px] cursor-pointer group">
                                                    Order # <SortIcon field="order_number" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("created_at")} className="text-left text-[10px] cursor-pointer group">
                                                    Date <SortIcon field="created_at" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("product_name")} className="text-left text-[10px] cursor-pointer group">
                                                    Product <SortIcon field="product_name" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("color")} className="text-left text-[10px] cursor-pointer group">
                                                    Color/SKU <SortIcon field="color" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("quantity")} className="text-left text-[10px] cursor-pointer group">
                                                    Qty/Meters <SortIcon field="quantity" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("price_per_unit")} className="text-left text-[10px] cursor-pointer group">
                                                    Unit Price <SortIcon field="price_per_unit" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("total_price")} className="text-left text-[10px] cursor-pointer group">
                                                    Total Price <SortIcon field="total_price" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("status")} className="text-left text-[10px] cursor-pointer group">
                                                    Order Status <SortIcon field="status" />
                                                </TableHead>
                                            </>
                                        )}

                                        {activeTab === "products" && (
                                            <>
                                                <TableHead onClick={() => handleSort("product_name")} className="text-left text-[10px] cursor-pointer group">
                                                    Product Name <SortIcon field="product_name" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("total_qty")} className="text-left text-[10px] cursor-pointer group">
                                                    Total Quantity Sold <SortIcon field="total_qty" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("total_revenue")} className="text-left text-[10px] cursor-pointer group">
                                                    Total Revenue <SortIcon field="total_revenue" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("order_count")} className="text-left text-[10px] cursor-pointer group">
                                                    Orders Count <SortIcon field="order_count" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("aov")} className="text-left text-[10px] cursor-pointer group">
                                                    Average Order Value <SortIcon field="aov" />
                                                </TableHead>
                                            </>
                                        )}

                                        {activeTab === "geography" && (
                                            <>
                                                <TableHead onClick={() => handleSort("type")} className="text-left text-[10px] cursor-pointer group">
                                                    Type <SortIcon field="type" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("name")} className="text-left text-[10px] cursor-pointer group">
                                                    Location Name <SortIcon field="name" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("orders")} className="text-left text-[10px] cursor-pointer group">
                                                    Orders Count <SortIcon field="orders" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("gross")} className="text-left text-[10px] cursor-pointer group">
                                                    Gross Sales <SortIcon field="gross" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("aov")} className="text-left text-[10px] cursor-pointer group">
                                                    Average Order Value <SortIcon field="aov" />
                                                </TableHead>
                                            </>
                                        )}

                                        {activeTab === "coupons" && (
                                            <>
                                                <TableHead onClick={() => handleSort("code")} className="text-left text-[10px] cursor-pointer group">
                                                    Coupon Code <SortIcon field="code" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("usage")} className="text-left text-[10px] cursor-pointer group">
                                                    Usage Count <SortIcon field="usage" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("total_discount")} className="text-left text-[10px] cursor-pointer group">
                                                    Total Discount Given <SortIcon field="total_discount" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("driven_sales")} className="text-left text-[10px] cursor-pointer group">
                                                    Driven Sales Revenue <SortIcon field="driven_sales" />
                                                </TableHead>
                                            </>
                                        )}

                                        {activeTab === "categories" && (
                                            <>
                                                <TableHead onClick={() => handleSort("category_name")} className="text-left text-[10px] cursor-pointer group">
                                                    Category Name <SortIcon field="category_name" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("total_qty")} className="text-left text-[10px] cursor-pointer group">
                                                    Total Quantity Sold <SortIcon field="total_qty" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("total_revenue")} className="text-left text-[10px] cursor-pointer group">
                                                    Total Revenue <SortIcon field="total_revenue" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("order_count")} className="text-left text-[10px] cursor-pointer group">
                                                    Orders Count <SortIcon field="order_count" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("aov")} className="text-left text-[10px] cursor-pointer group">
                                                    Average Order Value <SortIcon field="aov" />
                                                </TableHead>
                                            </>
                                        )}

                                        {activeTab === "payments" && (
                                            <>
                                                <TableHead onClick={() => handleSort("method")} className="text-left text-[10px] cursor-pointer group">
                                                    Payment Method <SortIcon field="method" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("orders")} className="text-left text-[10px] cursor-pointer group">
                                                    Orders Count <SortIcon field="orders" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("gross")} className="text-left text-[10px] cursor-pointer group">
                                                    Gross Sales <SortIcon field="gross" />
                                                </TableHead>
                                                <TableHead onClick={() => handleSort("aov")} className="text-left text-[10px] cursor-pointer group">
                                                    Average Order Value <SortIcon field="aov" />
                                                </TableHead>
                                            </>
                                        )}
                                        
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 bg-white">
                                    
                                    {/* Render Rows Dynamically based on active tab */}
                                    {paginatedDataset.map((row: any, idx) => (
                                        <TableRow key={row.id || row.key || row.code || row.name || row.category_name || row.method || idx} className="hover:bg-gray-50/50 transition-colors">
                                            
                                            {activeTab === "overview" && (
                                                <>
                                                    <TableCell className="font-medium text-gray-900">{row.label}</TableCell>
                                                    <TableCell className="text-gray-600">{row.orders}</TableCell>
                                                    <TableCell className="text-gray-800 font-semibold">{formatPrice(row.gross)}</TableCell>
                                                    <TableCell className="text-red-600 font-medium">{formatPrice(row.returns)}</TableCell>
                                                    <TableCell className="text-gray-900 font-semibold">{formatPrice(row.net)}</TableCell>
                                                    <TableCell className="text-gray-600">{formatPrice(row.aov)}</TableCell>
                                                </>
                                            )}

                                            {activeTab === "orders" && (
                                                <>
                                                    <TableCell className="font-semibold text-indigo-600">
                                                        <a href={`/admin/orders/${row.id}`} className="hover:underline">
                                                            {row.order_number}
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-gray-500 text-[12px]">{formatDate(row.created_at)}</TableCell>
                                                    <TableCell className="text-gray-800 font-medium truncate max-w-[150px]" title={row.customer}>{row.customer}</TableCell>
                                                    <TableCell className="text-gray-600">{row.payment_method}</TableCell>
                                                    <TableCell className="text-gray-600">{formatPrice(row.subtotal)}</TableCell>
                                                    <TableCell className="text-red-500">-{formatPrice(row.discount)}</TableCell>
                                                    <TableCell className="text-gray-500">+{formatPrice(row.shipping)}</TableCell>
                                                    <TableCell className="text-gray-900 font-bold">{formatPrice(row.total)}</TableCell>
                                                    <TableCell>
                                                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                                                            row.status === "delivered" ? "bg-emerald-50 text-emerald-700" :
                                                            row.status === "cancelled" ? "bg-red-50 text-red-700" :
                                                            row.status === "pending" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-700"
                                                        }`}>
                                                            {row.status}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                                                            row.payment_status === "paid" ? "bg-emerald-50 text-emerald-700" :
                                                            row.payment_status === "refunded" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"
                                                        }`}>
                                                            {row.payment_status}
                                                        </span>
                                                    </TableCell>
                                                </>
                                            )}

                                            {activeTab === "items" && (
                                                <>
                                                    <TableCell className="font-semibold text-indigo-600">{row.order_number}</TableCell>
                                                    <TableCell className="text-gray-500 text-[12px]">{formatDate(row.created_at)}</TableCell>
                                                    <TableCell className="text-gray-800 font-medium max-w-[200px] truncate" title={row.product_name}>{row.product_name}</TableCell>
                                                    <TableCell className="text-gray-600">{row.color}</TableCell>
                                                    <TableCell className="text-gray-800 font-medium">{row.quantity}</TableCell>
                                                    <TableCell className="text-gray-600">{formatPrice(row.price_per_unit)}</TableCell>
                                                    <TableCell className="text-gray-900 font-bold">{formatPrice(row.total_price)}</TableCell>
                                                    <TableCell>
                                                        <span className="text-[11px] font-semibold text-gray-600">{row.status}</span>
                                                    </TableCell>
                                                </>
                                            )}

                                            {activeTab === "products" && (
                                                <>
                                                    <TableCell className="font-medium text-gray-900 max-w-[220px] truncate" title={row.product_name}>{row.product_name}</TableCell>
                                                    <TableCell className="text-gray-700 font-medium">{row.total_qty}</TableCell>
                                                    <TableCell className="text-gray-900 font-bold">{formatPrice(row.total_revenue)}</TableCell>
                                                    <TableCell className="text-gray-600">{row.order_count}</TableCell>
                                                    <TableCell className="text-gray-500">{formatPrice(row.aov)}</TableCell>
                                                </>
                                            )}

                                            {activeTab === "geography" && (
                                                <>
                                                    <TableCell>
                                                        <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded ${
                                                            row.type === "State" ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-700"
                                                        }`}>
                                                            {row.type}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell className="font-medium text-gray-900">{row.name}</TableCell>
                                                    <TableCell className="text-gray-700">{row.orders}</TableCell>
                                                    <TableCell className="text-gray-900 font-bold">{formatPrice(row.gross)}</TableCell>
                                                    <TableCell className="text-gray-600">{formatPrice(row.aov)}</TableCell>
                                                </>
                                            )}

                                            {activeTab === "coupons" && (
                                                <>
                                                    <TableCell className="font-bold text-indigo-600 tracking-wider">{row.code}</TableCell>
                                                    <TableCell className="text-gray-700 font-medium">{row.usage}</TableCell>
                                                    <TableCell className="text-red-600 font-semibold">-{formatPrice(row.total_discount)}</TableCell>
                                                    <TableCell className="text-gray-900 font-bold">{formatPrice(row.driven_sales)}</TableCell>
                                                </>
                                            )}

                                            {activeTab === "categories" && (
                                                <>
                                                    <TableCell className="font-medium text-gray-900">{row.category_name}</TableCell>
                                                    <TableCell className="text-gray-700 font-medium">{row.total_qty}</TableCell>
                                                    <TableCell className="text-gray-900 font-bold">{formatPrice(row.total_revenue)}</TableCell>
                                                    <TableCell className="text-gray-600">{row.order_count}</TableCell>
                                                    <TableCell className="text-gray-500">{formatPrice(row.aov)}</TableCell>
                                                </>
                                            )}

                                            {activeTab === "payments" && (
                                                <>
                                                    <TableCell className="font-bold text-gray-800">{row.method}</TableCell>
                                                    <TableCell className="text-gray-700 font-medium">{row.orders}</TableCell>
                                                    <TableCell className="text-gray-900 font-bold">{formatPrice(row.gross)}</TableCell>
                                                    <TableCell className="text-gray-600">{formatPrice(row.aov)}</TableCell>
                                                </>
                                            )}

                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>

                    {/* Pagination Row */}
                    {!loading && sortedDataset.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                            <p className="text-[12px] text-gray-500 select-none">
                                Showing <span className="font-medium text-gray-700">{((currentPage - 1) * limit) + 1}–{Math.min(currentPage * limit, sortedDataset.length)}</span> of <span className="font-medium text-gray-700">{sortedDataset.length}</span> rows
                            </p>
                            <div className="flex items-center justify-center">
                                <select
                                    value={limit}
                                    onChange={(e) => {
                                        setLimit(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-600 outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value={250}>250</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage <= 1}
                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Prev page"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 text-[12px] text-gray-600 font-medium">
                                    {currentPage} / {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage >= totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    title="Next page"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                </div>

            </div>
    );
}
