"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Printer,
    Eye,
    TrendingUp,
    Clock,
    Truck,
    IndianRupee,
} from "lucide-react";
import { fetchOrders, getOrderStats } from "@/lib/orders";
import type {
    OrderFilters,
    OrderStatus,
    OrderWithItems,
    PaymentStatus,
    OrderStats,
} from "@/types/orders";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import PaymentStatusBadge from "@/components/admin/orders/PaymentStatusBadge";
import CollapsibleProducts from "@/components/admin/orders/CollapsibleProducts";

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

function formatTime(isoStr: string) {
    const d = new Date(isoStr);
    return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─── Status options ───────────────────────────────────────────────────────────

const ORDER_STATUSES: { value: OrderStatus | "all"; label: string }[] = [
    { value: "all", label: "All Statuses" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "processing", label: "Processing" },
    { value: "packed", label: "Packed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "refunded", label: "Refunded" },
    { value: "returning", label: "Return Requested" },
    { value: "returned", label: "Returned" },
    { value: "replacing", label: "Replace Requested" },
    { value: "replaced", label: "Replaced" },
];

const PAYMENT_STATUSES: { value: PaymentStatus | "all"; label: string }[] = [
    { value: "all", label: "All Payments" },
    { value: "pending", label: "Pending" },
    { value: "paid", label: "Paid" },
    { value: "failed", label: "Failed" },
    { value: "refunded", label: "Refunded" },
];

// ─── Summary Card ─────────────────────────────────────────────────────────────

function StatCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-tight">{value}</p>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<OrderWithItems[]>([]);
    const [stats, setStats] = useState<OrderStats | null>(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    const [filters, setFilters] = useState<OrderFilters>({
        search: "",
        status: "all",
        payment_status: "all",
        page: 1,
        per_page: 25,
    });

    // Debounced search state
    const [searchInput, setSearchInput] = useState("");

    // Load orders
    const loadOrders = useCallback(async () => {
        setLoading(true);
        try {
            const result = await fetchOrders(filters);
            setOrders(result.orders);
            setTotal(result.total);
            setTotalPages(result.total_pages);
        } catch (err) {
            console.error("Failed to load orders:", err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Load stats (only on mount / once)
    useEffect(() => {
        (async () => {
            try {
                const s = await getOrderStats();
                setStats(s);
            } catch (err) {
                console.error("Failed to load stats:", err);
            } finally {
                setStatsLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    // Debounce search
    useEffect(() => {
        const t = setTimeout(() => {
            setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }));
        }, 400);
        return () => clearTimeout(t);
    }, [searchInput]);

    const setFilter = <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) => {
        setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    };

    const goPage = (p: number) => {
        setFilters((prev) => ({ ...prev, page: p }));
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-[13px] text-gray-500 mt-0.5">
                        {total > 0 ? `${total} orders total` : "Manage customer orders"}
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Orders"
                    value={statsLoading ? "—" : String(stats?.total_orders ?? 0)}
                    icon={TrendingUp}
                    color="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    label="Pending"
                    value={statsLoading ? "—" : String(stats?.pending_orders ?? 0)}
                    icon={Clock}
                    color="bg-amber-50 text-amber-600"
                />
                <StatCard
                    label="Shipped Today"
                    value={statsLoading ? "—" : String(stats?.shipped_today ?? 0)}
                    icon={Truck}
                    color="bg-teal-50 text-teal-600"
                />
                <StatCard
                    label="Revenue Today"
                    value={statsLoading ? "—" : formatPrice(stats?.revenue_today ?? 0)}
                    icon={IndianRupee}
                    color="bg-green-50 text-green-600"
                />
            </div>

            {/* Filters Bar */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1 min-w-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search order #, name, phone..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 placeholder:text-gray-400"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        {/* Order Status Filter */}
                        <div className="relative">
                            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                            <select
                                value={filters.status}
                                onChange={(e) =>
                                    setFilter("status", e.target.value as OrderStatus | "all")
                                }
                                className="pl-7 pr-8 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white appearance-none cursor-pointer text-gray-700"
                            >
                                {ORDER_STATUSES.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Payment Status Filter */}
                        <select
                            value={filters.payment_status}
                            onChange={(e) =>
                                setFilter(
                                    "payment_status",
                                    e.target.value as PaymentStatus | "all"
                                )
                            }
                            className="px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white appearance-none cursor-pointer text-gray-700"
                        >
                            {PAYMENT_STATUSES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>

                        {/* Date Range */}
                        <input
                            type="date"
                            value={filters.date_from ?? ""}
                            onChange={(e) => setFilter("date_from", e.target.value)}
                            className="px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white text-gray-700"
                            title="From date"
                        />
                        <input
                            type="date"
                            value={filters.date_to ?? ""}
                            onChange={(e) => setFilter("date_to", e.target.value)}
                            className="px-3 py-2 text-[13px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white text-gray-700"
                            title="To date"
                        />
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
                            <p className="text-[13px] text-gray-400">Loading orders...</p>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Search className="w-5 h-5 text-gray-400" />
                        </div>
                        <p className="text-[13px] text-gray-500">No orders found</p>
                        <p className="text-[12px] text-gray-400">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/60">
                                    {[
                                        "Order #",
                                        "Date",
                                        "Customer",
                                        "Products",
                                        "Total",
                                        "Payment",
                                        "Status",
                                        "Actions",
                                    ].map((h) => (
                                        <th
                                            key={h}
                                            className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="hover:bg-gray-50/60 transition-colors group"
                                    >
                                        {/* Order # */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-[13px] font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>

                                        {/* Date */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="text-[12px] text-gray-800 font-medium">
                                                {formatDate(order.created_at)}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                {formatTime(order.created_at)}
                                            </p>
                                        </td>

                                        {/* Customer */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <p className="text-[13px] font-medium text-gray-800">
                                                {order.shipping_address?.full_name ?? "—"}
                                            </p>
                                            <p className="text-[11px] text-gray-400">
                                                {order.shipping_address?.phone ?? ""}
                                            </p>
                                        </td>

                                        {/* Products (collapsible) */}
                                        <td className="px-4 py-4 min-w-[220px] max-w-[300px]">
                                            <CollapsibleProducts items={order.items} threshold={2} />
                                        </td>

                                        {/* Total */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-[13px] font-semibold text-gray-900">
                                                {formatPrice(order.total_amount)}
                                            </span>
                                        </td>

                                        {/* Payment */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <PaymentStatusBadge status={order.payment_status} />
                                        </td>

                                        {/* Status */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <OrderStatusBadge status={order.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/orders/${order.id}`}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
                                                    title="View order"
                                                >
                                                    <Eye className="w-3 h-3" />
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/admin/orders/${order.id}/print`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1 px-2 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                                                    title="Print label"
                                                >
                                                    <Printer className="w-3 h-3" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && orders.length > 0 && (
                    <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                        <p className="text-[12px] text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-gray-700">
                                {((filters.page ?? 1) - 1) * (filters.per_page ?? 25) + 1}–
                                {Math.min(
                                    (filters.page ?? 1) * (filters.per_page ?? 25),
                                    total
                                )}
                            </span>{" "}
                            of <span className="font-medium text-gray-700">{total}</span> orders
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => goPage(Math.max(1, (filters.page ?? 1) - 1))}
                                disabled={(filters.page ?? 1) <= 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-[12px] text-gray-600 font-medium">
                                {filters.page ?? 1} / {totalPages}
                            </span>
                            <button
                                onClick={() =>
                                    goPage(Math.min(totalPages, (filters.page ?? 1) + 1))
                                }
                                disabled={(filters.page ?? 1) >= totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
