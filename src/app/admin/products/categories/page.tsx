"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Loader2, Save, X, HelpCircle, Upload, Image as ImageIcon } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
    image: string | null;
    description: string | null;
    filter_layout: string | null;
    sort_order: number;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState("");
    const [editSlug, setEditSlug] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editFilterLayout, setEditFilterLayout] = useState("sidebar");
    const [editImage, setEditImage] = useState("");
    
    const [isAdding, setIsAdding] = useState(false);
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newFilterLayout, setNewFilterLayout] = useState("sidebar");
    const [newImage, setNewImage] = useState("");
    
    const [uploading, setUploading] = useState(false);
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

    const handleImageUpload = async (file: File, isEdit: boolean) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);
            
            const res = await fetch("/api/admin/cms/categories", {
                method: "POST",
                body: formData,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to upload image");
            
            if (isEdit) {
                setEditImage(json.imageUrl);
            } else {
                setNewImage(json.imageUrl);
            }
        } catch (err) {
            console.error("Upload error:", err);
            alert("Failed to upload image. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        const slug = newSlug.trim() || generateSlug(newName);
        const { error } = await supabase.from("categories").insert({
            name: newName.trim(),
            slug,
            description: newDescription.trim() || null,
            image: newImage || null,
            image_url: newImage || null,
            filter_layout: newFilterLayout,
            sort_order: categories.length,
        });
        if (!error) {
            setNewName("");
            setNewSlug("");
            setNewDescription("");
            setNewImage("");
            setNewFilterLayout("sidebar");
            setIsAdding(false);
            await fetchCategories();
        } else {
            console.error("Error inserting category:", error);
            alert("Error creating category: " + error.message);
        }
        setSaving(false);
    };

    const handleEdit = async (id: string) => {
        if (!editName.trim()) return;
        setSaving(true);
        const slug = editSlug.trim() || generateSlug(editName);
        const { error } = await supabase.from("categories").update({ 
            name: editName.trim(), 
            slug,
            description: editDescription.trim() || null,
            image: editImage || null,
            image_url: editImage || null,
            filter_layout: editFilterLayout,
        }).eq("id", id);
        if (!error) {
            setEditingId(null);
            await fetchCategories();
        } else {
            console.error("Error updating category:", error);
            alert("Error updating category: " + error.message);
        }
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
        setEditDescription(cat.description || "");
        setEditFilterLayout(cat.filter_layout || "sidebar");
        setEditImage(cat.image || cat.image_url || "");
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
                    onClick={() => { setIsAdding(true); setNewName(""); setNewSlug(""); setNewDescription(""); setNewImage(""); setNewFilterLayout("sidebar"); }}
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
                        Categories group similar products together (e.g., Textiles, Ceramics, Bedding).
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
                        {/* Add New Row Form */}
                        {isAdding && (
                            <div className="px-5 py-6 bg-green-50/20 border-b border-gray-150 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-gray-700">Category Name</label>
                                        <input
                                            type="text"
                                            placeholder="Category Name"
                                            value={newName}
                                            onChange={(e) => { setNewName(e.target.value); setNewSlug(generateSlug(e.target.value)); }}
                                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none bg-white"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-gray-700">Slug</label>
                                        <input
                                            type="text"
                                            placeholder="Slug (auto-generated)"
                                            value={newSlug}
                                            onChange={(e) => setNewSlug(e.target.value)}
                                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none text-gray-500 bg-white"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-gray-700">Description</label>
                                        <textarea
                                            placeholder="Brief description of this category..."
                                            value={newDescription}
                                            onChange={(e) => setNewDescription(e.target.value)}
                                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none bg-white"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-gray-700">Storefront Filter Layout</label>
                                        <select
                                            value={newFilterLayout}
                                            onChange={(e) => setNewFilterLayout(e.target.value)}
                                            className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none bg-white"
                                        >
                                            <option value="sidebar">Filter on Sidebar (Textile Design)</option>
                                            <option value="top">Filter on Top Select (Ceramics Design)</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-gray-700">Category Image</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageUpload(file, false);
                                                }}
                                                className="hidden"
                                                id="new-image-upload"
                                            />
                                            <label
                                                htmlFor="new-image-upload"
                                                className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                                            >
                                                <Upload className="w-3.5 h-3.5" />
                                                {uploading ? "Uploading..." : "Upload Image"}
                                            </label>
                                            {newImage && (
                                                <div className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                                    <img src={newImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <button onClick={handleAdd} disabled={saving || uploading} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm">
                                        <Save className="h-4 w-4" />
                                        Create Category
                                    </button>
                                    <button onClick={() => setIsAdding(false)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                        <X className="h-4 w-4" />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Existing Categories */}
                        {categories.map((cat, idx) => (
                            <div key={cat.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-gray-50/50 transition-colors group">
                                {editingId === cat.id ? (
                                    <div className="w-full py-2 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-gray-700">Category Name</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => { setEditName(e.target.value); setEditSlug(generateSlug(e.target.value)); }}
                                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none bg-white"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-gray-700">Slug</label>
                                                <input
                                                    type="text"
                                                    value={editSlug}
                                                    onChange={(e) => setEditSlug(e.target.value)}
                                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none text-gray-500 bg-white"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1 md:col-span-2">
                                                <label className="text-xs font-semibold text-gray-700">Description</label>
                                                <textarea
                                                    value={editDescription}
                                                    onChange={(e) => setEditDescription(e.target.value)}
                                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none bg-white"
                                                    rows={2}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-gray-700">Storefront Filter Layout</label>
                                                <select
                                                    value={editFilterLayout}
                                                    onChange={(e) => setEditFilterLayout(e.target.value)}
                                                    className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-accent/30 outline-none bg-white"
                                                >
                                                    <option value="sidebar">Filter on Sidebar (Textile Design)</option>
                                                    <option value="top">Filter on Top Select (Ceramics Design)</option>
                                                </select>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="text-xs font-semibold text-gray-700">Category Image</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) handleImageUpload(file, true);
                                                        }}
                                                        className="hidden"
                                                        id="edit-image-upload"
                                                    />
                                                    <label
                                                        htmlFor="edit-image-upload"
                                                        className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                                                    >
                                                        <Upload className="w-3.5 h-3.5" />
                                                        {uploading ? "Uploading..." : "Upload Image"}
                                                    </label>
                                                    {editImage && (
                                                        <div className="relative w-10 h-10 rounded border border-gray-200 overflow-hidden flex-shrink-0 shadow-sm">
                                                            <img src={editImage} alt="Uploaded preview" className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pt-2">
                                            <button onClick={() => handleEdit(cat.id)} disabled={saving || uploading} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm">
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                                                <X className="h-4 w-4" />
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 w-full">
                                        <span className="text-xs text-gray-400 w-6 text-center font-mono">{idx + 1}</span>
                                        
                                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
                                            {(cat.image || cat.image_url) ? (
                                                <img src={cat.image || cat.image_url || ""} alt={cat.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-gray-300" />
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{cat.name}</p>
                                            <p className="text-xs text-gray-400 truncate">/{cat.slug}</p>
                                            {cat.description && (
                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cat.description}</p>
                                            )}
                                        </div>

                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${cat.filter_layout === "top" ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}>
                                            {cat.filter_layout === "top" ? "Top Filter" : "Sidebar Filter"}
                                        </span>

                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(cat)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            {deleteConfirm === cat.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => handleDelete(cat.id)} className="px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">
                                                        Delete
                                                    </button>
                                                    <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteConfirm(cat.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
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
