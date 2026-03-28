import Link from "next/link";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";

export const metadata: Metadata = {
    title: "Post Removed | Shree Hari Blog",
    description: "This blog post is no longer available.",
    robots: "noindex,nofollow",
};

export default function BlogGoneHindiPage() {
    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-12 lg:pt-24 pb-20 bg-background min-h-screen">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="font-serif text-4xl text-foreground mb-4">This post is no longer available</h1>
                        <p className="text-text-secondary text-lg mb-6">
                            The article you are looking for has been removed or unpublished. Browse the latest stories instead.
                        </p>
                        <Link
                            href="/hi/blogs"
                            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white"
                        >
                            Back to Blog
                        </Link>
                    </div>
                </Container>
            </main>
            <Footer />
        </>
    );
}
