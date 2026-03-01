import { Suspense } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import ProductGrid from "@/components/shop/ProductGrid";

export const metadata = {
  title: "Shop All Fabrics | Shree Hari Cutpiece",
  description: "Browse our complete collection of premium cutpiece fabrics. Cotton, silk, georgette, rayon and more - all sold per meter.",
};

export default function ShopPage() {
  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="pt-12 lg:pt-24 pb-20">
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
          <Suspense fallback={<div className="text-center py-20">Loading products...</div>}>
            <ProductGrid />
          </Suspense>
        </Container>
      </main>
      <Footer />
    </>
  );
}
