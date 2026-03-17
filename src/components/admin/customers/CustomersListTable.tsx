"use client";

import Link from "next/link";
import type { AdminCustomerListItem } from "@/types/customers";

function formatDate(value: string | null) {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatInr(value: number) {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

type Props = {
    customers: AdminCustomerListItem[];
    loading: boolean;
    page: number;
    totalPages: number;
    onPrevPage: () => void;
    onNextPage: () => void;
};

export default function CustomersListTable({
    customers,
    loading,
    page,
    totalPages,
    onPrevPage,
    onNextPage,
}: Props) {
    if (loading) {
        return <p className="text-sm text-gray-500">Loading customers...</p>;
    }

    if (customers.length === 0) {
        return <p className="text-sm text-gray-500">No customers found.</p>;
    }

    return (
        <>
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
                                <td className="py-3 pr-4 text-gray-700">{customer.email || "-"}</td>
                                <td className="py-3 pr-4 text-gray-700">{customer.phone || "-"}</td>
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

            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <p>
                    Page {page} of {totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onPrevPage}
                        disabled={page <= 1 || loading}
                        className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={onNextPage}
                        disabled={page >= totalPages || loading}
                        className="px-3 py-1.5 rounded border border-gray-300 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </>
    );
}
