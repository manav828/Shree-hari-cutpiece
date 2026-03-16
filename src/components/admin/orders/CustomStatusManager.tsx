"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Save, X, Tag } from "lucide-react";
import {
    createCustomStatus,
    updateCustomStatus,
    deleteCustomStatus,
} from "@/app/actions/customStatus";
import type { CustomOrderStatus } from "@/types/orders";

async function loadCustomStatuses(): Promise<CustomOrderStatus[]> {
    try {
        const res = await fetch("/api/admin/custom-statuses");
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

// Preset color palette for quick picking
const PRESET_COLORS = [
    "#f59e0b", // amber
    "#ef4444", // red
    "#22c55e", // green
    "#3b82f6", // blue
    "#6366f1", // indigo
    "#a855f7", // purple
    "#14b8a6", // teal
    "#ec4899", // pink
    "#94a3b8", // slate
    "#64748b", // gray
];

export default function CustomStatusManager() {
    const [statuses, setStatuses] = useState<CustomOrderStatus[]>([]);
    const [loading, setLoading] = useState(true);

    // New status form
    const [showAdd, setShowAdd] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newColor, setNewColor] = useState("#6366f1");
    const [addLoading, setAddLoading] = useState(false);

    // Edit
    const [editId, setEditId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [editColor, setEditColor] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [toast, setToast] = useState<string>("");

    function showMsg(msg: string) {
        setToast(msg);
        setTimeout(() => setToast(""), 2500);
    }

    async function load() {
        const data = await loadCustomStatuses();
        setStatuses(data);
        setLoading(false);
    }

    useEffect(() => { load(); }, []);

    async function handleAdd() {
        if (!newLabel.trim()) return;
        setAddLoading(true);
        const res = await createCustomStatus(newLabel.trim(), newColor);
        setAddLoading(false);
        if (res.success) {
            setNewLabel("");
            setNewColor("#6366f1");
            setShowAdd(false);
            showMsg(`Status "${newLabel}" created`);
            load();
        } else {
            showMsg(`Error: ${res.error}`);
        }
    }

    async function handleEdit(id: string) {
        if (!editLabel.trim()) return;
        setEditLoading(true);
        const res = await updateCustomStatus(id, editLabel.trim(), editColor);
        setEditLoading(false);
        if (res.success) {
            setEditId(null);
            showMsg("Status updated");
            load();
        } else {
            showMsg(`Error: ${res.error}`);
        }
    }

    async function handleDelete(id: string, label: string) {
        setDeleteLoading(id);
        const res = await deleteCustomStatus(id);
        setDeleteLoading(null);
        if (res.success) {
            showMsg(`"${label}" deleted`);
            load();
        } else {
            showMsg(`Error: ${res.error}`);
        }
    }

    function startEdit(s: CustomOrderStatus) {
        setEditId(s.id);
        setEditLabel(s.label);
        setEditColor(s.color);
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Order Statuses</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Manage custom order statuses with color coding
                        </p>
                    </div>
                </div>
                {!showAdd && (
                    <button
                        onClick={() => setShowAdd(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Status
                    </button>
                )}
            </div>

            {/* Add form */}
            {showAdd && (
                <div className="border border-indigo-200 bg-indigo-50/40 rounded-xl p-4 space-y-3">
                    <p className="text-[12px] font-semibold text-indigo-700 uppercase tracking-wider">
                        New Status
                    </p>
                    <div className="flex items-center gap-3">
                        {/* Color picker */}
                        <div className="relative flex-shrink-0">
                            <input
                                type="color"
                                value={newColor}
                                onChange={(e) => setNewColor(e.target.value)}
                                className="sr-only"
                                id="new-color-picker"
                            />
                            <label
                                htmlFor="new-color-picker"
                                className="w-8 h-8 rounded-lg border-2 border-white shadow cursor-pointer block"
                                style={{ backgroundColor: newColor }}
                                title="Pick color"
                            />
                        </div>
                        <input
                            type="text"
                            placeholder="Status label (e.g. Ready to Ship)"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
                        />
                    </div>
                    {/* Preset colors */}
                    <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setNewColor(c)}
                                className={`w-5 h-5 rounded-full border-2 transition-all ${newColor === c ? "border-gray-800 scale-110" : "border-white hover:scale-105"}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => { setShowAdd(false); setNewLabel(""); setNewColor("#6366f1"); }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <X className="w-3.5 h-3.5" />
                            Cancel
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={addLoading || !newLabel.trim()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {addLoading ? "Saving…" : <><Plus className="w-3.5 h-3.5" /> Create</>}
                        </button>
                    </div>
                </div>
            )}

            {/* Status list */}
            {loading ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-700 animate-spin" />
                </div>
            ) : statuses.length === 0 ? (
                <p className="text-[13px] text-gray-400 italic text-center py-6">
                    No statuses yet. Add one above.
                </p>
            ) : (
                <div className="divide-y divide-gray-100">
                    {statuses.map((s) => (
                        <div key={s.id} className="py-3 flex items-center gap-3">
                            {editId === s.id ? (
                                // Edit mode
                                <div className="flex-1 flex items-center gap-3">
                                    <div className="relative flex-shrink-0">
                                        <input
                                            type="color"
                                            value={editColor}
                                            onChange={(e) => setEditColor(e.target.value)}
                                            className="sr-only"
                                            id={`edit-color-${s.id}`}
                                        />
                                        <label
                                            htmlFor={`edit-color-${s.id}`}
                                            className="w-7 h-7 rounded-lg border-2 border-white shadow cursor-pointer block"
                                            style={{ backgroundColor: editColor }}
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                                        onKeyDown={(e) => { if (e.key === "Enter") handleEdit(s.id); }}
                                    />
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                            onClick={() => setEditId(null)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(s.id)}
                                            disabled={editLoading}
                                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded disabled:opacity-50"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View mode
                                <>
                                    <span
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: s.color }}
                                    />
                                    <span
                                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-medium"
                                        style={{
                                            backgroundColor: s.color + "20",
                                            color: s.color,
                                        }}
                                    >
                                        {s.label}
                                    </span>
                                    <span className="flex-1" />
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => startEdit(s)}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(s.id, s.label)}
                                            disabled={deleteLoading === s.id}
                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                        >
                                            {deleteLoading === s.id ? (
                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-red-200 border-t-red-500 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-3.5 h-3.5" />
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Inline toast */}
            {toast && (
                <div className="text-[12px] font-medium text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                    {toast}
                </div>
            )}
        </div>
    );
}
