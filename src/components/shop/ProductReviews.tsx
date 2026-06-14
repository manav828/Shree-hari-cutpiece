"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Star, Upload, X, Loader2, Image as ImageIcon, Video, CheckCircle, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Review = {
    id: string;
    user_name: string;
    rating: number;
    comment_text: string;
    images?: string[];
    video_url?: string | null;
    created_at: string;
};

type Props = {
    productId: string;
    productSlug: string;
    theme: "bohemian" | "classic" | "luxury";
    /** If true, shows all reviews with pagination (used on /shop/[slug]/reviews page) */
    fullPage?: boolean;
    /** Initial star filter when on full reviews page */
    initialStarFilter?: number | null;
};

const PREVIEW_COUNT = 8;
const PAGE_SIZE = 10;

export default function ProductReviews({ productId, productSlug, theme, fullPage = false, initialStarFilter = null }: Props) {
    const router = useRouter();
    const { user, orders, isLoading: authLoading } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loadingReviews, setLoadingReviews] = useState(true);
    const [allowUserReviews, setAllowUserReviews] = useState(false);
    const [showProductReviews, setShowProductReviews] = useState(false);
    const [settingsLoading, setSettingsLoading] = useState(true);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [starFilter, setStarFilter] = useState<number | null>(initialStarFilter);

    // Form states
    const [rating, setRating] = useState(5);
    const [commentText, setCommentText] = useState("");
    const [userName, setUserName] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    // Lightbox
    const [activeMediaIndex, setActiveMediaIndex] = useState<number | null>(null);
    const mediaScrollRef = useRef<HTMLDivElement>(null);

    const loadReviewsAndSettings = async () => {
        try {
            const settingRes = await fetch("/api/admin/settings/reviews", { cache: "no-store" });
            const settingJson = await settingRes.json();
            if (settingRes.ok) {
                setShowProductReviews(settingJson.showProductReviews ?? true);
                setAllowUserReviews(settingJson.allowUserReviews ?? true);
            }

            const reviewsRes = await fetch(`/api/shop/reviews?product_id=${productId}`);
            const reviewsJson = await reviewsRes.json();
            if (reviewsRes.ok) {
                setReviews(reviewsJson.reviews || []);
            }
        } catch (err) {
            console.error("Failed to load reviews:", err);
        } finally {
            setLoadingReviews(false);
            setSettingsLoading(false);
        }
    };

    useEffect(() => {
        loadReviewsAndSettings();
    }, [productId]);

    useEffect(() => {
        if (user?.name) setUserName(user.name);
    }, [user]);

    // Sync star filter from prop (for full page use)
    useEffect(() => {
        setStarFilter(initialStarFilter);
    }, [initialStarFilter]);

    const hasPurchased = orders.some((order) =>
        (order.status === "placed" || order.status === "confirmed" || order.status === "shipped" || order.status === "delivered") &&
        order.items.some((item) => item.product_id === productId)
    );

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (imageFiles.length + files.length > 2) {
            alert("You can upload a maximum of 2 images.");
            return;
        }
        setImageFiles((prev) => [...prev, ...files]);
    };

    const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoFile(e.target.files?.[0] || null);
    };

    const removeImageFile = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userName.trim()) { setMessage({ type: "error", text: "Please provide your name." }); return; }
        if (!commentText.trim()) { setMessage({ type: "error", text: "Please enter your review comment." }); return; }

        setSubmitting(true);
        setMessage(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const formData = new FormData();
            formData.append("product_id", productId);
            formData.append("user_name", userName.trim());
            formData.append("rating", String(rating));
            formData.append("comment_text", commentText.trim());
            imageFiles.forEach((file) => formData.append("images", file));
            if (videoFile) formData.append("video", videoFile);

            const res = await fetch("/api/shop/reviews", {
                method: "POST",
                headers: token ? { Authorization: `Bearer ${token}` } : {},
                body: formData,
            });

            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to submit review.");

            setMessage({ type: "success", text: "Review submitted successfully!" });
            setCommentText("");
            setImageFiles([]);
            setVideoFile(null);
            await loadReviewsAndSettings();
        } catch (err: any) {
            setMessage({ type: "error", text: err.message || "Failed to submit review." });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Derived data ──────────────────────────────────────────────────────────
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Star breakdown counts
    const starCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => { if (r.rating >= 1 && r.rating <= 5) starCounts[r.rating]++; });

    // All media from all reviews (for the horizontal scroll strip)
    const allMedia: { url: string; isVideo: boolean; reviewerName: string }[] = [];
    reviews.forEach((r) => {
        (r.images || []).forEach((url) => {
            if (url && url.startsWith("http")) allMedia.push({ url, isVideo: false, reviewerName: r.user_name });
        });
        if (r.video_url && r.video_url.startsWith("http")) {
            allMedia.push({ url: r.video_url, isVideo: true, reviewerName: r.user_name });
        }
    });

    // Filtered + sorted reviews
    const filteredReviews = starFilter
        ? reviews.filter((r) => r.rating === starFilter)
        : reviews;

    const displayedReviews = fullPage
        ? filteredReviews.slice(0, visibleCount)
        : filteredReviews.slice(0, PREVIEW_COUNT);

    const hasMore = fullPage && visibleCount < filteredReviews.length;

    // Theme palette
    const accent = theme === "bohemian" ? "#785900" : theme === "luxury" ? "#D4AF37" : "#EAB308";
    const starColor = `text-[${accent}]`;

    const openLightbox = (index: number) => {
        setActiveMediaIndex(index);
    };

    // ── Star filter redirect (for PDP → full reviews page) ───────────────────
    const handleStarFilterClick = (star: number) => {
        if (fullPage) {
            setStarFilter(starFilter === star ? null : star);
            setVisibleCount(PAGE_SIZE);
        } else {
            // Redirect to full reviews page with star filter
            router.push(`/shop/${productSlug}/reviews?stars=${star}`);
        }
    };

    const showReviewForm = !settingsLoading && showProductReviews && allowUserReviews;

    // If master "show reviews" is off, don't render anything
    if (!settingsLoading && !showProductReviews) return null;

    return (
        <div className="space-y-8">

            {/* ── Rating Summary ─────────────────────────────────────── */}
            {totalReviews > 0 && (
                <div className="flex flex-col sm:flex-row gap-6 p-5 bg-gray-50 rounded-xl border border-gray-100 max-w-2xl">
                    {/* Big score */}
                    <div className="flex flex-col items-center justify-center min-w-[110px]">
                        <p className="text-5xl font-bold text-gray-900 leading-none">{averageRating.toFixed(1)}</p>
                        <div className="flex mt-2">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} className="w-4 h-4" style={s <= Math.round(averageRating) ? { color: accent, fill: accent } : { color: "#e5e7eb" }} />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{totalReviews} review{totalReviews !== 1 ? "s" : ""}</p>
                    </div>

                    {/* Bar breakdown */}
                    <div className="flex-1 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                            const count = starCounts[star] || 0;
                            const pct = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                            return (
                                <button
                                    key={star}
                                    onClick={() => handleStarFilterClick(star)}
                                    className={`flex items-center gap-2.5 w-full group cursor-pointer ${!fullPage ? "hover:opacity-75" : ""}`}
                                    title={fullPage ? (starFilter === star ? "Clear filter" : `Show ${star}-star reviews`) : `View all ${star}-star reviews`}
                                >
                                    <span className="text-xs font-semibold text-gray-700 w-10 text-right shrink-0">{star} star</span>
                                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, backgroundColor: accent }}
                                        />
                                    </div>
                                    <span className="text-xs text-gray-500 w-9 shrink-0">{pct}%</span>
                                    <span className="text-xs text-gray-400 w-7 shrink-0 text-right">({count})</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Media Strip (horizontal scroll) ───────────────────── */}
            {allMedia.length > 0 && (
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Photos & Videos from customers</p>
                    <div
                        ref={mediaScrollRef}
                        className="flex gap-3 overflow-x-auto pb-2 scroll-smooth"
                        style={{ scrollbarWidth: "thin" }}
                    >
                        {allMedia.map((media, idx) => (
                            <button
                                key={`media-strip-${idx}`}
                                onClick={() => setActiveMediaIndex(idx)}
                                className="relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 hover:opacity-90 transition-opacity cursor-zoom-in"
                            >
                                {media.isVideo ? (
                                    <>
                                        <video src={media.url} className="w-full h-full object-cover" muted playsInline />
                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                            <Video className="w-5 h-5 text-white drop-shadow" />
                                        </div>
                                    </>
                                ) : (
                                    <img
                                        src={media.url}
                                        alt={`Review photo by ${media.reviewerName}`}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Star filter badge (full page) ──────────────────────── */}
            {fullPage && starFilter && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Showing:</span>
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold border" style={{ backgroundColor: `${accent}10`, borderColor: `${accent}30`, color: accent }}>
                        {starFilter} <Star className="w-3.5 h-3.5 fill-current" /> only
                        <button onClick={() => { setStarFilter(null); setVisibleCount(PAGE_SIZE); }} className="ml-1 opacity-70 hover:opacity-100">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </span>
                    <span className="text-sm text-gray-500">({filteredReviews.length} reviews)</span>
                </div>
            )}

            <div className={`grid grid-cols-1 ${showReviewForm ? "lg:grid-cols-3" : ""} gap-10`}>
                {/* ── Reviews List ──────────────────────────────────── */}
                <div className={showReviewForm ? "lg:col-span-2 space-y-5" : "space-y-5"}>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                        {fullPage ? "All Reviews" : "Top Reviews"}
                    </h3>

                    {loadingReviews ? (
                        <div className="flex items-center gap-2 py-10 text-sm text-gray-500">
                            <Loader2 className="w-5 h-5 animate-spin" /> Loading reviews...
                        </div>
                    ) : filteredReviews.length === 0 ? (
                        <div className="p-8 rounded-xl text-center border border-dashed border-gray-200 text-gray-400 text-sm">
                            {starFilter ? `No ${starFilter}-star reviews found.` : "No reviews yet. Be the first to review!"}
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4">
                                {displayedReviews.map((review) => (
                                    <article key={review.id} className="rounded-xl bg-gray-50/70 p-5 border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
                                        {/* Reviewer + date */}
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600 shrink-0">
                                                {review.user_name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-semibold text-gray-900">{review.user_name}</p>
                                                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-[9px] font-bold uppercase text-emerald-700 tracking-wide">
                                                        <CheckCircle className="w-2.5 h-2.5 fill-current" /> Verified
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 mt-0.5">
                                                    {new Date(review.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Stars */}
                                        <div className="flex items-center gap-0.5 mb-3">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className="w-4 h-4" style={s <= review.rating ? { color: accent, fill: accent } : { color: "#e5e7eb" }} />
                                            ))}
                                        </div>

                                        {/* Comment */}
                                        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{review.comment_text}</p>

                                        {/* Media thumbnails */}
                                        {((review.images && review.images.length > 0) || review.video_url) && (
                                            <div className="mt-4 flex flex-wrap gap-2">
                                                {(review.images || []).map((url, idx) => {
                                                    const globalIdx = allMedia.findIndex((m) => m.url === url);
                                                    return url && url.startsWith("http") ? (
                                                        <button
                                                            key={`${review.id}-img-${idx}`}
                                                            onClick={() => setActiveMediaIndex(globalIdx !== -1 ? globalIdx : null)}
                                                            className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity bg-gray-100 flex-shrink-0"
                                                        >
                                                            <img
                                                                src={url}
                                                                alt={`Review image by ${review.user_name}`}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                                            />
                                                        </button>
                                                    ) : null;
                                                })}
                                                {review.video_url && review.video_url.startsWith("http") && (() => {
                                                    const globalIdx = allMedia.findIndex((m) => m.url === review.video_url);
                                                    return (
                                                        <button
                                                            onClick={() => setActiveMediaIndex(globalIdx !== -1 ? globalIdx : null)}
                                                            className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-90 transition-opacity bg-black flex-shrink-0"
                                                        >
                                                            <video src={review.video_url} className="w-full h-full object-cover opacity-70" muted playsInline />
                                                            <Video className="w-5 h-5 text-white absolute inset-0 m-auto drop-shadow" />
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>

                            {/* Load more (full page) */}
                            {fullPage && hasMore && (
                                <button
                                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                                    className="w-full py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors mt-2"
                                >
                                    Load {Math.min(PAGE_SIZE, filteredReviews.length - visibleCount)} more reviews
                                </button>
                            )}

                            {/* See all (preview mode) */}
                            {!fullPage && totalReviews > PREVIEW_COUNT && (
                                <Link
                                    href={`/shop/${productSlug}/reviews`}
                                    className="flex items-center justify-center gap-2 w-full py-3 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors mt-2"
                                >
                                    See all {totalReviews} reviews <ChevronRight className="w-4 h-4" />
                                </Link>
                            )}
                        </>
                    )}
                </div>

                {/* ── Submit Review Form ──────────────────────────── */}
                <div className="lg:col-span-1">
                    {settingsLoading ? (
                        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm flex items-center justify-center py-12">
                            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                    ) : showReviewForm ? (
                        <div className="rounded-xl border border-gray-200 p-5 bg-white shadow-sm space-y-4 sticky top-6">
                            <div>
                                <h3 className="text-base font-bold uppercase tracking-wider text-gray-900">Write a Review</h3>
                                <p className="text-xs mt-1 text-gray-500">Share your honest experience.</p>
                            </div>

                            {message && (
                                <div className={`p-3 rounded-lg text-xs border ${message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-red-50 border-red-200 text-red-700"}`}>
                                    {message.text}
                                </div>
                            )}

                            {authLoading ? (
                                <div className="py-8 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                            ) : !user ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center space-y-3">
                                        <p className="text-xs text-slate-600 font-semibold">Please sign in to write a review.</p>
                                        <a href="/login" className="inline-block px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                                            Sign In
                                        </a>
                                    </div>
                                </div>
                            ) : !hasPurchased ? (
                                <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 text-center">
                                    <p className="text-xs text-rose-700 font-semibold">You must purchase this product to leave a review.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-3.5">
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Your Name</label>
                                        <input
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="Your display name"
                                            required
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Rating</label>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                                                    <Star className="h-7 w-7 transition-colors" style={star <= rating ? { color: accent, fill: accent } : { color: "#e5e7eb" }} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Review</label>
                                        <textarea
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            placeholder="Write your comments..."
                                            required
                                            rows={3}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white resize-none"
                                        />
                                    </div>

                                    {/* Images */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Photos (Max 2)</label>
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer select-none">
                                                <Upload className="w-3.5 h-3.5" /> Choose
                                                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" disabled={imageFiles.length >= 2} />
                                            </label>
                                            <span className="text-[11px] text-gray-500">{imageFiles.length}/2</span>
                                        </div>
                                        {imageFiles.length > 0 && (
                                            <div className="flex gap-2 mt-1">
                                                {imageFiles.map((file, idx) => (
                                                    <div key={idx} className="relative w-12 h-12 rounded border bg-gray-50 flex items-center justify-center group overflow-hidden">
                                                        <ImageIcon className="w-4 h-4 text-gray-400" />
                                                        <button type="button" onClick={() => removeImageFile(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <X className="w-3.5 h-3.5 text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Video */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Video (Max 1)</label>
                                        <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg text-xs font-semibold text-gray-700 cursor-pointer select-none">
                                                <Upload className="w-3.5 h-3.5" /> Choose
                                                <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
                                            </label>
                                            <span className="text-[11px] text-gray-500">{videoFile ? "1/1" : "0/1"}</span>
                                        </div>
                                        {videoFile && (
                                            <div className="relative w-12 h-12 rounded border bg-gray-50 flex items-center justify-center group mt-1 overflow-hidden">
                                                <Video className="w-4 h-4 text-gray-400" />
                                                <button type="button" onClick={() => setVideoFile(null)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <X className="w-3.5 h-3.5 text-white" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 mt-2 bg-gray-900 hover:bg-gray-800 text-white"
                                    >
                                        {submitting ? (
                                            <span className="flex items-center justify-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</span>
                                        ) : "Submit Review"}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* ── Lightbox ───────────────────────────────────────────── */}
            {activeMediaIndex !== null && allMedia[activeMediaIndex] && (
                <div
                    onClick={() => setActiveMediaIndex(null)}
                    className="fixed top-0 left-0 w-screen h-screen z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
                >
                    <button onClick={() => setActiveMediaIndex(null)} className="absolute top-4 right-4 text-white/70 hover:text-white p-2.5 z-50">
                        <X className="w-8 h-8" />
                    </button>

                    {allMedia.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMediaIndex((activeMediaIndex - 1 + allMedia.length) % allMedia.length);
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                        </button>
                    )}

                    {allMedia.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMediaIndex((activeMediaIndex + 1) % allMedia.length);
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 cursor-pointer"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                        </button>
                    )}

                    <div className="max-w-4xl max-h-[90vh] flex flex-col items-center justify-center relative select-none" onClick={(e) => e.stopPropagation()}>
                        {allMedia[activeMediaIndex].isVideo ? (
                            <video src={allMedia[activeMediaIndex].url} controls autoPlay className="max-w-full max-h-[80vh] rounded-xl shadow-2xl" />
                        ) : (
                            <img src={allMedia[activeMediaIndex].url} alt="Review media" className="max-w-full max-h-[80vh] rounded-xl shadow-2xl object-contain" />
                        )}
                        <p className="text-white/80 text-xs mt-3 bg-black/45 px-3 py-1.5 rounded-full select-none">
                            Review by {allMedia[activeMediaIndex].reviewerName} · {activeMediaIndex + 1} of {allMedia.length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
