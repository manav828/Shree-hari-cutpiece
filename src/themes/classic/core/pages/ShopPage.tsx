import { Suspense } from "react";
import Image from "next/image";
import Navbar from "@/themes/classic/components/layout/Navbar";
import Footer from "@/themes/classic/components/layout/Footer";
import Container from "@/components/ui/Container";
import ProductGrid from "@/themes/classic/components/shop/ProductGrid";
import CartSidebar from "@/themes/classic/components/cart/CartSidebar";
import ShopTopBanner from "@/themes/classic/components/shop/ShopTopBanner";

type ShopPageProps = {
    searchParams?: {
        category?: string;
    };
};

export default function ShopPage({ searchParams }: ShopPageProps) {
    const initialCategory = typeof searchParams?.category === "string"
        ? searchParams.category.trim().toLowerCase()
        : "all";

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-0 pb-12 lg:pb-16 bg-background-secondary min-h-screen">
                <section className="relative h-[300px] sm:h-[360px] lg:h-[420px] overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1800&q=80"
                        alt="Premium cotton, silk, and georgette fabric collection"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1f1815]/85 via-[#1f1815]/60 to-[#1f1815]/20" />
                    <Container className="relative h-full flex items-center">
                        <div className="max-w-2xl text-white">
                            <p className="text-xs sm:text-sm tracking-[0.32em] uppercase mb-4 text-white/80">Our Collection</p>
                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">Shop All Fabrics</h1>
                            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                                Explore handcrafted selections in cotton, silk, georgette, and occasion-ready textiles.
                            </p>
                        </div>
                    </Container>
                </section>

                <section className="-mt-10 relative z-10">
                    <Container>
                        <div className="bg-white border border-border/70 shadow-premium p-5 sm:p-6 lg:p-8">
                            <ShopTopBanner />
                            <Suspense fallback={<div className="text-center py-20">Loading products...</div>}>
                                <ProductGrid initialCategory={initialCategory || "all"} />
                            </Suspense>
                        </div>
                    </Container>
                </section>
            </main>
            <Footer />
        </>
    );
}
