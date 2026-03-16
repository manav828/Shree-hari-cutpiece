"use client";

import { useEffect, useState } from "react";
import { updateOrderStatus, updateOrderTracking, updateOrderNotes } from "@/app/actions/order";
import { Package, Truck, StickyNote, Save, Edit2, CheckCircle, XCircle } from "lucide-react";
import { OrderWithDetails, CustomOrderStatus } from "@/types/orders";

async function loadCustomStatuses(): Promise<CustomOrderStatus[]> {
    try {
        const res = await fetch("/api/admin/custom-statuses");
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// ── Inline toast ──────────────────────────────────────────────────────────────

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
    return (
        <div
            className={`flex items-center gap-2 text-[12px] font-medium px-3 py-2 rounded-lg border ${
                type === "success"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : "bg-red-50 text-red-700 border-red-200"
            }`}
        >
            {type === "success" ? (
                <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            ) : (
                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
            )}
            {message}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function OrderActions({ order }: { order: OrderWithDetails }) {
    const [statusLoading, setStatusLoading] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [notesLoading, setNotesLoading] = useState(false);

    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [customStatuses, setCustomStatuses] = useState<CustomOrderStatus[]>([]);
    const [statusToast, setStatusToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [editingTracking, setEditingTracking] = useState(false);
    const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");
    const [trackingToast, setTrackingToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    const [editingNotes, setEditingNotes] = useState(false);
    const [notes, setNotes] = useState(order.notes || "");
    const [notesToast, setNotesToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

    // Load custom statuses on mount
    useEffect(() => {
        loadCustomStatuses().then(setCustomStatuses);
    }, []);

    // Auto-dismiss toasts
    function showToast(
        setter: React.Dispatch<React.SetStateAction<{ message: string; type: "success" | "error" } | null>>,
        message: string,
        type: "success" | "error"
    ) {
        setter({ message, type });
        setTimeout(() => setter(null), 3000);
    }

    // ── Status change: no confirm dialog ──────────────────────────────────────
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setCurrentStatus(newStatus);
        setStatusLoading(true);

        const res = await updateOrderStatus(order.id, newStatus);
        setStatusLoading(false);

        if (res.success) {
            showToast(setStatusToast, `Status updated to "${newStatus}"`, "success");
        } else {
            setCurrentStatus(order.status); // revert
            showToast(setStatusToast, `Failed: ${res.error}`, "error");
        }
    };

    // ── Tracking ──────────────────────────────────────────────────────────────
    const handleSaveTracking = async () => {
        setTrackingLoading(true);
        const res = await updateOrderTracking(order.id, trackingUrl);
        setTrackingLoading(false);
        if (res.success) {
            setEditingTracking(false);
            showToast(setTrackingToast, "Tracking URL saved", "success");
        } else {
            showToast(setTrackingToast, `Failed: ${res.error}`, "error");
        }
    };

    // ── Notes ─────────────────────────────────────────────────────────────────
    const handleSaveNotes = async () => {
        setNotesLoading(true);
        const res = await updateOrderNotes(order.id, notes);
        setNotesLoading(false);
        if (res.success) {
            setEditingNotes(false);
            showToast(setNotesToast, "Notes saved", "success");
        } else {
            showToast(setNotesToast, `Failed: ${res.error}`, "error");
        }
    };

    // Find color for current status
    const selectedStatus = customStatuses.find(
        (s) => s.label.toLowerCase() === currentStatus.toLowerCase()
    );

    return (
        <div className="space-y-5">
            {/* ── Update Order Status ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <h3 className="text-[14px] font-semibold text-gray-800">Update Status</h3>
                </div>
                <div className="p-5 space-y-3">
                    {/* Color preview dot + select */}
                    <div className="flex items-center gap-2">
                        {selectedStatus && (
                            <span
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: selectedStatus.color }}
                            />
                        )}
                        <select
                            value={currentStatus}
                            onChange={handleStatusChange}
                            disabled={statusLoading}
                            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 disabled:opacity-50 bg-white"
                        >
                            {customStatuses.length > 0
                                ? customStatuses.map((s) => (
                                    <option key={s.id} value={s.label}>
                                        {s.label}
                                    </option>
                                ))
                                : (
                                    // Fallback while loading
                                    <>
                                        <option value="pending">Pending</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="returning">Return Requested</option>
                                        <option value="returned">Returned</option>
                                        <option value="replacing">Replace Requested</option>
                                        <option value="replaced">Replaced</option>
                                    </>
                                )
                            }
                        </select>
                    </div>
                    {statusLoading && (
                        <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin inline-block" />
                            Updating status…
                        </p>
                    )}
                    {statusToast && <Toast {...statusToast} />}
                </div>
            </div>

            {/* ── Tracking URL ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-gray-400" />
                        <h3 className="text-[14px] font-semibold text-gray-800">Tracking Info</h3>
                    </div>
                    {!editingTracking && (
                        <button onClick={() => setEditingTracking(true)} className="text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="p-5 space-y-3">
                    {editingTracking ? (
                        <div className="space-y-3">
                            <input
                                type="url"
                                placeholder="https://track-url.com/123"
                                value={trackingUrl}
                                onChange={(e) => setTrackingUrl(e.target.value)}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setEditingTracking(false);
                                        setTrackingUrl(order.tracking_url || "");
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveTracking}
                                    disabled={trackingLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {trackingLoading ? "Saving…" : <><Save className="w-3 h-3" /> Save</>}
                                </button>
                            </div>
                        </div>
                    ) : order.tracking_url ? (
                        <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[13px] text-blue-600 hover:underline break-all"
                        >
                            {order.tracking_url}
                        </a>
                    ) : (
                        <p className="text-[13px] text-gray-400 italic">No tracking URL added yet.</p>
                    )}
                    {trackingToast && <Toast {...trackingToast} />}
                </div>
            </div>

            {/* ── Admin Notes ── */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <StickyNote className="w-4 h-4 text-gray-400" />
                        <h3 className="text-[14px] font-semibold text-gray-800">Admin Notes</h3>
                    </div>
                    {!editingNotes && (
                        <button onClick={() => setEditingNotes(true)} className="text-gray-400 hover:text-gray-600">
                            <Edit2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
                <div className="p-5 space-y-3">
                    {editingNotes ? (
                        <div className="space-y-3">
                            <textarea
                                placeholder="Internal notes (customer won't see this)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setEditingNotes(false);
                                        setNotes(order.notes || "");
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNotes}
                                    disabled={notesLoading}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {notesLoading ? "Saving…" : <><Save className="w-3 h-3" /> Save</>}
                                </button>
                            </div>
                        </div>
                    ) : order.notes ? (
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                    ) : (
                        <p className="text-[13px] text-gray-400 italic">No internal notes.</p>
                    )}
                    {notesToast && <Toast {...notesToast} />}
                </div>
            </div>
        </div>
    );
}
