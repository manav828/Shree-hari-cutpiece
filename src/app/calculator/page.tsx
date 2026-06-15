import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import FabricCalculator from "@/components/FabricCalculator";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
    title: "Fabric Requirement Calculator | Shree Hari Cutpiece",
    description: "Calculate standard fabric cuts and meter requirements for custom garments including Saree, Anarkali, Kurta, Blouse, Lehenga, Shirts, and Trousers.",
    path: "/calculator",
    keywords: ["fabric calculator", "meter requirement", "panna calculator", "how much fabric to buy", "ahmedabad textile calculator"],
});

export default function CalculatorPage() {
    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-24 lg:pt-32 pb-24 min-h-screen bg-background">
                <Container>
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Intro Hero */}
                        <div className="text-center space-y-3 max-w-2xl mx-auto">
                            <span className="text-xs font-semibold text-accent tracking-[0.2em] uppercase">Tailoring Companion</span>
                            <h1 className="font-serif text-4xl lg:text-5xl text-foreground">Fabric Calculator</h1>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                Not sure how many meters to order? Select your desired outfit, size, and standard fabric width (Panna) to calculate your recommended cut length.
                            </p>
                        </div>

                        {/* Calculator Component */}
                        <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
                            <FabricCalculator />
                        </div>

                        {/* Guide section */}
                        <div className="bg-[#FDFBF7] rounded-2xl border border-border p-6 md:p-8 space-y-6">
                            <h3 className="font-serif text-xl text-foreground border-b border-border pb-3">Understanding Fabric Width (Panna)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground text-sm">36-inch Width (90cm)</h4>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Often used for Banarasi silks, brocades, and traditional handlooms. Requires more length because the fabric is narrow.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground text-sm">44-inch Width (110cm)</h4>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        The standard industry width for cottons, rayon, georgette, and printed designer fabrics. Most garment patterns assume this width.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-medium text-foreground text-sm">58/60-inch Width (150cm)</h4>
                                    <p className="text-xs text-text-secondary leading-relaxed">
                                        Commonly used for linen, heavy silks, woolens, suitings, and upholstery. You need less length since the fabric is wide.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
