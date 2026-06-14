"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Navbar from "@/themes/luxury/components/layout/Navbar";
import Footer from "@/themes/luxury/components/layout/Footer";
import ProductReviews from "@/components/shop/ProductReviews";
import CartSidebar from "@/themes/luxury/components/cart/CartSidebar";
import { Star, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

function ReviewsPageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params?.slug as string;
    const starsParam = searchParams?.get("stars");
    const initialStarFilter = starsParam ? parseInt(starsParam, 10) : null;

    const [productId, setProductId] = useState<string | null>(null);
    const [productName, setProductName] = useState<string>("");
    const [averageRating, setAverageRating] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!slug) return;
        async function fetchProduct() {
            const { data } = await supabase
                .from("products")
                .select("id, name")
                .eq("slug", slug)
                .single() as { data: { id: string; name: string } | null };

            if (data) {
                setProductId(data.id);
                setProductName(data.name);

                // Fetch review summary
                const res = await fetch(`/api/shop/reviews?product_id=${data.id}`);
                const json = await res.json();
                const reviews: any[] = json.reviews || [];
                setTotalReviews(reviews.length);
                if (reviews.length > 0) {
                    const avg = reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length;
                    setAverageRating(avg);
                }
            }
            setLoading(false);
        }
        fetchProduct();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
            </div>
        );
    }

    if (!productId) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black">
                <p className="text-gray-400">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Navbar />
            <CartSidebar />

            <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-16">
                <div className="max-w-4xl">
                    {/* Breadcrumb */}
                    <Link
                        href={`/shop/${slug}`}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors mb-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to {productName || "Product"}
                    </Link>

                    {/* Header */}
                    <div className="mb-12 pb-8 border-b border-gray-800">
                        <h1 className="text-4xl lg:text-5xl font-light text-white tracking-tight mb-2">
                            Customer Reviews
                        </h1>
                        <p className="text-gray-400 text-base">{productName}</p>

                        {totalReviews > 0 && (
                            <div className="flex items-center gap-4 mt-6">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`w-5 h-5 ${
                                                s <= Math.round(averageRating)
                                                    ? "fill-current text-amber-300"
                                                    : "text-gray-700"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-2xl font-light text-white">{averageRating.toFixed(1)}</span>
                                <span className="text-gray-400 text-base">
                                    out of 5 · {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                                </span>
                            </div>
                        )}

                    </div>

                    {/* Full reviews component */}
                    {productId && (
                        <ProductReviews
                            productId={productId}
                            productSlug={slug}
                            theme="luxury"
                            fullPage={true}
                            initialStarFilter={initialStarFilter}
                        />
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default function LuxuryReviewsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen bg-black">
                    <Loader2 className="w-8 h-8 animate-spin text-amber-300" />
                </div>
            }
        >
            <ReviewsPageContent />
        </Suspense>
    );
}
