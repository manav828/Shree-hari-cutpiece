"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase as supabaseClient } from "@/lib/supabase";
const supabase = supabaseClient as any;
import { getThumbnailUrl } from "@/lib/imageOptimization";
import {
    Plus, Search, SlidersHorizontal, Trash2, Pencil, ExternalLink,
    Package, Loader2, ChevronLeft, ChevronRight, ChevronDown
} from "lucide-react";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";

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
    const rawUrl = primary?.image_url || def.variant_images?.[0]?.image_url || "";
    return getThumbnailUrl(rawUrl);
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
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [catSearch, setCatSearch] = useState("");
    const [catOpen, setCatOpen] = useState(false);
    const catDropdownRef = useRef<HTMLDivElement>(null);

    const fetchProducts = async () => {
        const executeFetch = async (retries = 3): Promise<any> => {
            const { data, error } = await supabase.from("products").select(`
                id, name, slug, sell_mode, fabric, width, is_active, is_featured, is_new_arrival, created_at,
                categories ( name ),
                product_variants (
                    id, color_name, color_hex, price, original_price, stock, is_default,
                    variant_images ( image_url, is_primary )
                )
            `).order("sort_order", { ascending: true });

            if (error) {
                if (error.message?.includes("AbortError") && retries > 0) {
                    console.log(`Retrying fetch due to AbortError... (${retries} retries left)`);
                    await new Promise(r => setTimeout(r, 500));
                    return executeFetch(retries - 1);
                }
                throw error;
            }
            return data;
        };

        try {
            setLoading(true);
            const data = await executeFetch(3);
            if (data) {
                setProducts(data as unknown as Product[]);
            }
        } catch (err) {
            console.error("Unexpected error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        supabase.from("categories").select("id, name").order("sort_order").then(({ data }: any) => {
            if (data) setCategories(data);
        });

        const handleClickOutside = (event: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
                setCatOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        setPage(1);
    }, [search, catFilter, modeFilter, statusFilter]);

    const toggleActive = async (id: string, current: boolean) => {
        setTogglingId(id);
        await supabase.from("products").update({ is_active: !current }).eq("id", id);
        try {
            await fetch("/api/admin/cache", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "clear" }),
            });
        } catch (cacheErr) {
            console.error("Failed to clear storefront cache:", cacheErr);
        }
        setProducts((p) => p.map((x) => (x.id === id ? { ...x, is_active: !current } : x)));
        setTogglingId(null);
    };

    const deleteProduct = async (id: string) => {
        const { data: vs } = await supabase.from("product_variants").select("id").eq("product_id", id);
        if (vs?.length) {
            await supabase.from("variant_images").delete().in("variant_id", vs.map((v: any) => v.id));
            await supabase.from("product_variants").delete().eq("product_id", id);
        }
        await supabase.from("products").delete().eq("id", id);
        try {
            await fetch("/api/admin/cache", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "clear" }),
            });
        } catch (cacheErr) {
            console.error("Failed to clear storefront cache:", cacheErr);
        }
        setProducts((p) => p.filter((x) => x.id !== id));
        setDeleteId(null);
    };

    const filtered = useMemo(() => {
        return products.filter((p) => {
            if (search) {
                const q = search.toLowerCase();
                const matchesText = p.name.toLowerCase().includes(q) || p.product_variants.some((v) => v.color_name.toLowerCase().includes(q));
                
                // Allow matching by unit terms (miter/meter/m vs pcs/piece/quantity)
                const matchesUnit = 
                    ((q === "pcs" || q === "piece" || q === "pcs item" || q === "quantity") && p.sell_mode === "quantity") ||
                    ((q === "meter" || q === "miter" || q === "mtr" || q === "m") && p.sell_mode === "meter");
                
                if (!matchesText && !matchesUnit) return false;
            }
            if (catFilter !== "all" && p.categories?.name !== catFilter) return false;
            if (modeFilter !== "all" && p.sell_mode !== modeFilter) return false;
            if (statusFilter === "active" && !p.is_active) return false;
            if (statusFilter === "draft" && p.is_active) return false;
            return true;
        });
    }, [products, search, catFilter, modeFilter, statusFilter]);

    const paginated = useMemo(() => {
        const start = (page - 1) * limit;
        return filtered.slice(start, start + limit);
    }, [filtered, page, limit]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / limit));

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
                    <Link href="/admin/products/stock" className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <SlidersHorizontal className="h-3.5 w-3.5" /> Manage Stock
                    </Link>
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 z-10" />
                    <Input
                        type="text"
                        placeholder="Search by name or color..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white"
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
                    {/* Searchable Category Filter */}
                    <div className="relative" ref={catDropdownRef}>
                        <button
                            type="button"
                            onClick={() => setCatOpen(!catOpen)}
                            className="w-full text-left rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-slate-400 flex items-center justify-between h-[38px]"
                        >
                            <span className="truncate">
                                {catFilter === "all" ? "All Categories" : catFilter}
                            </span>
                            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0 ml-1" />
                        </button>

                        {catOpen && (
                            <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-lg z-50">
                                <div className="relative mb-2">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search categories..."
                                        value={catSearch}
                                        onChange={(e) => setCatSearch(e.target.value)}
                                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white text-gray-700"
                                    />
                                </div>
                                <div className="space-y-0.5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCatFilter("all");
                                            setCatOpen(false);
                                            setCatSearch("");
                                        }}
                                        className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors ${catFilter === "all" ? "bg-gray-50 font-medium text-gray-900" : "text-gray-600"}`}
                                    >
                                        All Categories
                                    </button>
                                    {categories
                                        .filter((c) => c.name.toLowerCase().includes(catSearch.toLowerCase()))
                                        .map((c) => (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => {
                                                    setCatFilter(c.name);
                                                    setCatOpen(false);
                                                    setCatSearch("");
                                                }}
                                                className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 transition-colors ${catFilter === c.name ? "bg-gray-50 font-medium text-gray-900" : "text-gray-600"}`}
                                            >
                                                {c.name}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        )}
                    </div>
                    <Select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="bg-white">
                        <option value="all">All Sell Modes</option>
                        <option value="meter">Meter / Miter (m)</option>
                        <option value="quantity">Piece / Pcs (pcs)</option>
                    </Select>
                    <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="bg-white">
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                    </Select>
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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Table wrapperClassName="border-0 rounded-none">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 pr-0"></TableHead> {/* Thumbnail */}
                                <TableHead>Product Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Sell Mode</TableHead>
                                <TableHead className="hidden md:table-cell">Colors</TableHead>
                                <TableHead>Price Range</TableHead>
                                <TableHead>Stock Status</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.map((product) => {
                            const thumb = getThumbnail(product.product_variants);
                            const price = getPriceRange(product.product_variants);
                            const stock = getStockInfo(product.product_variants);

                            return (
                                <TableRow key={product.id} className="group">
                                    {/* Thumbnail */}
                                    <TableCell className="pr-0">
                                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                            {thumb ? (
                                                <Image src={thumb} alt={product.name} width={40} height={40} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-gray-300" /></div>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Product Name */}
                                    <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
                                            {!product.is_active && <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">Draft</span>}
                                        </div>
                                    </TableCell>

                                    {/* Category */}
                                    <TableCell className="text-gray-500">{product.categories?.name || "Uncategorized"}</TableCell>

                                    {/* Sell Mode */}
                                    <TableCell className="text-gray-500 capitalize">{product.sell_mode === "meter" ? "Per Meter" : "Per Piece"}</TableCell>

                                    {/* Colors */}
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-1">
                                            {product.product_variants.slice(0, 5).map((v) => (
                                                <div key={v.id} title={v.color_name} className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: v.color_hex || "#ccc" }} />
                                            ))}
                                            {product.product_variants.length > 5 && (
                                                <span className="text-[11px] text-gray-400 ml-0.5">+{product.product_variants.length - 5}</span>
                                            )}
                                        </div>
                                    </TableCell>

                                    {/* Price */}
                                    <TableCell className="font-medium text-gray-900">{price}</TableCell>

                                    {/* Stock */}
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className={`text-xs font-semibold ${stock.cls}`}>
                                                {stock.label}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                {stock.total} {product.sell_mode === "meter" ? "m" : "pcs"}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Status Toggle */}
                                    <TableCell>
                                        <button
                                            onClick={() => toggleActive(product.id, product.is_active)}
                                            disabled={togglingId === product.id}
                                            className={`w-9 h-5 rounded-full relative transition-colors ${product.is_active ? "bg-emerald-500" : "bg-gray-300"}`}
                                            aria-label={product.is_active ? "Deactivate product" : "Activate product"}
                                        >
                                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${product.is_active ? "left-[18px]" : "left-0.5"}`} />
                                        </button>
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/shop/${product.slug}`} target="_blank" title="View on store" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors inline-flex">
                                                <ExternalLink className="h-3.5 w-3.5" />
                                            </Link>
                                            <Link href={`/admin/products/${product.id}/edit`} title="Edit product" className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors inline-flex">
                                                <Pencil className="h-3.5 w-3.5" />
                                            </Link>
                                            {deleteId === product.id ? (
                                                <div className="flex items-center gap-1 ml-1">
                                                    <button onClick={() => deleteProduct(product.id)} className="px-2 py-1 text-[11px] font-medium text-white bg-red-500 rounded hover:bg-red-600">Delete</button>
                                                    <button onClick={() => setDeleteId(null)} className="px-2 py-1 text-[11px] font-medium text-gray-500 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                                                </div>
                                            ) : (
                                                <button onClick={() => setDeleteId(product.id)} title="Delete" className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors inline-flex">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {/* Pagination Footer */}
                <div className="px-4 py-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
                    <p className="text-[12px] text-gray-500">
                        Showing{" "}
                        <span className="font-medium text-gray-700">
                            {filtered.length > 0 ? (page - 1) * limit + 1 : 0}–
                            {Math.min(page * limit, filtered.length)}
                        </span>{" "}
                        of <span className="font-medium text-gray-700">{filtered.length}</span> products
                    </p>
                    <div className="flex items-center justify-center">
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="px-2 py-1 text-xs border border-gray-200 rounded-md bg-white text-gray-600 outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={250}>250</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                            disabled={page <= 1}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-3 py-1 text-[12px] text-gray-600 font-medium">
                            {page} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                            disabled={page >= totalPages}
                            className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
);
}
