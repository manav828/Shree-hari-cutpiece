"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { AdminCustomerListItem } from "@/types/customers";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";

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
    total: number;
    limit: number;
    onLimitChange: (limit: number) => void;
    onPrevPage: () => void;
    onNextPage: () => void;
};

export default function CustomersListTable({
    customers,
    loading,
    page,
    totalPages,
    total,
    limit,
    onLimitChange,
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
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Join Date</TableHead>
                        <TableHead>Last Order</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>LTV</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {customers.map((customer) => (
                        <TableRow key={customer.id}>
                            <TableCell className="font-medium text-gray-900">
                                <Link href={`/admin/customers/${customer.id}`} className="hover:underline">
                                    {customer.full_name || customer.email || "View Customer"}
                                </Link>
                            </TableCell>
                            <TableCell>{customer.email || "-"}</TableCell>
                            <TableCell>{customer.phone || "-"}</TableCell>
                            <TableCell>{formatDate(customer.created_at)}</TableCell>
                            <TableCell>{formatDate(customer.last_order_date)}</TableCell>
                            <TableCell>{customer.total_orders}</TableCell>
                            <TableCell>{formatInr(customer.lifetime_value)}</TableCell>
                            <TableCell>
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
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
                <p className="text-[12px] text-gray-500">
                    Showing <span className="font-medium text-gray-700">{(page - 1) * limit + 1}–{Math.min(page * limit, total)}</span> of <span className="font-medium text-gray-700">{total}</span> customers
                </p>
                <div className="flex items-center justify-center">
                    <select
                        value={limit}
                        onChange={(e) => onLimitChange(Number(e.target.value))}
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
                        onClick={onPrevPage}
                        disabled={page <= 1 || loading}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="px-3 py-1 text-[12px] text-gray-600 font-medium">
                        {page} / {totalPages}
                    </span>
                    <button
                        onClick={onNextPage}
                        disabled={page >= totalPages || loading}
                        className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </>
    );
}
