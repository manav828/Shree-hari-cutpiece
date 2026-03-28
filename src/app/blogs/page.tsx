import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogCard from "@/components/blog/BlogCard";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export const metadata: Metadata = {
    title: "Blog & Fashion Guides | Shree Hari Cutpiece",
    description: "Read our latest articles on fabric care, buying guides, and trending styles for premium cotton, silk, and georgette.",
};

export const dynamic = "force-dynamic";

type BlogListRow = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    cover_media?: { public_url: string | null; alt_text: string | null } | null;
    category?: { name: string | null } | null;
};

async function fetchPublishedPosts(language: "en" | "hi" | "other") {
    const languageOptions = Array.from(new Set([language, language.toUpperCase()]));
    const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, cover_media:cover_media_id (public_url, alt_text), category:category_id (name)")
        .eq("status", "published")
        .in("language", languageOptions)
        .order("published_at", { ascending: false });

    if (error) {
        return [] as BlogListRow[];
    }

    if ((data ?? []).length > 0) {
        return (data ?? []) as BlogListRow[];
    }

    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, cover_media:cover_media_id (public_url, alt_text), category:category_id (name)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (fallbackError) {
        return [] as BlogListRow[];
    }

    return (fallbackData ?? []) as BlogListRow[];
}

export default async function BlogsPage() {
    const posts = await fetchPublishedPosts("en");

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
                    {posts.length === 0 ? (
                        <div className="rounded-lg border border-border bg-white px-6 py-8 text-center text-text-secondary">
                            No published posts yet. Check back soon.
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => (
                                <BlogCard
                                    key={post.id}
                                    post={{
                                        id: post.id,
                                        title: post.title,
                                        slug: post.slug,
                                        excerpt: post.excerpt,
                                        imageUrl: post.cover_media?.public_url ?? null,
                                        imageAlt: post.cover_media?.alt_text ?? post.title,
                                        category: post.category?.name ?? null,
                                        publishedAt: post.published_at,
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </Container>
            </main>
            <Footer />
        </>
    );
}
