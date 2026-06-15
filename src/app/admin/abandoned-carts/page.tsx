"use client";

import { useEffect, useState, useCallback } from "react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";
import { ShoppingCart, Mail, Phone, Trash2, CheckCircle, Clock, ExternalLink } from "lucide-react";

type AbandonedCart = {
    id: string;
    user_id: string | null;
    email: string | null;
    phone: string | null;
    cart_data: any[];
    last_seen: string;
    notified_at: string | null;
    status: "abandoned" | "notified" | "recovered";
    created_at: string;
    updated_at: string;
};

export default function AdminAbandonedCarts() {
    const [carts, setCarts] = useState<AbandonedCart[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [expandedCartId, setExpandedCartId] = useState<string | null>(null);

    const fetchCarts = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/abandoned-carts");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load carts");
            setCarts(data.carts || []);
        } catch (err: any) {
            setError(err.message || "Failed to load carts");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCarts();
    }, [fetchCarts]);

    const handleAction = async (id: string, action: "email" | "whatsapp" | "recover" | "delete") => {
        setActionLoading(`${id}::${action}`);
        try {
            const res = await fetch("/api/admin/abandoned-carts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Action failed.");
            
            // Refresh list
            await fetchCarts();
        } catch (err: any) {
            alert(err.message || "Failed to run action.");
        } finally {
            setActionLoading(null);
        }
    };

    const getCartValue = (items: any[]) => {
        return items.reduce((sum, item) => sum + (item.price || 0) * (item.meters || 0), 0);
    };

    const getCartQty = (items: any[]) => {
        return items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    };

    const formatDate = (isoStr: string) => {
        const d = new Date(isoStr);
        return d.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts Recovery</h1>
                <p className="text-[13px] text-gray-500 mt-0.5">
                    Track shopper sessions, view active shopping carts left behind, and trigger recovery reminders.
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-xs text-red-600 rounded-xl">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                <div className="p-4 border-b border-gray-100 bg-gray-50/20">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Active Carts Left Behind
                    </h3>
                </div>

                <div className="flex-1 overflow-x-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400 text-xs">
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-600 border-t-transparent" />
                            Loading abandoned carts...
                        </div>
                    ) : carts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-xs gap-1.5">
                            <ShoppingCart className="h-8 w-8 text-slate-300" />
                            <span>No abandoned carts found.</span>
                        </div>
                    ) : (
                        <Table className="text-[13px]" wrapperClassName="border-0 rounded-none">
                            <TableHeader>
                                <TableRow className="border-b border-gray-100 bg-gray-50/50 hover:bg-gray-50/50 select-none">
                                    <TableHead className="text-[10px]">Last Seen</TableHead>
                                    <TableHead className="text-[10px]">Shopper</TableHead>
                                    <TableHead className="text-[10px]">Items Count</TableHead>
                                    <TableHead className="text-[10px]">Cart Value</TableHead>
                                    <TableHead className="text-[10px]">Recovery Status</TableHead>
                                    <TableHead className="text-[10px]">Reminded At</TableHead>
                                    <TableHead className="text-right text-[10px] pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-gray-100 bg-white">
                                {carts.map((cart) => {
                                    const isExpanded = expandedCartId === cart.id;
                                    const cartVal = getCartValue(cart.cart_data || []);
                                    const cartQty = getCartQty(cart.cart_data || []);
                                    
                                    return (
                                        <>
                                            <TableRow key={cart.id} className="hover:bg-gray-50/50 transition-colors">
                                                <TableCell className="font-medium text-gray-700">
                                                    {formatDate(cart.last_seen)}
                                                </TableCell>
                                                <TableCell className="text-gray-900">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-semibold text-gray-800">
                                                            {cart.email || "Guest Shopper"}
                                                        </span>
                                                        {cart.phone && (
                                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                                <Phone className="w-3 h-3 text-slate-400" /> {cart.phone}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-600 font-medium">
                                                    <button 
                                                        onClick={() => setExpandedCartId(isExpanded ? null : cart.id)}
                                                        className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                                                    >
                                                        {cartQty} {cartQty === 1 ? "item" : "items"}
                                                        <ExternalLink className="w-3 h-3" />
                                                    </button>
                                                </TableCell>
                                                <TableCell className="text-gray-900 font-bold">
                                                    ₹{cartVal.toLocaleString("en-IN")}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${
                                                        cart.status === "recovered" ? "bg-emerald-50 text-emerald-700" :
                                                        cart.status === "notified" ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"
                                                    }`}>
                                                        {cart.status === "recovered" && <CheckCircle className="w-3 h-3" />}
                                                        {cart.status === "notified" && <Mail className="w-3 h-3" />}
                                                        {cart.status === "abandoned" && <Clock className="w-3 h-3" />}
                                                        {cart.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-gray-500">
                                                    {cart.notified_at ? formatDate(cart.notified_at) : "—"}
                                                </TableCell>
                                                <TableCell className="text-right pr-6">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            disabled={!cart.email || actionLoading !== null}
                                                            onClick={() => handleAction(cart.id, "email")}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                                                            title="Send Recovery Email"
                                                        >
                                                            <Mail className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            disabled={!cart.phone || actionLoading !== null}
                                                            onClick={() => handleAction(cart.id, "whatsapp")}
                                                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                                                            title="Send WhatsApp Reminder"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            disabled={cart.status === "recovered" || actionLoading !== null}
                                                            onClick={() => handleAction(cart.id, "recover")}
                                                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                                                            title="Mark as Recovered"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            disabled={actionLoading !== null}
                                                            onClick={() => handleAction(cart.id, "delete")}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40 cursor-pointer transition-colors"
                                                            title="Delete Cart"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>

                                            {/* Collapsible Details Row */}
                                            {isExpanded && (
                                                <TableRow key={`${cart.id}-details`} className="bg-slate-50/50 hover:bg-slate-50/50">
                                                    <TableCell colSpan={7} className="px-6 py-4">
                                                        <div className="bg-white rounded-lg border border-gray-100 p-4 shadow-inner max-w-2xl">
                                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Cart Contents</h4>
                                                            <div className="divide-y divide-gray-100">
                                                                {(cart.cart_data || []).map((item: any, idx: number) => (
                                                                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                                                                        <div className="flex items-center gap-3">
                                                                            <img src={item.image} alt={item.name} className="w-8 h-8 object-cover rounded border border-gray-200" />
                                                                            <div>
                                                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                                                <p className="text-[10px] text-gray-500">₹{item.price.toLocaleString("en-IN")} per {item.selling_mode === "meter" ? "meter" : "piece"}</p>
                                                                            </div>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            <p className="font-medium text-gray-600">{item.meters} {item.selling_mode === "meter" ? "m" : "pc"}</p>
                                                                            <p className="font-bold text-gray-900">₹{(item.price * item.meters).toLocaleString("en-IN")}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </div>
        </div>
    );
}
