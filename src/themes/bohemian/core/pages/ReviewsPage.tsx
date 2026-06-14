"use client";

import { useSearchParams, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import CartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import ProductReviews from "@/components/shop/ProductReviews";
import { Star, ArrowLeft, Loader2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { bohemianBodyFont, bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";

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
                <Loader2 className="w-8 h-8 animate-spin text-[#9f3f29]" />
            </div>
        );
    }

    if (!productId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-[#7a6f68]">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fffbf5]">
            <Navbar />
            <CartSidebar />

            <section className={`${BOHEMIAN_SITE_CONTAINER} py-12 lg:py-16`}>
                <div className="max-w-5xl mx-auto">
                    {/* Breadcrumb */}
                    <Link
                        href={`/shop/${slug}`}
                        className="inline-flex items-center gap-1.5 text-sm text-[#7a6f68] hover:text-[#1c1c19] transition-colors mb-8"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Back to {productName || "Product"}
                    </Link>

                    {/* Header */}
                    <div className="mb-12 pb-8 border-b border-[#ddc0ba]/40">
                        <h1 className={`${bohemianHeadingFont.className} text-4xl sm:text-5xl text-[#1c1c19] mb-2`}>
                            Customer Reviews
                        </h1>
                        <p className="text-[#7a6f68] text-base">{productName}</p>

                        {totalReviews > 0 && (
                            <div className="flex items-center gap-3 mt-6">
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star
                                            key={s}
                                            className={`w-5 h-5 ${
                                                s <= Math.round(averageRating)
                                                    ? "fill-current text-[#9f3f29]"
                                                    : "text-[#ddc0ba]"
                                            }`}
                                        />
                                    ))}
                                </div>
                                <span className="text-2xl font-bold text-[#1c1c19]">{averageRating.toFixed(1)}</span>
                                <span className="text-[#7a6f68] text-base">
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
                            theme="bohemian"
                            fullPage={true}
                            initialStarFilter={initialStarFilter}
                        />
                    )}
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default function BohemianReviewsPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center min-h-screen">
                    <Loader2 className="w-8 h-8 animate-spin text-[#9f3f29]" />
                </div>
            }
        >
            <ReviewsPageContent />
        </Suspense>
    );
}
