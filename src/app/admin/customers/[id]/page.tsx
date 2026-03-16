"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Package, User, StickyNote } from "lucide-react";
import type { AdminCustomerDetails, CustomerAccountStatus } from "@/types/customers";

function formatDate(value: string | null) {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function formatDateTime(value: string | null) {
    if (!value) return "—";
    const date = new Date(value);
    return `${formatDate(value)} · ${date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatInr(value: number) {
    return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function Card({
    title,
    icon: Icon,
    children,
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/60 flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-500" />
                <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

export default function AdminCustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [details, setDetails] = useState<AdminCustomerDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [statusInput, setStatusInput] = useState<CustomerAccountStatus>("active");
    const [notesInput, setNotesInput] = useState("");
    const [success, setSuccess] = useState("");

    const loadDetails = async () => {
        if (!id) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/customers/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to fetch customer details");

            const payload = json as AdminCustomerDetails;
            setDetails(payload);
            setStatusInput((payload.customer.account_status || "active") as CustomerAccountStatus);
            setNotesInput(payload.internal_notes || "");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to fetch customer details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDetails();
    }, [id]);

    const displayName = useMemo(() => {
        if (!details) return "Customer";
        return details.customer.full_name || details.customer.email || "Customer";
    }, [details]);

    const saveProfile = async () => {
        if (!id) return;
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/admin/customers/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    account_status: statusInput,
                    internal_notes: notesInput,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update customer");

            setSuccess("Customer profile updated.");
            await loadDetails();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to update customer");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-sm text-gray-500">Loading customer details...</p>
            </div>
        );
    }

    if (error && !details) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-4 text-sm">{error}</div>
            </div>
        );
    }

    if (!details) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                </button>
                <p className="text-sm text-gray-500">Customer not found.</p>
            </div>
        );
    }

    const customer = details.customer;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Customers
                </button>

                <div>
                    <h1 className="text-xl font-bold text-gray-900">{displayName}</h1>
                    <p className="text-[12px] text-gray-500 mt-0.5">Customer ID: {customer.id}</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 p-3 text-sm">
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <Card title="Profile Summary" icon={User}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-start gap-2">
                                <Mail className="w-4 h-4 mt-0.5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Email</p>
                                    <p className="text-gray-800">{customer.email || "—"}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone className="w-4 h-4 mt-0.5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase">Phone</p>
                                    <p className="text-gray-800">{customer.phone || "—"}</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Joined</p>
                                <p className="text-gray-800">{formatDate(customer.created_at)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Last Login</p>
                                <p className="text-gray-800">{formatDateTime(customer.last_sign_in_at)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Order History" icon={Package}>
                        {details.orders.length === 0 ? (
                            <p className="text-sm text-gray-500">No orders found for this customer.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-gray-500 border-b border-gray-200">
                                            <th className="py-2 pr-4">Order #</th>
                                            <th className="py-2 pr-4">Date</th>
                                            <th className="py-2 pr-4">Status</th>
                                            <th className="py-2 pr-4">Payment</th>
                                            <th className="py-2 pr-4">Coupon</th>
                                            <th className="py-2">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {details.orders.map((order) => (
                                            <tr key={order.id} className="border-b border-gray-100">
                                                <td className="py-3 pr-4 font-medium text-gray-900">
                                                    <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                                                        {order.order_number}
                                                    </Link>
                                                </td>
                                                <td className="py-3 pr-4 text-gray-700">{formatDate(order.created_at)}</td>
                                                <td className="py-3 pr-4 text-gray-700">{order.status}</td>
                                                <td className="py-3 pr-4 text-gray-700">{order.payment_status}</td>
                                                <td className="py-3 pr-4 text-gray-700">{order.coupon_code || "—"}</td>
                                                <td className="py-3 text-gray-700">{formatInr(order.total_amount)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="space-y-5">
                    <Card title="Customer Metrics" icon={Package}>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Total Orders</span>
                                <span className="font-medium text-gray-900">{customer.total_orders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Total Spent</span>
                                <span className="font-medium text-gray-900">{formatInr(details.total_spent)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Avg Order Value</span>
                                <span className="font-medium text-gray-900">{formatInr(details.avg_order_value)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-500">Last Order</span>
                                <span className="font-medium text-gray-900">{formatDate(customer.last_order_date)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card title="Addresses" icon={MapPin}>
                        {details.addresses.length === 0 ? (
                            <p className="text-sm text-gray-500">No saved addresses.</p>
                        ) : (
                            <div className="space-y-3">
                                {details.addresses.map((address) => (
                                    <div key={address.id} className="rounded-lg border border-gray-200 p-3">
                                        <p className="text-sm font-medium text-gray-900">{address.full_name}</p>
                                        <p className="text-xs text-gray-600">{address.address_line1}</p>
                                        {address.address_line2 && <p className="text-xs text-gray-600">{address.address_line2}</p>}
                                        <p className="text-xs text-gray-600">
                                            {address.city}, {address.state} - {address.pincode}
                                        </p>
                                        <p className="text-xs text-gray-600">{address.phone}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Notes & Account" icon={StickyNote}>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Account Status</label>
                                <select
                                    value={statusInput}
                                    onChange={(e) => setStatusInput(e.target.value as CustomerAccountStatus)}
                                    className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="blocked">Blocked</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs text-gray-500 block mb-1">Internal Notes</label>
                                <textarea
                                    value={notesInput}
                                    onChange={(e) => setNotesInput(e.target.value)}
                                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-gray-300 text-sm"
                                    placeholder="Add internal notes for support/admin team"
                                />
                            </div>

                            <button
                                onClick={saveProfile}
                                disabled={saving}
                                className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Save Profile"}
                            </button>
                        </div>
                    </Card>

                    <Card title="Recent Interactions" icon={StickyNote}>
                        {details.interactions.length === 0 ? (
                            <p className="text-sm text-gray-500">No interactions yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {details.interactions.map((entry) => (
                                    <div key={entry.id} className="border-b border-gray-100 pb-2 last:border-none last:pb-0">
                                        <p className="text-xs uppercase tracking-wide text-gray-400">{entry.event_type}</p>
                                        <p className="text-sm text-gray-700">{entry.note || "—"}</p>
                                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(entry.created_at)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
