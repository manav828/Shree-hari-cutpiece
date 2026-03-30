import { Suspense } from "react";
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
            <main className="pt-12 lg:pt-24 pb-12 lg:pb-16">
                <Container>
                    {/* Page Header */}
                    <div className="text-center mb-16">
                        <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
                            Our Collection
                        </p>
                        <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">
                            Shop All Fabrics
                        </h1>
                        <p className="text-text-secondary max-w-2xl mx-auto">
                            Explore our curated collection of premium fabrics, handpicked for quality
                            and elegance. All fabrics sold per meter.
                        </p>
                    </div>

                    {/* Product Grid */}
                    <ShopTopBanner />
                    <Suspense fallback={<div className="text-center py-20">Loading products...</div>}>
                        <ProductGrid initialCategory={initialCategory || "all"} />
                    </Suspense>
                </Container>
            </main>
            <Footer />
        </>
    );
}
