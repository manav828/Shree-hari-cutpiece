import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogCard from "@/components/blog/BlogCard";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { filterPublicContentPosts } from "@/lib/blogPublicContent";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";

const blogsTitle = "Blog & Fashion Guides | Shree Hari Cutpiece";
const blogsDescription = "Read our latest articles on fabric care, buying guides, and trending styles for premium cotton, silk, and georgette.";

export const metadata: Metadata = buildPageMetadata({
    title: blogsTitle,
    description: blogsDescription,
    path: "/blogs",
    alternates: {
        en: "/blogs",
        hi: "/hi/blogs",
    },
    keywords: ["fabric guide", "textile care", "dress material blog", "fabric styling tips"],
});

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

type BlogsPageProps = {
    searchParams?: {
        category?: string | string[];
    };
};

function getSingleParam(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
}

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

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
    const posts = filterPublicContentPosts(await fetchPublishedPosts("en"));
    const requestedCategory = getSingleParam(searchParams?.category).trim();
    const normalizedCategory = requestedCategory.toLocaleLowerCase("en-US");
    const filteredPosts = normalizedCategory
        ? posts.filter((post) => (post.category?.name || "").trim().toLocaleLowerCase("en-US") === normalizedCategory)
        : posts;
    const activeCategoryLabel = filteredPosts[0]?.category?.name || requestedCategory;
    const schemaMarkup = [
        buildWebPageSchema({
            path: "/blogs",
            title: blogsTitle,
            description: blogsDescription,
            type: "CollectionPage",
        }),
        buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
        ]),
    ];

    return (
        <>
            {schemaMarkup.map((schema, index) => (
                <script
                    key={`blogs-schema-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            <Navbar />
            <CartSidebar />
            <main className="pt-0 pb-20 bg-background-secondary min-h-screen">
                <section className="relative h-[290px] sm:h-[340px] lg:h-[400px] overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1800&q=80"
                        alt="Fabric care and styling journal hero visual"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1f1815]/85 via-[#1f1815]/60 to-[#1f1815]/20" />
                    <Container className="relative h-full flex items-center">
                        <div className="max-w-2xl text-white">
                            <p className="text-xs sm:text-sm tracking-[0.32em] uppercase mb-4 text-white/80">Our Journal</p>
                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">Style & Fabric Guides</h1>
                            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                                Practical buying tips, fabric knowledge, and styling insights for premium outfit planning.
                            </p>
                        </div>
                    </Container>
                </section>

                <section className="-mt-10 relative z-10">
                    <Container>
                        <div className="bg-white border border-border/70 shadow-premium p-6 sm:p-8 lg:p-10">
                            {requestedCategory && (
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background-secondary px-4 py-3 text-sm">
                                    <p className="text-text-secondary">
                                        Filtered by category: <span className="font-medium text-foreground">{activeCategoryLabel}</span>
                                    </p>
                                    <Link href="/blogs" className="text-accent hover:text-accent/80 transition-colors">
                                        Clear filter
                                    </Link>
                                </div>
                            )}
                            {filteredPosts.length === 0 ? (
                                <div className="rounded-lg border border-border bg-white px-6 py-8 text-center text-text-secondary">
                                    {requestedCategory
                                        ? "No published posts found for this category yet."
                                        : "No published posts yet. Check back soon."}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPosts.map((post) => (
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
                        </div>
                    </Container>
                </section>
            </main>
            <Footer />
        </>
    );
}
