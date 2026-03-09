"use client";

import { useState } from "react";
import { updateOrderStatus, updateOrderTracking, updateOrderNotes } from "@/app/actions/order";
import { Package, Truck, StickyNote, Save, Edit2 } from "lucide-react";
import { OrderWithDetails } from "@/types/orders";

export default function OrderActions({ order }: { order: OrderWithDetails }) {
    const [statusLoading, setStatusLoading] = useState(false);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [notesLoading, setNotesLoading] = useState(false);

    const [editingTracking, setEditingTracking] = useState(false);
    const [trackingUrl, setTrackingUrl] = useState(order.tracking_url || "");

    const [editingNotes, setEditingNotes] = useState(false);
    const [notes, setNotes] = useState(order.notes || "");

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        if (!confirm(`Are you sure you want to change the order status to ${newStatus}?`)) {
            e.target.value = order.status;
            return;
        }

        setStatusLoading(true);
        const note = prompt("Optional: Add a note to this status update (e.g., 'Delayed due to weather')");

        const res = await updateOrderStatus(order.id, newStatus, note || undefined);
        setStatusLoading(false);

        if (!res.success) {
            alert(`Failed to update status: ${res.error}`);
            e.target.value = order.status;
        }
    };

    const handleSaveTracking = async () => {
        setTrackingLoading(true);
        const res = await updateOrderTracking(order.id, trackingUrl);
        setTrackingLoading(false);
        if (res.success) {
            setEditingTracking(false);
        } else {
            alert(`Failed to save tracking info: ${res.error}`);
        }
    };

    const handleSaveNotes = async () => {
        setNotesLoading(true);
        const res = await updateOrderNotes(order.id, notes);
        setNotesLoading(false);
        if (res.success) {
            setEditingNotes(false);
        } else {
            alert(`Failed to save admin notes: ${res.error}`);
        }
    };

    return (
        <div className="space-y-5">
            {/* Update Order Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    <h3 className="text-[14px] font-semibold text-gray-800">Update Status</h3>
                </div>
                <div className="p-5">
                    <select
                        defaultValue={order.status}
                        onChange={handleStatusChange}
                        disabled={statusLoading}
                        className="w-full text-sm border-gray-300 rounded-lg focus:ring-accent focus:border-accent disabled:opacity-50"
                    >
                        <option value="pending">Pending</option>
                        <option value="placed">Placed</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Tracking URL */}
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
                <div className="p-5">
                    {editingTracking ? (
                        <div className="space-y-3">
                            <input
                                type="url"
                                placeholder="https://track-url.com/123"
                                value={trackingUrl}
                                onChange={(e) => setTrackingUrl(e.target.value)}
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-accent focus:border-accent"
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
                                    {trackingLoading ? "Saving..." : <><Save className="w-3 h-3" /> Save</>}
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
                </div>
            </div>

            {/* Admin Notes */}
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
                <div className="p-5">
                    {editingNotes ? (
                        <div className="space-y-3">
                            <textarea
                                placeholder="Internal notes (customer won't see this)"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={4}
                                className="w-full text-sm border-gray-300 rounded-lg focus:ring-accent focus:border-accent resize-none"
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
                                    {notesLoading ? "Saving..." : <><Save className="w-3 h-3" /> Save</>}
                                </button>
                            </div>
                        </div>
                    ) : order.notes ? (
                        <p className="text-[13px] text-gray-700 whitespace-pre-wrap">{order.notes}</p>
                    ) : (
                        <p className="text-[13px] text-gray-400 italic">No internal notes.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
