import Link from "next/link";
import { Metadata } from "next";
import ClassicNavbar from "@/components/layout/Navbar";
import ClassicFooter from "@/components/layout/Footer";
import ClassicCartSidebar from "@/components/cart/CartSidebar";
import Container from "@/components/ui/Container";
import { getActiveTheme } from "@/lib/theme";
import BohemianNavbar from "@/themes/bohemian/components/layout/Navbar";
import BohemianFooter from "@/themes/bohemian/components/layout/Footer";
import BohemianCartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import LuxuryNavbar from "@/themes/luxury/components/layout/Navbar";
import LuxuryFooter from "@/themes/luxury/components/layout/Footer";

export const metadata: Metadata = {
    title: "Post Removed | Shree Hari Blog",
    description: "This blog post is no longer available.",
    robots: "noindex,nofollow",
};

export default async function BlogGonePage() {
    const activeTheme = await getActiveTheme();
    const isBohemian = activeTheme === "bohemian";
    const isLuxury = activeTheme === "luxury";

    return (
        <>
            {isBohemian ? <BohemianNavbar /> : isLuxury ? <LuxuryNavbar /> : <ClassicNavbar />}
            {isBohemian ? <BohemianCartSidebar /> : <ClassicCartSidebar />}
            <main className="pt-12 lg:pt-24 pb-20 bg-background min-h-screen">
                <Container>
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="font-serif text-4xl text-foreground mb-4">This post is no longer available</h1>
                        <p className="text-text-secondary text-lg mb-6">
                            The article you are looking for has been removed or unpublished. Browse the latest stories instead.
                        </p>
                        <Link
                            href="/blogs"
                            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm font-semibold text-white"
                        >
                            Back to Blog
                        </Link>
                    </div>
                </Container>
            </main>
            {isBohemian ? <BohemianFooter /> : isLuxury ? <LuxuryFooter /> : <ClassicFooter />}
        </>
    );
}
