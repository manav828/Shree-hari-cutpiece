"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { 
    Loader2, Search, Star, Trash2, Plus, X, Eye, EyeOff, 
    Check, ImageIcon, Video, Filter, ChevronLeft, ChevronRight,
    Pencil
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Product {
    id: string;
    name: string;
    slug: string;
}

interface Review {
    id: string;
    product_id: string;
    user_name: string;
    rating: number;
    comment_text: string;
    images?: string[];
    video_url?: string | null;
    is_visible: boolean;
    created_at: string;
    products: { id: string; name: string; slug: string } | null;
}

function SearchableProductSelect({
    products,
    selectedId,
    onChange,
    placeholder = "Search product...",
    showAllOption = false
}: {
    products: Product[];
    selectedId: string;
    onChange: (id: string) => void;
    placeholder?: string;
    showAllOption?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");

    const selectedProduct = products.find(p => p.id === selectedId);
    const displayValue = selectedId === "all" && showAllOption
        ? "All Products"
        : selectedProduct ? selectedProduct.name : "Choose a product...";

    const filtered = useMemo(() => {
        return products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }, [products, search]);

    return (
        <div className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 text-left text-gray-750"
            >
                <span className="truncate">{displayValue}</span>
                <span className="text-xs text-gray-400">▼</span>
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 flex flex-col">
                        <div className="p-2 border-b border-gray-100 flex-shrink-0">
                            <input
                                type="text"
                                placeholder={placeholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                                autoFocus
                            />
                        </div>
                        <div className="overflow-y-auto flex-1 py-1">
                            {showAllOption && (
                                <button
                                    type="button"
                                    onClick={() => { onChange("all"); setIsOpen(false); setSearch(""); }}
                                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between ${selectedId === "all" ? "bg-blue-50 text-blue-700 font-semibold" : ""}`}
                                >
                                    All Products
                                </button>
                            )}
                            {filtered.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-gray-400 text-center">No products found</div>
                            ) : (
                                filtered.map(p => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => { onChange(p.id); setIsOpen(false); setSearch(""); }}
                                        className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center justify-between ${selectedId === p.id ? "bg-blue-50 text-blue-700 font-semibold" : ""}`}
                                    >
                                        <span className="truncate">{p.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState("");

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [productFilter, setProductFilter] = useState("all");
    const [ratingFilter, setRatingFilter] = useState("all");
    const [visibilityFilter, setVisibilityFilter] = useState("all");

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    
    // Form state
    const [addFormProduct, setAddFormProduct] = useState("");
    const [addFormName, setAddFormName] = useState("");
    const [addFormRating, setAddFormRating] = useState(5);
    const [addFormComment, setAddFormComment] = useState("");
    const [addFormImages, setAddFormImages] = useState<File[]>([]);
    const [addFormVideo, setAddFormVideo] = useState<File | null>(null);
    const [savingReview, setSavingReview] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const limit = 15;

    const fetchAllData = async () => {
        try {
            setLoading(true);
            // Fetch reviews
            const res = await fetch("/api/admin/reviews");
            const data = await res.json();
            if (res.ok) {
                setReviews(data.reviews || []);
            }

            // Fetch products for dropdowns
            const { data: pData, error: pError } = await supabase
                .from("products")
                .select("id, name, slug")
                .eq("is_active", true)
                .order("name", { ascending: true });

            if (pError) throw pError;
            setProducts(pData || []);
        } catch (err) {
            console.error("Error fetching reviews dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    // Filter reviews
    const filteredReviews = useMemo(() => {
        return reviews.filter((review) => {
            // Search Query
            const matchesSearch = 
                review.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.comment_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (review.products?.name || "").toLowerCase().includes(searchQuery.toLowerCase());

            // Product Filter
            const matchesProduct = productFilter === "all" || review.product_id === productFilter;

            // Rating Filter
            const matchesRating = ratingFilter === "all" || review.rating === Number(ratingFilter);

            // Visibility Filter
            const matchesVisibility = 
                visibilityFilter === "all" || 
                (visibilityFilter === "visible" && review.is_visible) ||
                (visibilityFilter === "hidden" && !review.is_visible);

            return matchesSearch && matchesProduct && matchesRating && matchesVisibility;
        });
    }, [reviews, searchQuery, productFilter, ratingFilter, visibilityFilter]);

    // Paginated reviews
    const paginatedReviews = useMemo(() => {
        const start = (page - 1) * limit;
        return filteredReviews.slice(start, start + limit);
    }, [filteredReviews, page]);

    const totalPages = Math.ceil(filteredReviews.length / limit) || 1;

    // Toggle Review Visibility
    const handleToggleVisibility = async (reviewId: string, currentVisible: boolean) => {
        try {
            const res = await fetch(`/api/admin/products/any/reviews`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reviewId, isVisible: !currentVisible }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update review visibility.");
            }

            setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_visible: !currentVisible } : r));
            setToast("Visibility updated successfully.");
        } catch (err: any) {
            alert(err.message || "Failed to toggle visibility.");
        }
    };

    // Delete Review
    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to permanently delete this review?")) return;
        try {
            const res = await fetch(`/api/admin/products/any/reviews?review_id=${reviewId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to delete review.");
            }

            setReviews(prev => prev.filter(r => r.id !== reviewId));
            setToast("Review deleted successfully.");
        } catch (err: any) {
            alert(err.message || "Failed to delete review.");
        }
    };

    // Submit Curated Review
    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!addFormProduct) {
            alert("Please select a product.");
            return;
        }
        if (!addFormName.trim() || !addFormComment.trim()) {
            alert("Name and description are required.");
            return;
        }

        setSavingReview(true);
        try {
            if (editingReview) {
                const res = await fetch("/api/admin/products/any/reviews", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        reviewId: editingReview.id,
                        productId: addFormProduct,
                        userName: addFormName.trim(),
                        rating: addFormRating,
                        commentText: addFormComment.trim()
                    }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to update review.");
                }

                setToast("Review updated successfully.");
            } else {
                const formData = new FormData();
                formData.append("product_id", addFormProduct);
                formData.append("user_name", addFormName.trim());
                formData.append("rating", String(addFormRating));
                formData.append("comment_text", addFormComment.trim());
                formData.append("is_visible", "true");

                addFormImages.forEach(img => formData.append("images", img));
                if (addFormVideo) {
                    formData.append("video", addFormVideo);
                }

                const res = await fetch("/api/admin/reviews", {
                    method: "POST",
                    body: formData,
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || "Failed to submit review.");
                }

                setToast("Curated review added successfully.");
            }

            setIsAddModalOpen(false);
            setEditingReview(null);
            setAddFormProduct("");
            setAddFormName("");
            setAddFormRating(5);
            setAddFormComment("");
            setAddFormImages([]);
            setAddFormVideo(null);
            
            // Reload
            fetchAllData();
        } catch (err: any) {
            alert(err.message || "Failed to save review.");
        } finally {
            setSavingReview(false);
        }
    };

    return (
        <div className="w-full max-w-none space-y-6">
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-5 py-3 bg-gray-900 text-white rounded-xl shadow-2xl animate-fade-in">
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm font-medium">{toast}</span>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-bold font-playfair text-gray-900">Customer Reviews</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage all ratings, comments, and media uploads submitted by customers or curated by you.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingReview(null);
                        setAddFormProduct("");
                        setAddFormName("");
                        setAddFormRating(5);
                        setAddFormComment("");
                        setAddFormImages([]);
                        setAddFormVideo(null);
                        setIsAddModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all shadow-sm self-start sm:self-auto"
                >
                    <Plus className="w-4 h-4" /> Curate Review
                </button>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm items-center z-20 relative">
                {/* Search */}
                <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                        type="text"
                        placeholder="Search reviews or customers..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                    />
                </div>

                {/* Filter by Product (Searchable) */}
                <div className="w-full">
                    <SearchableProductSelect
                        products={products}
                        selectedId={productFilter}
                        onChange={(id) => { setProductFilter(id); setPage(1); }}
                        placeholder="Search products to filter..."
                        showAllOption={true}
                    />
                </div>

                {/* Filter by Rating */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <Star className="w-4 h-4 text-gray-400" />
                    <select
                        value={ratingFilter}
                        onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
                        className="w-full bg-transparent text-sm focus:outline-none cursor-pointer"
                    >
                        <option value="all">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>

                {/* Filter by Visibility */}
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
                    <Eye className="w-4 h-4 text-gray-400" />
                    <select
                        value={visibilityFilter}
                        onChange={(e) => { setVisibilityFilter(e.target.value); setPage(1); }}
                        className="w-full bg-transparent text-sm focus:outline-none cursor-pointer"
                    >
                        <option value="all">All Visibility</option>
                        <option value="visible">Shown Only</option>
                        <option value="hidden">Hidden Only</option>
                    </select>
                </div>
            </div>

            {/* List Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden z-10 relative">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                        <span>Loading customer reviews...</span>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="p-16 text-center text-gray-500">
                        <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <h3 className="font-semibold text-gray-900">No reviews found</h3>
                        <p className="text-xs mt-1 text-gray-450">Try refining your search queries or filters above.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Rating</th>
                                        <th className="px-6 py-4">Review comment</th>
                                        <th className="px-6 py-4">Media</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                                    {paginatedReviews.map((review) => (
                                        <tr key={review.id} className="hover:bg-gray-50/50">
                                            <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                                                {review.products ? (
                                                    <Link href={`/shop/${review.products.slug}`} target="_blank" className="hover:underline flex items-center gap-1.5">
                                                        {review.products.name}
                                                    </Link>
                                                ) : (
                                                    <span className="text-gray-400">Deleted Product</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{review.user_name}</div>
                                                <div className="text-xs text-gray-400">{new Date(review.created_at).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex text-amber-500">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-current" : "text-gray-200"}`} />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-[320px] whitespace-pre-wrap leading-relaxed text-gray-600">
                                                {review.comment_text}
                                            </td>
                                            <td className="px-6 py-4">
                                                {((review.images && review.images.length > 0) || review.video_url) ? (
                                                    <div className="flex gap-1.5">
                                                        {review.images?.map((url, idx) => (
                                                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded overflow-hidden border border-gray-200 bg-black block" title="View attachment">
                                                                <img src={url} alt="review image" className="w-full h-full object-cover" />
                                                            </a>
                                                        ))}
                                                        {review.video_url && (
                                                            <a href={review.video_url} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded overflow-hidden border border-gray-200 bg-black flex items-center justify-center" title="Watch video">
                                                                <Video className="w-3.5 h-3.5 text-white" />
                                                            </a>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleToggleVisibility(review.id, review.is_visible)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                                        review.is_visible 
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                                            : "bg-gray-100 text-gray-500 border border-gray-200"
                                                    }`}
                                                >
                                                    {review.is_visible ? (
                                                        <>
                                                            <Eye className="w-3 h-3" /> Shown
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3 h-3" /> Hidden
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingReview(review);
                                                            setAddFormProduct(review.product_id);
                                                            setAddFormName(review.user_name);
                                                            setAddFormRating(review.rating);
                                                            setAddFormComment(review.comment_text);
                                                            setAddFormImages([]);
                                                            setAddFormVideo(null);
                                                            setIsAddModalOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 rounded transition-colors"
                                                        title="Edit review details"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReview(review.id)}
                                                        className="p-1.5 hover:bg-red-50 text-red-500 rounded transition-colors"
                                                        title="Delete permanently"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                                <span className="text-xs text-gray-500">
                                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, filteredReviews.length)} of {filteredReviews.length} entries
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                        className="p-1.5 rounded border border-gray-200 hover:bg-white disabled:opacity-40 transition"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <button
                                        disabled={page === totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="p-1.5 rounded border border-gray-200 hover:bg-white disabled:opacity-40 transition"
                                    >
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Curate / Edit Review Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">
                                    {editingReview ? "Edit Custom Review" : "Curate Custom Review"}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {editingReview ? "Update feedback fields for this review." : "Directly inject feedback for any active product."}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingReview(null);
                                }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleAddReview} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {/* Product Selection (Searchable) */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Select Product *</label>
                                <SearchableProductSelect
                                    products={products}
                                    selectedId={addFormProduct}
                                    onChange={(id) => setAddFormProduct(id)}
                                    placeholder="Search product..."
                                    showAllOption={false}
                                />
                            </div>

                            {/* Customer Name */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Customer Name *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Ramesh Kumar"
                                    value={addFormName}
                                    onChange={(e) => setAddFormName(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                                />
                            </div>

                            {/* Rating */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Star Rating *</label>
                                <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setAddFormRating(star)}
                                            className="focus:outline-none"
                                        >
                                            <Star className={`w-7 h-7 ${star <= addFormRating ? "fill-current text-amber-500" : "text-gray-300"}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comments */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Review Comments *</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="Enter review description comments..."
                                    value={addFormComment}
                                    onChange={(e) => setAddFormComment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white resize-none"
                                />
                            </div>

                            {/* Media Upload (Only when creating new review) */}
                            {!editingReview ? (
                                <>
                                    {/* Attached Images */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Attach Images (Max 2)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files || []);
                                                if (addFormImages.length + files.length > 2) {
                                                    alert("Max 2 images allowed.");
                                                    return;
                                                }
                                                setAddFormImages(prev => [...prev, ...files]);
                                            }}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                        />
                                        {addFormImages.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {addFormImages.map((file, idx) => (
                                                    <div key={idx} className="relative w-10 h-10 rounded border bg-gray-50 flex items-center justify-center group overflow-hidden">
                                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setAddFormImages(prev => prev.filter((_, i) => i !== idx))}
                                                            className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3.5 h-3.5 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Attached Video */}
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">Attach Video (Max 1)</label>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0] || null;
                                                setAddFormVideo(file);
                                            }}
                                            className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                                        />
                                        {addFormVideo && (
                                            <div className="relative w-10 h-10 rounded border bg-gray-50 flex items-center justify-center group mt-2 overflow-hidden">
                                                <Video className="w-4 h-4 text-gray-400" />
                                                <button
                                                    type="button"
                                                    onClick={() => setAddFormVideo(null)}
                                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                // For editing mode, show current attachments info
                                ((editingReview.images && editingReview.images.length > 0) || editingReview.video_url) && (
                                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <p className="text-xs font-semibold text-gray-600 mb-2">Existing Attachments</p>
                                        <div className="flex gap-2">
                                            {editingReview.images?.map((url, idx) => (
                                                <div key={idx} className="w-10 h-10 rounded overflow-hidden border border-gray-200">
                                                    <img src={url} alt="existing" className="w-full h-full object-cover" />
                                                </div>
                                            ))}
                                            {editingReview.video_url && (
                                                <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center text-white text-[10px]">
                                                    Video
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-2">To change media files, curate a new review or delete this review and add a new one.</p>
                                    </div>
                                )
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={savingReview}
                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50 mt-4 flex-shrink-0"
                            >
                                {savingReview ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    editingReview ? "Update Review" : "Save Curated Review"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
