"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Save, X, HelpCircle } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    sort_order: number;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editSlug, setEditSlug] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const fetchCategories = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("categories")
            .select("*")
            .order("sort_order", { ascending: true });
        if (data) setCategories(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        const slug = newSlug.trim() || generateSlug(newName);
        const { error } = await supabase.from("categories").insert({
            name: newName.trim(),
            slug,
            sort_order: categories.length,
        });
        if (!error) {
            setNewName("");
            setNewSlug("");
            setIsAdding(false);
            await fetchCategories();
        }
        setSaving(false);
    };

    const handleEdit = async (id: string) => {
        if (!editName.trim()) return;
        setSaving(true);
        const slug = editSlug.trim() || generateSlug(editName);
        await supabase.from("categories").update({ name: editName.trim(), slug }).eq("id", id);
        setEditingId(null);
        await fetchCategories();
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        await supabase.from("categories").delete().eq("id", id);
        setDeleteConfirm(null);
        await fetchCategories();
    };

    const startEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditName(cat.name);
        setEditSlug(cat.slug);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/products" className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-serif font-bold text-gray-900">Categories</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Organize your products into categories</p>
                </div>
                <button
                    onClick={() => { setIsAdding(true); setNewName(""); setNewSlug(""); }}
                    className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                </button>
            </div>

            {/* Help Banner */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <HelpCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-sm font-medium text-blue-800">What are Categories?</p>
                    <p className="text-xs text-blue-600 mt-0.5">
                        Categories group similar products together (e.g., Cotton, Silk, Georgette).
                        Customers can filter products by category on your shop page.
                        Each product can belong to <strong>one category</strong>.
                    </p>
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {/* Add New Row */}
                        {isAdding && (
                            <div className="flex items-center gap-3 px-5 py-4 bg-green-50/50">
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        placeholder="Category Name"
                                        value={newName}
                                        onChange={(e) => { setNewName(e.target.value); setNewSlug(generateSlug(e.target.value)); }}
                                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none"
                                        autoFocus
                                    />
                                    <input
                                        type="text"
                                        placeholder="Slug (auto-generated)"
                                        value={newSlug}
                                        onChange={(e) => setNewSlug(e.target.value)}
                                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none text-gray-500"
                                    />
                                </div>
                                <button onClick={handleAdd} disabled={saving} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                                    <Save className="h-4 w-4" />
                                </button>
                                <button onClick={() => setIsAdding(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Existing Categories */}
                        {categories.map((cat, idx) => (
                            <div key={cat.id} className="flex items-center gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                                <span className="text-xs text-gray-400 w-6 text-center font-mono">{idx + 1}</span>

                                {editingId === cat.id ? (
                                    <>
                                        <div className="flex-1 grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => { setEditName(e.target.value); setEditSlug(generateSlug(e.target.value)); }}
                                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none"
                                                autoFocus
                                            />
                                            <input
                                                type="text"
                                                value={editSlug}
                                                onChange={(e) => setEditSlug(e.target.value)}
                                                className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none text-gray-500"
                                            />
                                        </div>
                                        <button onClick={() => handleEdit(cat.id)} disabled={saving} className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors">
                                            <Save className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-900">{cat.name}</p>
                                            <p className="text-xs text-gray-400">/{cat.slug}</p>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(cat)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            {deleteConfirm === cat.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleDelete(cat.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg">
                                                        Delete
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-lg">
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}

                        {categories.length === 0 && !isAdding && (
                            <div className="flex flex-col items-center justify-center py-16">
                                <p className="text-gray-500 font-medium">No categories yet</p>
                                <p className="text-sm text-gray-400 mt-1">Click &quot;Add Category&quot; to create your first one</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
