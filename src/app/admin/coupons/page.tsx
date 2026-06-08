"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { showToast } from "@/lib/toast";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";
import { Input } from "@/components/admin/ui/Input";
import { ChevronLeft, ChevronRight } from "lucide-react";

type AdminCoupon = {
    id: string;
    code: string;
    name: string;
    discount_type: "percentage" | "fixed";
    discount_value: number;
    status: "active" | "inactive" | "archived";
    starts_at: string;
    ends_at: string | null;
    min_cart_subtotal: number | null;
    max_completed_orders_for_eligibility: number | null;
    show_on_home_banner: boolean;
    show_on_checkout_modal: boolean;
    specific_user_only: boolean;
};

type CouponAnalytics = {
    totalCoupons: number;
    activeCoupons: number;
    totalRedemptions: number;
    totalDiscountSpend: number;
    influencedRevenue: number;
};

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
    const [analytics, setAnalytics] = useState<CouponAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    const loadCoupons = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/coupons");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch coupons");
            setCoupons(json.coupons || []);
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to fetch coupons", "error");
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch("/api/admin/coupons/analytics");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch coupon analytics");
            setAnalytics(json as CouponAnalytics);
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to fetch coupon analytics", "error");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
        loadAnalytics();
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search]);

    const formatINR = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

    const filteredCoupons = useMemo(() => {
        if (!search.trim()) return coupons;
        const query = search.toLowerCase();
        return coupons.filter((coupon) =>
            coupon.code.toLowerCase().includes(query)
            || coupon.name.toLowerCase().includes(query),
        );
    }, [coupons, search]);

    const paginatedCoupons = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredCoupons.slice(start, start + limit);
    }, [filteredCoupons, page, limit]);

    const totalPages = Math.max(1, Math.ceil(filteredCoupons.length / limit));

    const toggleStatus = async (coupon: AdminCoupon) => {
        try {
            const nextStatus = coupon.status === "active" ? "inactive" : "active";
            const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: nextStatus }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update status");

            setCoupons((prev) => prev.map((item) => (
                item.id === coupon.id ? { ...item, status: nextStatus } : item
            )));
            showToast(`Coupon ${nextStatus === "active" ? "activated" : "deactivated"}.`, "success");
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Failed to update coupon", "error");
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-playfair font-bold text-gray-900">Coupons & Discounts</h1>
                <Link
                    href="/admin/coupons/new"
                    className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium"
                >
                    Create Coupon
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Total Coupons</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : (analytics?.totalCoupons ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Active Coupons</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : (analytics?.activeCoupons ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Total Redemptions</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : (analytics?.totalRedemptions ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Discount Spend</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : formatINR(analytics?.totalDiscountSpend ?? 0)}
                    </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <p className="text-xs text-gray-500">Influenced Revenue</p>
                    <p className="text-xl font-semibold text-gray-900 mt-1">
                        {analyticsLoading ? "..." : formatINR(analytics?.influencedRevenue ?? 0)}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 mb-4">
                    <Input
                        type="text"
                        placeholder="Search by code or name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="sm:w-72"
                        wrapperClassName="w-auto"
                    />
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading coupons...</p>
                ) : filteredCoupons.length === 0 ? (
                    <p className="text-sm text-gray-500">No coupons found.</p>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <Table wrapperClassName="border-0 rounded-none">
                            <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Discount</TableHead>
                                <TableHead>Eligibility</TableHead>
                                <TableHead>Visibility</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCoupons.map((coupon) => (
                                <TableRow key={coupon.id}>
                                    <TableCell className="font-semibold text-gray-900 whitespace-nowrap">{coupon.code}</TableCell>
                                    <TableCell className="text-gray-700">{coupon.name}</TableCell>
                                    <TableCell className="text-gray-700">
                                        {coupon.discount_type === "percentage"
                                            ? `${coupon.discount_value}%`
                                            : `₹${coupon.discount_value}`}
                                    </TableCell>
                                    <TableCell className="text-gray-650 text-xs">
                                        {coupon.max_completed_orders_for_eligibility !== null
                                            ? `Orders <= ${coupon.max_completed_orders_for_eligibility}`
                                            : "All order counts"}
                                        {coupon.min_cart_subtotal ? ` · Min ₹${coupon.min_cart_subtotal}` : ""}
                                    </TableCell>
                                    <TableCell className="text-gray-650 text-xs">
                                        {coupon.show_on_home_banner ? "Home" : ""}
                                        {coupon.show_on_home_banner && coupon.show_on_checkout_modal ? " + " : ""}
                                        {coupon.show_on_checkout_modal ? "Checkout" : ""}
                                        {coupon.specific_user_only ? " · Specific Users" : ""}
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${coupon.status === "active"
                                            ? "bg-green-150 text-green-700"
                                            : "bg-gray-150 text-gray-700"
                                            }`}>
                                            {coupon.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/admin/coupons/${coupon.id}`}
                                                className="px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer shadow-sm"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => toggleStatus(coupon)}
                                                className="px-3 py-1.5 rounded border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-200 transition-all cursor-pointer shadow-sm"
                                            >
                                                {coupon.status === "active" ? "Deactivate" : "Activate"}
                                            </button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination Footer */}
                    <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                        <p className="text-[12px] text-gray-500">
                            Showing{" "}
                            <span className="font-medium text-gray-700">
                                {filteredCoupons.length > 0 ? (page - 1) * limit + 1 : 0}–
                                {Math.min(page * limit, filteredCoupons.length)}
                            </span>{" "}
                            of <span className="font-medium text-gray-700">{filteredCoupons.length}</span> coupons
                        </p>
                        <div className="flex items-center justify-center">
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(Number(e.target.value));
                                    setPage(1);
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
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                disabled={page <= 1}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 text-[12px] text-gray-600 font-medium">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                disabled={page >= totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
