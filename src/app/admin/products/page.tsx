"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import {
    Plus, Search, SlidersHorizontal, Trash2, Pencil, ExternalLink,
    Eye, EyeOff, ChevronDown, Package, AlertTriangle, Loader2, X
} from "lucide-react";

/* ─── Types ─── */
interface ProductVariant {
    id: string;
    color_name: string;
    color_hex: string;
    price: number;
    original_price: number | null;
    stock: number;
    is_default: boolean;
    variant_images: { image_url: string; is_primary: boolean }[];
}

interface Product {
    id: string;
    name: string;
    slug: string;
    sell_mode: "meter" | "quantity";
    fabric: string | null;
    width: string | null;
    is_active: boolean;
    is_featured: boolean;
    is_new_arrival: boolean;
    created_at: string;
    categories: { name: string } | null;
    product_variants: ProductVariant[];
}

/* ─── Helpers ─── */
function getThumbnail(variants: ProductVariant[]): string {
    const def = variants.find((v) => v.is_default) || variants[0];
    if (!def) return "";
    const primary = def.variant_images?.find((i) => i.is_primary);
    return primary?.image_url || def.variant_images?.[0]?.image_url || "";
}

function getPriceRange(variants: ProductVariant[]): string {
    if (!variants.length) return "—";
    const prices = variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₹${min}` : `₹${min} – ₹${max}`;
}

function getStockInfo(variants: ProductVariant[]): { label: string; cls: string; total: number } {
    if (!variants.length) return { label: "No variants", cls: "text-gray-400", total: 0 };
    const total = variants.reduce((s, v) => s + v.stock, 0);
    if (total === 0) return { label: "Out of stock", cls: "text-red-500", total };
    if (total < 20) return { label: "Low stock", cls: "text-amber-500", total };
    return { label: "In stock", cls: "text-emerald-500", total };
}

/* ─── Component ─── */
export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [modeFilter, setModeFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const fetchProducts = async () => {
        setLoading(true);
        const { data } = await supabase.from("products").select(`
            id, name, slug, sell_mode, fabric, width, is_active, is_featured, is_new_arrival, created_at,
            categories ( name ),
            product_variants (
                id, color_name, color_hex, price, original_price, stock, is_default,
                variant_images ( image_url, is_primary )
            )
        `).order("sort_order", { ascending: true });
        if (data) setProducts(data as unknown as Product[]);
        setLoading(false);
    };

    useEffect(() => {
        fetchProducts();
        supabase.from("categories").select("id, name").order("sort_order").then(({ data }) => {
            if (data) setCategories(data);
        });
    }, []);

    const toggleActive = async (id: string, current: boolean) => {
        setTogglingId(id);
        await supabase.from("products").update({ is_active: !current }).eq("id", id);
        setProducts((p) => p.map((x) => (x.id === id ? { ...x, is_active: !current } : x)));
        setTogglingId(null);
    };

    const deleteProduct = async (id: string) => {
        const { data: vs } = await supabase.from("product_variants").select("id").eq("product_id", id);
        if (vs?.length) {
            await supabase.from("variant_images").delete().in("variant_id", vs.map((v) => v.id));
            await supabase.from("product_variants").delete().eq("product_id", id);
        }
        await supabase.from("products").delete().eq("id", id);
        setProducts((p) => p.filter((x) => x.id !== id));
        setDeleteId(null);
    };

    const filtered = useMemo(() => {
        return products.filter((p) => {
            if (search) {
                const q = search.toLowerCase();
                if (!p.name.toLowerCase().includes(q) && !p.product_variants.some((v) => v.color_name.toLowerCase().includes(q))) return false;
            }
            if (catFilter !== "all" && p.categories?.name !== catFilter) return false;
            if (modeFilter !== "all" && p.sell_mode !== modeFilter) return false;
            if (statusFilter === "active" && !p.is_active) return false;
            if (statusFilter === "draft" && p.is_active) return false;
            return true;
        });
    }, [products, search, catFilter, modeFilter, statusFilter]);

    const activeFilters = [catFilter !== "all", modeFilter !== "all", statusFilter !== "all"].filter(Boolean).length;

    return (
        <div>
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Products</h1>
                    <p className="text-[13px] text-gray-400 mt-0.5">{products.length} products</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/products/categories" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <Package className="h-3.5 w-3.5" /> Categories
                    </Link>
                    <Link href="/admin/products/new" className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors">
                        <Plus className="h-3.5 w-3.5" /> New Product
                    </Link>
                </div>
            </div>

            {/* ─── Search + Filters ─── */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                    <input
                        type="text" placeholder="Search by name or color..." value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-[13px] bg-white border border-gray-200 rounded-lg placeholder:text-gray-300 focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300 outline-none transition-all"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border rounded-lg transition-colors ${showFilters || activeFilters > 0 ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                        }`}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters{activeFilters > 0 && <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-white text-gray-900 rounded-full">{activeFilters}</span>}
                </button>
            </div>

            {showFilters && (
                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                    <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="px-2.5 py-2 text-[13px] border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-gray-900/10">
                        <option value="all">All Categories</option>
                        {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="px-2.5 py-2 text-[13px] border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-gray-900/10">
                        <option value="all">All Modes</option>
                        <option value="meter">Per Meter</option>
                        <option value="quantity">Per Piece</option>
                    </select>
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2.5 py-2 text-[13px] border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-gray-900/10">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                    </select>
                </div>
            )}

            {/* ─── Product Cards ─── */}
            {loading ? (
                <div className="flex items-center justify-center py-20"><Loader2 className="h-5 w-5 animate-spin text-gray-300" /></div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                    <Package className="h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No products found</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {filtered.map((product, idx) => {
                        const thumb = getThumbnail(product.product_variants);
                        const price = getPriceRange(product.product_variants);
                        const stock = getStockInfo(product.product_variants);

                        return (
                            <div key={product.id} className={`flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50/60 transition-colors group ${idx > 0 ? "border-t border-gray-100" : ""}`}>
                                {/* Thumbnail */}
                                <div className="w-11 h-11 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {thumb ? (
                                        <Image src={thumb} alt={product.name} width={44} height={44} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-gray-300" /></div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-[13px] font-semibold text-gray-900 truncate">{product.name}</p>
                                        {!product.is_active && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">Draft</span>}
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <span className="text-[12px] text-gray-400">{product.categories?.name || "Uncategorized"}</span>
                                        <span className="text-[12px] text-gray-300">·</span>
                                        <span className="text-[12px] text-gray-400">{product.sell_mode === "meter" ? "Per Meter" : "Per Piece"}</span>
                                    </div>
                                </div>

                                {/* Color Swatches */}
                                <div className="hidden md:flex items-center gap-1 flex-shrink-0">
                                    {product.product_variants.slice(0, 5).map((v) => (
                                        <div key={v.id} title={v.color_name} className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: v.color_hex || "#ccc" }} />
                                    ))}
                                    {product.product_variants.length > 5 && (
                                        <span className="text-[11px] text-gray-400 ml-0.5">+{product.product_variants.length - 5}</span>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="hidden sm:block flex-shrink-0 text-right w-28">
                                    <p className="text-[13px] font-semibold text-gray-900">{price}</p>
                                    <p className={`text-[11px] font-medium flex items-center justify-end gap-1 ${stock.cls}`}>
                                        {stock.label === "Low stock" && <AlertTriangle className="h-3 w-3" />}
                                        {stock.total} {product.sell_mode === "meter" ? "m" : "pcs"}
                                    </p>
                                </div>

                                {/* Status Toggle */}
                                <button
                                    onClick={() => toggleActive(product.id, product.is_active)}
                                    disabled={togglingId === product.id}
                                    className={`flex-shrink-0 w-9 h-5 rounded-full relative transition-colors ${product.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                                >
                                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${product.is_active ? "left-[18px]" : "left-0.5"}`} />
                                </button>

                                {/* Actions */}
                                <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Link href={`/shop/${product.slug}`} target="_blank" title="View on store" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Link>
                                    <Link href={`/admin/products/${product.id}/edit`} title="Edit product" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors">
                                        <Pencil className="h-3.5 w-3.5" />
                                    </Link>
                                    {deleteId === product.id ? (
                                        <div className="flex items-center gap-1 ml-1">
                                            <button onClick={() => deleteProduct(product.id)} className="px-2 py-1 text-[11px] font-medium text-white bg-red-500 rounded hover:bg-red-600">Delete</button>
                                            <button onClick={() => setDeleteId(null)} className="px-2 py-1 text-[11px] font-medium text-gray-500 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => setDeleteId(product.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors">
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
