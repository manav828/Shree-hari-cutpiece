"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Pencil, Plus, Save, Trash2, X } from "lucide-react";

type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    sort_order: number;
    is_active: boolean;
};

type Draft = {
    id?: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    is_active: boolean;
};

function toSlug(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export default function CategoriesManager() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [createOpen, setCreateOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [draft, setDraft] = useState<Draft>({
        name: "",
        slug: "",
        description: "",
        image: "",
        is_active: true,
    });

    const load = async () => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/cms/categories", { cache: "no-store" });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load categories");
            setCategories(json.categories || []);
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to load categories";
            setMessage({ type: "error", text });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const sorted = useMemo(
        () => [...categories].sort((a, b) => a.sort_order - b.sort_order),
        [categories],
    );

    const resetDraft = () => {
        setDraft({ name: "", slug: "", description: "", image: "", is_active: true });
    };

    const startEdit = (c: Category) => {
        setEditId(c.id);
        setCreateOpen(false);
        setDraft({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || "",
            image: c.image || "",
            is_active: c.is_active,
        });
    };

    const saveCreate = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/cms/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: draft.name,
                    slug: draft.slug,
                    description: draft.description,
                    image: draft.image,
                    is_active: draft.is_active,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to create category");
            setMessage({ type: "success", text: "Category created." });
            setCreateOpen(false);
            resetDraft();
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to create category";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const saveEdit = async () => {
        if (!draft.id) return;
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch("/api/admin/cms/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: draft.id,
                    name: draft.name,
                    slug: draft.slug,
                    description: draft.description,
                    image: draft.image,
                    is_active: draft.is_active,
                }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to update category");
            setMessage({ type: "success", text: "Category updated." });
            setEditId(null);
            resetDraft();
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to update category";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const softDelete = async (id: string) => {
        const ok = window.confirm("Soft-delete this category?");
        if (!ok) return;
        setSaving(true);
        try {
            const res = await fetch("/api/admin/cms/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "soft-delete", id }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to delete category");
            setMessage({ type: "success", text: "Category soft-deleted." });
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to delete category";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const reorder = async (sourceId: string, targetId: string) => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/cms/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reorder", sourceId, targetId }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to reorder category");
            await load();
        } catch (err: unknown) {
            const text = err instanceof Error ? err.message : "Failed to reorder category";
            setMessage({ type: "error", text });
        } finally {
            setSaving(false);
        }
    };

    const openCreate = () => {
        setEditId(null);
        resetDraft();
        setCreateOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
                    <p className="text-sm text-gray-500">Manage category content, order, and visibility.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium"
                >
                    <Plus className="w-4 h-4" />
                    Add Category
                </button>
            </div>

            {message ? (
                <div className={`rounded-lg px-4 py-3 text-sm border ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                    {message.text}
                </div>
            ) : null}

            {(createOpen || editId) ? (
                <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            value={draft.name}
                            onChange={(e) => {
                                const name = e.target.value;
                                setDraft((prev) => ({ ...prev, name, slug: toSlug(name) }));
                            }}
                            placeholder="Category name"
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />
                        <input
                            value={draft.slug}
                            onChange={(e) => setDraft((prev) => ({ ...prev, slug: toSlug(e.target.value) }))}
                            placeholder="slug"
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm"
                        />
                        <textarea
                            value={draft.description}
                            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Description"
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm md:col-span-2"
                            rows={3}
                        />
                        <input
                            value={draft.image}
                            onChange={(e) => setDraft((prev) => ({ ...prev, image: e.target.value }))}
                            placeholder="Image URL"
                            className="px-3 py-2 rounded-md border border-gray-300 text-sm md:col-span-2"
                        />
                    </div>

                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <input
                            type="checkbox"
                            checked={draft.is_active}
                            onChange={(e) => setDraft((prev) => ({ ...prev, is_active: e.target.checked }))}
                        />
                        Active on storefront
                    </label>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={editId ? saveEdit : saveCreate}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium disabled:opacity-60"
                        >
                            <Save className="w-4 h-4" />
                            {editId ? "Save Changes" : "Create Category"}
                        </button>
                        <button
                            onClick={() => {
                                setCreateOpen(false);
                                setEditId(null);
                                resetDraft();
                            }}
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700"
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                    </div>
                </div>
            ) : null}

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-sm text-gray-500">Loading categories...</div>
                ) : sorted.length === 0 ? (
                    <div className="p-8 text-sm text-gray-500">No categories found.</div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {sorted.map((c, idx) => (
                            <div key={c.id} className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                    {c.image ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" /> : null}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                                    <p className="text-xs text-gray-500 truncate">/{c.slug}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded ${c.is_active ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                                    {c.is_active ? "Active" : "Inactive"}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        disabled={idx === 0 || saving}
                                        onClick={() => reorder(c.id, sorted[idx - 1].id)}
                                        className="p-1.5 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
                                        title="Move up"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        disabled={idx === sorted.length - 1 || saving}
                                        onClick={() => reorder(c.id, sorted[idx + 1].id)}
                                        className="p-1.5 rounded border border-gray-200 text-gray-600 disabled:opacity-40"
                                        title="Move down"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => startEdit(c)}
                                        className="p-1.5 rounded border border-gray-200 text-gray-600"
                                        title="Edit"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => softDelete(c.id)}
                                        className="p-1.5 rounded border border-red-200 text-red-600"
                                        title="Soft delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
