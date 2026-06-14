"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import ProductReviews from "@/components/shop/ProductReviews";
import CartSidebar from "@/components/cart/CartSidebar";
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
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!productId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <CartSidebar />

            <Container>
                <div className="py-8 max-w-5xl mx-auto">
                    {/* Breadcrumb */}
                    <Link
                        href={`/shop/${slug}`}
                        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to {productName || "Product"}
                    </Link>

                    {/* Header */}
                    <div className="mb-8 pb-6 border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-gray-900">Customer Reviews</h1>
                        <p className="text-gray-500 text-sm mt-1">{productName}</p>

                        {totalReviews > 0 && (
                            <div className="flex items-center gap-2 mt-3">
                                <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`w-5 h-5 ${
                                                s <= Math.round(averageRating)
                                                    ? "fill-current text-amber-400"
                                                    : "text-gray-200"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-lg font-bold text-gray-900">{averageRating.toFixed(1)}</span>
                                <span className="text-gray-500 text-sm">
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
                            theme="classic"
                            fullPage={true}
                            initialStarFilter={initialStarFilter}
                        />
                    )}
                </div>
            </Container>

            <Footer />
        </div>
    );
}

export default function ClassicReviewsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
            }
        >
            <ReviewsPageContent />
        </Suspense>
    );
}
