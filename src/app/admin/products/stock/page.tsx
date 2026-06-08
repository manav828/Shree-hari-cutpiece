"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase as supabaseClient } from "@/lib/supabase";
const supabase = supabaseClient as any;
import { getThumbnailUrl } from "@/lib/imageOptimization";
import {
    ArrowLeft, Search, SlidersHorizontal, Check, RefreshCw,
    Package, Loader2, ChevronLeft, ChevronRight, AlertTriangle, XCircle, CheckCircle, Save, Plus, Minus
} from "lucide-react";
import { Input } from "@/components/admin/ui/Input";
import { Select } from "@/components/admin/ui/Select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/admin/ui/Table";

interface Variant {
    id: string;
    color_name: string;
    color_hex: string;
    sku: string | null;
    stock: number;
    place: string | null;
    variant_images: { image_url: string; is_primary: boolean }[];
    product: {
        id: string;
        name: string;
        sell_mode: "meter" | "quantity";
        categories: { id: string; name: string } | null;
    };
}

interface Category {
    id: string;
    name: string;
}

export default function StockManagement() {
    const [variants, setVariants] = useState<Variant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [stockFilter, setStockFilter] = useState("all"); // all, low, out, instock
    const [modeFilter, setModeFilter] = useState("all"); // all, meter, quantity
    const [sortBy, setSortBy] = useState("product_name_asc"); // product_name_asc, product_name_desc, stock_asc, stock_desc, place_asc, sku_asc
    
    // Tracking edit states locally per variant ID
    const [editedStates, setEditedStates] = useState<Record<string, { stock: number; place: string }>>({});
    const [savingId, setSavingId] = useState<string | null>(null);
    const [saveSuccessId, setSaveSuccessId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    const fetchStockData = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("product_variants")
                .select(`
                    id, color_name, color_hex, sku, stock, place,
                    variant_images ( image_url, is_primary ),
                    product:products (
                        id, name, sell_mode,
                        categories ( id, name )
                    )
                `);
            
            if (error) throw error;
            
            if (data) {
                setVariants(data as unknown as Variant[]);
            }

            // Reset dirty editing states on reload
            setEditedStates({});
        } catch (err) {
            console.error("Error fetching stock data:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const { data } = await supabase
            .from("categories")
            .select("id, name")
            .order("sort_order");
        if (data) setCategories(data);
    };

    useEffect(() => {
        fetchStockData();
        fetchCategories();
    }, []);

    // Helper to calculate statistics
    const stats = useMemo(() => {
        const total = variants.length;
        const low = variants.filter(v => v.stock > 0 && v.stock < 20).length;
        const out = variants.filter(v => v.stock === 0).length;
        const totalQty = variants.reduce((sum, v) => {
            const currentStock = editedStates[v.id]?.stock !== undefined ? editedStates[v.id].stock : v.stock;
            return sum + currentStock;
        }, 0);
        return { total, low, out, totalQty };
    }, [variants, editedStates]);

    const handleInputChange = (variantId: string, field: "stock" | "place", value: any) => {
        const original = variants.find(v => v.id === variantId);
        if (!original) return;

        const currentEdit = editedStates[variantId] || {
            stock: original.stock,
            place: original.place || ""
        };

        const updatedEdit = {
            ...currentEdit,
            [field]: field === "stock" ? Math.max(0, parseInt(value) || 0) : value
        };

        // If the updated values match the original variant state, remove from editedStates (clean)
        const isClean = updatedEdit.stock === original.stock && 
                        updatedEdit.place === (original.place || "");

        setEditedStates(prev => {
            const next = { ...prev };
            if (isClean) {
                delete next[variantId];
            } else {
                next[variantId] = updatedEdit;
            }
            return next;
        });
    };

    const handleAdjustStock = (variantId: string, amount: number) => {
        const original = variants.find(v => v.id === variantId);
        if (!original) return;

        const currentStock = editedStates[variantId]?.stock !== undefined 
            ? editedStates[variantId].stock 
            : original.stock;
        
        const newStock = Math.max(0, currentStock + amount);
        handleInputChange(variantId, "stock", newStock);
    };

    const handleSaveRow = async (variantId: string) => {
        const edited = editedStates[variantId];
        if (!edited) return;

        setSavingId(variantId);
        try {
            const { error } = await supabase
                .from("product_variants")
                .update({
                    stock: edited.stock,
                    place: edited.place.trim() || null
                })
                .eq("id", variantId);

            if (error) throw error;

            // Update local master state
            setVariants(prev => prev.map(v => {
                if (v.id === variantId) {
                    return {
                        ...v,
                        stock: edited.stock,
                        place: edited.place.trim() || null
                    };
                }
                return v;
            }));

            // Remove editing state
            setEditedStates(prev => {
                const next = { ...prev };
                delete next[variantId];
                return next;
            });

            // Show success micro-animation
            setSaveSuccessId(variantId);
            setTimeout(() => setSaveSuccessId(null), 2000);
        } catch (err) {
            console.error("Failed to save variant stock details:", err);
            alert("Error saving stock changes. Please try again.");
        } finally {
            setSavingId(null);
        }
    };

    // Filter and Sort
    const filteredAndSorted = useMemo(() => {
        let result = [...variants];

        // Search
        if (search) {
            const q = search.toLowerCase();
            result = result.filter(v => {
                const matchesText = 
                    v.product?.name.toLowerCase().includes(q) ||
                    (v.color_name || "").toLowerCase().includes(q) ||
                    (v.sku || "").toLowerCase().includes(q) ||
                    (v.place || "").toLowerCase().includes(q);
                
                // Allow matching by unit terms (miter/meter/m vs pcs/piece/quantity)
                const matchesUnit = 
                    ((q === "pcs" || q === "piece" || q === "pcs item" || q === "quantity") && v.product?.sell_mode === "quantity") ||
                    ((q === "meter" || q === "miter" || q === "mtr" || q === "m") && v.product?.sell_mode === "meter");
                
                return matchesText || matchesUnit;
            });
        }

        // Category Filter
        if (catFilter !== "all") {
            result = result.filter(v => v.product?.categories?.name === catFilter);
        }

        // Sell Mode Filter
        if (modeFilter !== "all") {
            result = result.filter(v => v.product?.sell_mode === modeFilter);
        }

        // Stock Status Filter
        if (stockFilter !== "all") {
            result = result.filter(v => {
                const currentStock = editedStates[v.id]?.stock !== undefined ? editedStates[v.id].stock : v.stock;
                if (stockFilter === "out") return currentStock === 0;
                if (stockFilter === "low") return currentStock > 0 && currentStock < 20;
                if (stockFilter === "instock") return currentStock >= 20;
                return true;
            });
        }

        // Sort
        result.sort((a, b) => {
            const getVal = (v: Variant, type: string) => {
                if (type === "name") return v.product?.name || "";
                if (type === "stock") return editedStates[v.id]?.stock !== undefined ? editedStates[v.id].stock : v.stock;
                if (type === "place") return editedStates[v.id]?.place !== undefined ? editedStates[v.id].place : (v.place || "");
                if (type === "sku") return v.sku || "";
                return "";
            };

            if (sortBy === "product_name_asc") return (getVal(a, "name") as string).localeCompare(getVal(b, "name") as string);
            if (sortBy === "product_name_desc") return (getVal(b, "name") as string).localeCompare(getVal(a, "name") as string);
            if (sortBy === "stock_asc") return (getVal(a, "stock") as number) - (getVal(b, "stock") as number);
            if (sortBy === "stock_desc") return (getVal(b, "stock") as number) - (getVal(a, "stock") as number);
            if (sortBy === "place_asc") return (getVal(a, "place") as string).localeCompare(getVal(b, "place") as string);
            if (sortBy === "sku_asc") return (getVal(a, "sku") as string).localeCompare(getVal(b, "sku") as string);

            return 0;
        });

        return result;
    }, [variants, search, catFilter, stockFilter, modeFilter, sortBy, editedStates]);

    // Pagination slice
    const paginated = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredAndSorted.slice(start, start + limit);
    }, [filteredAndSorted, page, limit]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / limit));

    useEffect(() => {
        setPage(1);
    }, [search, catFilter, stockFilter, modeFilter, sortBy]);

    // Helpers for rendering thumbnail and badge
    const getVariantThumbnail = (v: Variant) => {
        const primary = v.variant_images?.find(i => i.is_primary);
        const rawUrl = primary?.image_url || v.variant_images?.[0]?.image_url || "";
        return getThumbnailUrl(rawUrl);
    };

    const getStockStatusBadge = (stock: number) => {
        if (stock === 0) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded-full border border-red-200">
                    <XCircle className="h-3 w-3" /> Out of stock
                </span>
            );
        }
        if (stock < 20) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full border border-amber-200">
                    <AlertTriangle className="h-3 w-3" /> Low stock
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                <CheckCircle className="h-3 w-3" /> In stock
            </span>
        );
    };

    const hasActiveFilters = catFilter !== "all" || stockFilter !== "all" || modeFilter !== "all";

    return (
        <div className="w-full">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Link href="/admin/products" className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Stock Management</h1>
                    <p className="text-xs text-gray-400 mt-0.5">Edit variant inventory quantities and physical shelf placements</p>
                </div>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                        <Package className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Variants</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.total}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg animate-pulse-subtle">
                        <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Low Stock</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.low}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                        <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Out of Stock</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.out}</p>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Inventory</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{stats.totalQty}</p>
                    </div>
                </div>
            </div>

            {/* Filter toolbar */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300 z-10" />
                    <Input
                        type="text"
                        placeholder="Search by product, color, SKU, shelf place..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-white"
                    />
                </div>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border rounded-lg transition-all ${
                        showFilters || hasActiveFilters 
                            ? "bg-gray-900 text-white border-gray-900" 
                            : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
                    }`}
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-white text-gray-900 rounded-full">
                            { (catFilter !== "all" ? 1 : 0) + (stockFilter !== "all" ? 1 : 0) + (modeFilter !== "all" ? 1 : 0) }
                        </span>
                    )}
                </button>
                <button
                    onClick={fetchStockData}
                    title="Reload data"
                    className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                </button>
            </div>

            {/* Expanded Filters Drawer */}
            {showFilters && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm animate-slide-down">
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category</label>
                        <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="bg-white">
                            <option value="all">All Categories</option>
                            {categories.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Stock Level</label>
                        <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="bg-white">
                            <option value="all">All Levels</option>
                            <option value="instock">In Stock (&gt;= 20)</option>
                            <option value="low">Low Stock (&lt; 20)</option>
                            <option value="out">Out of Stock (0)</option>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Selling Unit</label>
                        <Select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} className="bg-white">
                            <option value="all">All Units</option>
                            <option value="meter">Meter / Miter (m)</option>
                            <option value="quantity">Piece / Pcs (pcs)</option>
                        </Select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Sort By</label>
                        <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-white">
                            <option value="product_name_asc">Product Name (A-Z)</option>
                            <option value="product_name_desc">Product Name (Z-A)</option>
                            <option value="stock_asc">Stock Level (Low to High)</option>
                            <option value="stock_desc">Stock Level (High to Low)</option>
                            <option value="place_asc">Shelf Place (A-Z)</option>
                            <option value="sku_asc">SKU (A-Z)</option>
                        </Select>
                    </div>
                </div>
            )}

            {/* Unsaved changes banner */}
            {Object.keys(editedStates).length > 0 && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded-xl mb-4 flex items-center justify-between shadow-sm animate-pulse-subtle">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <span className="text-xs font-semibold">You have {Object.keys(editedStates).length} variant(s) with unsaved changes.</span>
                    </div>
                    <button 
                        onClick={fetchStockData} 
                        className="text-xs font-bold underline text-blue-600 hover:text-blue-800"
                    >
                        Reset Changes
                    </button>
                </div>
            )}

            {/* List Table */}
            {loading && variants.length === 0 ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-slate-200">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    <span className="ml-2 text-sm text-gray-400 font-medium">Loading stock data...</span>
                </div>
            ) : paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <Package className="h-10 w-10 text-gray-200 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">No stock items found</p>
                    <p className="text-xs text-gray-400 mt-0.5">Try adjusting your filters or search query</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <Table wrapperClassName="border-0 rounded-none">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12 pr-0"></TableHead>
                                <TableHead>Product Name</TableHead>
                                <TableHead className="hidden md:table-cell">Category</TableHead>
                                <TableHead>Color Variant</TableHead>
                                <TableHead className="hidden sm:table-cell">SKU</TableHead>
                                <TableHead className="w-48">Stock Qty</TableHead>
                                <TableHead className="w-40">Place / Shelf</TableHead>
                                <TableHead>Stock Status</TableHead>
                                <TableHead className="text-right w-24">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginated.map((variant) => {
                                const thumb = getVariantThumbnail(variant);
                                const isDirty = editedStates[variant.id] !== undefined;
                                const isSaving = savingId === variant.id;
                                const isSuccess = saveSuccessId === variant.id;

                                const currentStock = isDirty 
                                    ? editedStates[variant.id].stock 
                                    : variant.stock;
                                const currentPlace = isDirty 
                                    ? editedStates[variant.id].place 
                                    : (variant.place || "");

                                return (
                                    <TableRow 
                                        key={variant.id} 
                                        className={`group transition-all ${isDirty ? "bg-blue-50/20" : ""}`}
                                    >
                                        {/* Thumbnail */}
                                        <TableCell className="pr-0">
                                            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 relative">
                                                {thumb ? (
                                                    <Image src={thumb} alt={variant.product?.name || ""} width={40} height={40} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Package className="h-4 w-4 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Product Name */}
                                        <TableCell className="font-semibold text-gray-900 whitespace-nowrap">
                                            {variant.product ? (
                                                <Link 
                                                    href={`/admin/products/${variant.product.id}/edit`}
                                                    className="hover:underline flex flex-col text-slate-900"
                                                >
                                                    <span className="truncate max-w-[200px] sm:max-w-xs">{variant.product.name}</span>
                                                    <span className="text-[9px] text-gray-400 font-normal capitalize">
                                                        Mode: {variant.product.sell_mode === "meter" ? "Per Meter" : "Per Piece"}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">Orphaned Variant</span>
                                            )}
                                        </TableCell>

                                        {/* Category */}
                                        <TableCell className="text-gray-500 hidden md:table-cell">
                                            {variant.product?.categories?.name || "Uncategorized"}
                                        </TableCell>

                                        {/* Color Variant */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-4 h-4 rounded-full border border-gray-200" 
                                                    style={{ backgroundColor: variant.color_hex || "#ccc" }} 
                                                />
                                                <span className="text-xs font-medium text-slate-700">
                                                    {variant.color_name || "Default"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* SKU */}
                                        <TableCell className="font-mono text-xs text-gray-500 hidden sm:table-cell">
                                            {variant.sku || "—"}
                                        </TableCell>

                                        {/* Stock Qty input */}
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdjustStock(variant.id, -1)}
                                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                                                    disabled={isSaving}
                                                    aria-label="Decrease stock"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={currentStock}
                                                    onChange={(e) => handleInputChange(variant.id, "stock", e.target.value)}
                                                    disabled={isSaving}
                                                    className="w-16 text-center px-1.5 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 font-semibold bg-white"
                                                    min="0"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleAdjustStock(variant.id, 1)}
                                                    className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                                                    disabled={isSaving}
                                                    aria-label="Increase stock"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                                <span className="text-[10px] text-gray-400 ml-1 select-none">
                                                    {variant.product?.sell_mode === "meter" ? "m" : "pcs"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Place input */}
                                        <TableCell>
                                            <input
                                                type="text"
                                                value={currentPlace}
                                                onChange={(e) => handleInputChange(variant.id, "place", e.target.value)}
                                                disabled={isSaving}
                                                placeholder="e.g. Shelf A-1"
                                                className="w-full px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-400 bg-white"
                                            />
                                        </TableCell>

                                        {/* Stock Status Badge */}
                                        <TableCell>
                                            {getStockStatusBadge(currentStock)}
                                        </TableCell>

                                        {/* Save Action */}
                                        <TableCell className="text-right">
                                            {isSuccess ? (
                                                <span className="inline-flex items-center gap-0.5 text-xs text-emerald-600 font-bold px-2 py-1 rounded bg-emerald-50 border border-emerald-100">
                                                    <Check className="h-3.5 w-3.5" /> Saved
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => handleSaveRow(variant.id)}
                                                    disabled={!isDirty || isSaving}
                                                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                                                        isDirty 
                                                            ? "bg-blue-600 border-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                            : "bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed"
                                                    }`}
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className="h-3 w-3 animate-spin text-white" />
                                                    ) : (
                                                        <Save className="h-3 w-3" />
                                                    )}
                                                    Save
                                                </button>
                                            )}
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
                                {filteredAndSorted.length > 0 ? (page - 1) * limit + 1 : 0}–
                                {Math.min(page * limit, filteredAndSorted.length)}
                            </span>{" "}
                            of <span className="font-medium text-gray-700">{filteredAndSorted.length}</span> variants
                        </p>
                        
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-[11px] text-gray-400">Rows per page:</span>
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

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slide-down {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .animate-slide-down {
                    animation: slide-down 0.2s ease-out;
                }
            ` }} />
        </div>
    );
}
