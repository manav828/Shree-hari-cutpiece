import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogCard from "@/components/blog/BlogCard";
import blogsData from "@/data/blogs.json";

export const metadata: Metadata = {
    title: "Blog & Fashion Guides | Shree Hari Cutpiece",
    description: "Read our latest articles on fabric care, buying guides, and trending styles for premium cotton, silk, and georgette.",
};

export default function BlogsPage() {
    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-12 lg:pt-24 pb-20 bg-background-secondary min-h-screen">
                <Container>
                    {/* Page Header */}
                    <div className="text-center mb-16 max-w-2xl mx-auto">
                        <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
                            Our Journal
                        </p>
                        <h1 className="font-serif text-4xl md:text-5xl lg:text-5xl text-foreground mb-6">
                            Style & Fabric Guides
                        </h1>
                        <p className="text-text-secondary text-lg leading-relaxed">
                            Discover tips on identifying authentic fabrics, preserving your premium ethnic wear, and tracking the latest trends.
                        </p>
                    </div>

                    {/* Blog Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogsData.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
