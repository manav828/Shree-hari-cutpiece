"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    MapPin,
    User,
    Package,
    CreditCard,
    Tag,
    Clock,
    Printer,
    CheckCircle2,
    Circle,
} from "lucide-react";
import { fetchOrderById, fetchOrderUserEmail } from "@/lib/orders";
import type { OrderWithDetails, CustomOrderStatus } from "@/types/orders";
import OrderStatusBadge from "@/components/admin/orders/OrderStatusBadge";
import PaymentStatusBadge from "@/components/admin/orders/PaymentStatusBadge";
import OrderActions from "@/components/admin/orders/OrderActions";

async function loadCustomStatuses(): Promise<CustomOrderStatus[]> {
    try {
        const res = await fetch("/api/admin/custom-statuses");
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fp(n: number) {
    return `₹${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function fDateTime(iso: string) {
    const d = new Date(iso);
    return `${fDate(iso)}, ${d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatOptionSummary(options?: Array<{ group_name?: string | null; value_labels?: string[] | null; input_value?: string | number | null; }> | null) {
    if (!options || options.length === 0) return "";
    const parts = options
        .map((opt) => {
            const value = opt.value_labels?.join(", ") || opt.input_value;
            if (!value) return null;
            return `${opt.group_name}: ${value}`;
        })
        .filter(Boolean) as string[];
    return parts.join(" | ");
}

// ─── Card Shell ───────────────────────────────────────────────────────────────

function Card({
    title,
    icon: Icon,
    children,
    className = "",
}: {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
                <Icon className="w-4 h-4 text-gray-500" strokeWidth={1.8} />
                <h3 className="text-[13px] font-semibold text-gray-700">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
    return (
        <div className="flex flex-col gap-0.5">
            <span className="text-[11px] text-gray-400 uppercase tracking-wide font-medium">
                {label}
            </span>
            <span className="text-[13px] text-gray-800 font-medium">
                {value || "—"}
            </span>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [order, setOrder] = useState<OrderWithDetails | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [customStatuses, setCustomStatuses] = useState<CustomOrderStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const [data, statuses] = await Promise.all([
                    fetchOrderById(id),
                    loadCustomStatuses(),
                ]);
                if (!data) {
                    setNotFound(true);
                } else {
                    setOrder(data);
                    setCustomStatuses(statuses);
                    // Fetch email if order has a user_id
                    if (data.user_id) {
                        fetchOrderUserEmail(data.user_id).then(setUserEmail);
                    }
                }
            } catch (err) {
                console.error(err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-800 animate-spin" />
                    <p className="text-[13px] text-gray-400">Loading order...</p>
                </div>
            </div>
        );
    }

    if (notFound || !order) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Package className="w-10 h-10 text-gray-300" />
                <p className="text-gray-500 font-medium">Order not found</p>
                <Link
                    href="/admin/orders"
                    className="text-[13px] text-indigo-600 hover:underline"
                >
                    Back to Orders
                </Link>
            </div>
        );
    }

    const addr = order.shipping_address;
    const hasDiscount = order.discount_amount > 0;
    const hasCoupon = !!order.coupon_code;

    // Find custom color for current status
    const matchedStatus = customStatuses.find(
        (s) => s.label.toLowerCase() === order.status.toLowerCase()
    );

    return (
        <div className="space-y-6 max-w-6xl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-[13px] text-gray-500 hover:text-gray-800 transition-colors self-start"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </button>

                <div className="flex-1 flex flex-wrap items-center gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {order.order_number}
                        </h1>
                        <p className="text-[12px] text-gray-400 mt-0.5">
                            Placed on {fDateTime(order.created_at)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Single status badge only */}
                        <OrderStatusBadge
                            status={matchedStatus?.label ?? order.status}
                            customColor={matchedStatus?.color}
                            size="md"
                        />
                        {order.label_printed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                <Printer className="w-3 h-3" />
                                Label Printed
                            </span>
                        )}
                    </div>

                    {/* Print label button */}
                    <div className="ml-auto flex gap-2">
                        <Link
                            href={`/admin/orders/${order.id}/print`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors shadow-sm"
                            title="Print Label"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            Print Label
                        </Link>
                    </div>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* ──── LEFT: Main Content (2 cols) ──── */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Customer Info + Shipping Address SIDE BY SIDE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Customer Info */}
                        <Card title="Customer Information" icon={User}>
                            <div className="space-y-3">
                                <InfoRow label="Full Name" value={addr?.full_name} />
                                <InfoRow label="Phone" value={addr?.phone} />
                                <InfoRow
                                    label="Email"
                                    value={userEmail ?? (order.user_id ? "Loading…" : "—")}
                                />
                            </div>
                        </Card>

                        {/* Shipping Address */}
                        <Card title="Shipping Address" icon={MapPin}>
                            {addr ? (
                                <div className="space-y-1">
                                    <p className="text-[13px] font-semibold text-gray-800">{addr.full_name}</p>
                                    <p className="text-[13px] text-gray-600">{addr.address_line1}</p>
                                    {addr.address_line2 && (
                                        <p className="text-[13px] text-gray-600">{addr.address_line2}</p>
                                    )}
                                    <p className="text-[13px] text-gray-600">
                                        {addr.city}, {addr.state} – {addr.pincode}
                                    </p>
                                    <p className="text-[13px] text-gray-600">{addr.country}</p>
                                    <p className="text-[13px] text-gray-600 mt-1">📞 {addr.phone}</p>
                                </div>
                            ) : (
                                <p className="text-[13px] text-gray-400 italic">
                                    No address on file
                                </p>
                            )}
                        </Card>
                    </div>

                    {/* Order Items */}
                    <Card title="Order Items" icon={Package}>
                        <div className="overflow-x-auto -mx-5">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        {["Product", "Color", "Mode", "Qty", "Unit Price", "Total"].map((h) => (
                                            <th
                                                key={h}
                                                className="px-5 py-2.5 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap"
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {order.items.map((item, idx) => (
                                        <tr key={item.id} className={idx % 2 === 0 ? "" : "bg-gray-50/40"}>
                                            <td className="px-5 py-3">
                                                <div className="flex items-center gap-3">
                                                    {item.image_url ? (
                                                        <img
                                                            src={item.image_url}
                                                            alt={item.product_name}
                                                            className="w-10 h-10 rounded-md object-cover border border-gray-200 flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-4 h-4 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <span className="text-[13px] font-medium text-gray-800">
                                                        {item.product_name}
                                                    </span>
                                                    {formatOptionSummary(item.selected_options_json) && (
                                                        <span className="text-[11px] text-gray-400 mt-0.5 block">
                                                            {formatOptionSummary(item.selected_options_json)}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 text-[13px] text-gray-600 whitespace-nowrap">
                                                {item.color_name || "—"}
                                            </td>
                                            <td className="px-5 py-3 whitespace-nowrap">
                                                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 capitalize">
                                                    {item.selling_mode}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-[13px] text-gray-700 whitespace-nowrap font-medium">
                                                {item.selling_mode === "meter"
                                                    ? `${item.quantity_or_meters}m`
                                                    : `×${item.quantity_or_meters}`}
                                            </td>
                                            <td className="px-5 py-3 text-[13px] text-gray-600 whitespace-nowrap">
                                                {fp(item.price_per_unit)}
                                                {item.selling_mode === "meter" && (
                                                    <span className="text-gray-400">/m</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-[13px] font-semibold text-gray-900 whitespace-nowrap">
                                                {fp(item.total_price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Snapshot note */}
                        <p className="mt-3 text-[11px] text-gray-400 italic px-0.5">
                            ℹ️ Product names, colors, and prices are captured at time of order and will not change.
                        </p>
                    </Card>

                    {/* Status History Timeline */}
                    {order.status_history.length > 0 && (
                        <Card title="Status History" icon={Clock}>
                            <div className="space-y-4">
                                {order.status_history.map((entry, idx) => {
                                    const isLast = idx === order.status_history.length - 1;
                                    return (
                                        <div key={entry.id} className="flex gap-3">
                                            <div className="flex flex-col items-center">
                                                {isLast ? (
                                                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                ) : (
                                                    <Circle className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                                                )}
                                                {!isLast && (
                                                    <div className="w-px flex-1 bg-gray-200 my-1" />
                                                )}
                                            </div>
                                            <div className="pb-2">
                                                <p className="text-[13px] font-medium text-gray-800 capitalize">
                                                    {entry.to_status}
                                                </p>
                                                {entry.note && (
                                                    <p className="text-[12px] text-gray-500">{entry.note}</p>
                                                )}
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {fDateTime(entry.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    )}
                </div>

                {/* ──── RIGHT: Sidebar ──── */}
                <div className="space-y-5">

                    {/* Order Summary */}
                    <Card title="Order Summary" icon={Package}>
                        <div className="space-y-2.5">
                            <div className="flex justify-between text-[13px]">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-800 font-medium">{fp(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-[13px]">
                                <span className="text-gray-500">Shipping</span>
                                <span className="text-gray-800 font-medium">{fp(order.shipping_amount)}</span>
                            </div>

                            {hasDiscount && (
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-green-600">
                                        Coupon
                                        {order.coupon_code && (
                                            <span className="ml-1 text-[11px] font-semibold bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                {order.coupon_code}
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-green-600 font-medium">
                                        −{fp(order.discount_amount)}
                                    </span>
                                </div>
                            )}

                            <div className="border-t border-gray-200 pt-2.5 flex justify-between">
                                <span className="text-[14px] font-bold text-gray-900">Total</span>
                                <span className="text-[14px] font-bold text-gray-900">
                                    {fp(order.total_amount)}
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Payment Info */}
                    <Card title="Payment Info" icon={CreditCard}>
                        <div className="space-y-3">
                            <InfoRow
                                label="Method"
                                value={order.payment_method === "cod" ? "Cash on Delivery" : "Razorpay"}
                            />
                            <InfoRow
                                label="Razorpay Order ID"
                                value={order.razorpay_order_id ?? "—"}
                            />
                            <InfoRow
                                label="Razorpay Payment ID"
                                value={order.razorpay_payment_id ?? "—"}
                            />
                            <div className="pt-1">
                                <PaymentStatusBadge status={order.payment_status} size="md" />
                            </div>
                            {!order.razorpay_order_id && order.payment_method === "razorpay" && (
                                <p className="text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-1">
                                    Payment gateway not yet connected.
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Coupon Details — only if coupon used */}
                    {hasCoupon && (
                        <Card title="Coupon Applied" icon={Tag}>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-bold text-gray-800 tracking-wider">
                                        {order.coupon_code}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[13px]">
                                    <span className="text-gray-500">Discount</span>
                                    <span className="text-green-600 font-semibold">
                                        −{fp(order.discount_amount)}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Unified Interactive Status, Tracking & Notes */}
                    <OrderActions order={order} />
                </div>
            </div>
        </div>
    );
}
