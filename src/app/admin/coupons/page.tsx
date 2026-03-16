"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");

    const loadCoupons = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/coupons");
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch coupons");
            setCoupons(json.coupons || []);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to fetch coupons");
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
            setError(err instanceof Error ? err.message : "Failed to fetch coupon analytics");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        loadCoupons();
        loadAnalytics();
    }, []);

    const formatINR = (value: number) => `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

    const filteredCoupons = useMemo(() => {
        if (!search.trim()) return coupons;
        const query = search.toLowerCase();
        return coupons.filter((coupon) =>
            coupon.code.toLowerCase().includes(query)
            || coupon.name.toLowerCase().includes(query),
        );
    }, [coupons, search]);

    const toggleStatus = async (coupon: AdminCoupon) => {
        setError("");
        setSuccess("");

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
            setSuccess(`Coupon ${nextStatus === "active" ? "activated" : "deactivated"}.`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update coupon");
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

            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm">
                    {success}
                </div>
            )}

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Coupon Listing</h2>
                    <input
                        type="text"
                        placeholder="Search by code or name"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full sm:w-72 px-3 py-2 rounded-md border border-gray-300 text-sm"
                    />
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading coupons...</p>
                ) : filteredCoupons.length === 0 ? (
                    <p className="text-sm text-gray-500">No coupons found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="py-2 pr-4">Code</th>
                                    <th className="py-2 pr-4">Name</th>
                                    <th className="py-2 pr-4">Discount</th>
                                    <th className="py-2 pr-4">Eligibility</th>
                                    <th className="py-2 pr-4">Visibility</th>
                                    <th className="py-2 pr-4">Status</th>
                                    <th className="py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCoupons.map((coupon) => (
                                    <tr key={coupon.id} className="border-b border-gray-100">
                                        <td className="py-3 pr-4 font-semibold text-gray-900">{coupon.code}</td>
                                        <td className="py-3 pr-4">{coupon.name}</td>
                                        <td className="py-3 pr-4">
                                            {coupon.discount_type === "percentage"
                                                ? `${coupon.discount_value}%`
                                                : `₹${coupon.discount_value}`}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {coupon.max_completed_orders_for_eligibility !== null
                                                ? `Orders <= ${coupon.max_completed_orders_for_eligibility}`
                                                : "All order counts"}
                                            {coupon.min_cart_subtotal ? ` · Min ₹${coupon.min_cart_subtotal}` : ""}
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600">
                                            {coupon.show_on_home_banner ? "Home" : ""}
                                            {coupon.show_on_home_banner && coupon.show_on_checkout_modal ? " + " : ""}
                                            {coupon.show_on_checkout_modal ? "Checkout" : ""}
                                            {coupon.specific_user_only ? " · Specific Users" : ""}
                                        </td>
                                        <td className="py-3 pr-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${coupon.status === "active"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-gray-100 text-gray-700"
                                                }`}>
                                                {coupon.status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/admin/coupons/${coupon.id}`}
                                                    className="px-3 py-1.5 rounded border border-gray-300 text-xs font-medium hover:bg-gray-50"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => toggleStatus(coupon)}
                                                    className="px-3 py-1.5 rounded border border-gray-300 text-xs font-medium hover:bg-gray-50"
                                                >
                                                    {coupon.status === "active" ? "Deactivate" : "Activate"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
