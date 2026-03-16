"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AdminCustomerListItem, AdminCustomersListResponse } from "@/types/customers";

function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatInr(value: number) {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function AdminCustomers() {
    const [customers, setCustomers] = useState<AdminCustomerListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    const params = useMemo(() => {
        const query = new URLSearchParams();
        query.set("page", String(page));
        query.set("limit", String(limit));
        query.set("sortBy", "joined");
        if (search.trim()) query.set("search", search.trim());
        if (status !== "all") query.set("status", status);
        return query.toString();
    }, [limit, page, search, status]);

    useEffect(() => {
        let isMounted = true;

        const loadCustomers = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/admin/customers?${params}`);
                const json = (await res.json()) as AdminCustomersListResponse | { error?: string };

                if (!res.ok) {
                    const message = "error" in json ? (json.error || "Failed to fetch customers") : "Failed to fetch customers";
                    throw new Error(message);
                }

                if (!isMounted) return;

                const data = json as AdminCustomersListResponse;
                setCustomers(data.customers ?? []);
                setTotal(data.total ?? 0);
                setTotalPages(data.total_pages ?? 1);
            } catch (err: unknown) {
                if (!isMounted) return;
                setError(err instanceof Error ? err.message : "Failed to fetch customers");
                setCustomers([]);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        loadCustomers();
        return () => {
            isMounted = false;
        };
    }, [params]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-playfair font-bold text-gray-900">Customers</h1>
                    <p className="text-sm text-gray-500 mt-1">{total} registered customers</p>
                </div>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        className="w-full sm:w-80 px-3 py-2 rounded-md border border-gray-300 text-sm"
                    />

                    <select
                        value={status}
                        onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                        }}
                        className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="blocked">Blocked</option>
                    </select>

                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                        className="px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                    >
                        <option value={20}>20 / page</option>
                        <option value={50}>50 / page</option>
                        <option value={100}>100 / page</option>
                    </select>
                </div>

                {loading ? (
                    <p className="text-sm text-gray-500">Loading customers...</p>
                ) : customers.length === 0 ? (
                    <p className="text-sm text-gray-500">No customers found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b border-gray-200">
                                    <th className="py-2 pr-4">Name</th>
                                    <th className="py-2 pr-4">Email</th>
                                    <th className="py-2 pr-4">Phone</th>
                                    <th className="py-2 pr-4">Join Date</th>
                                    <th className="py-2 pr-4">Last Order</th>
                                    <th className="py-2 pr-4">Orders</th>
                                    <th className="py-2 pr-4">LTV</th>
                                    <th className="py-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.id} className="border-b border-gray-100">
                                        <td className="py-3 pr-4 font-medium text-gray-900">
                                            <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                                                {customer.full_name || customer.email || "View Customer"}
                                            </Link>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-700">{customer.email || "—"}</td>
                                        <td className="py-3 pr-4 text-gray-700">{customer.phone || "—"}</td>
                                        <td className="py-3 pr-4 text-gray-700">{formatDate(customer.created_at)}</td>
                                        <td className="py-3 pr-4 text-gray-700">{formatDate(customer.last_order_date)}</td>
                                        <td className="py-3 pr-4 text-gray-700">{customer.total_orders}</td>
                                        <td className="py-3 pr-4 text-gray-700">{formatInr(customer.lifetime_value)}</td>
                                        <td className="py-3">
                                            <span
                                                className={`px-2 py-1 rounded text-xs font-medium ${customer.account_status === "blocked"
                                                    ? "bg-red-100 text-red-700"
                                                    : customer.account_status === "suspended"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {customer.account_status || "active"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <p>
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page <= 1 || loading}
                            className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={page >= totalPages || loading}
                            className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
