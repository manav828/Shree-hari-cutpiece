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

const blogsHindiTitle = "Hindi Blog | Shree Hari Cutpiece";
const blogsHindiDescription = "Read our latest Hindi articles on fabric care, buying guides, and trending styles.";

export const metadata: Metadata = buildPageMetadata({
    title: blogsHindiTitle,
    description: blogsHindiDescription,
    path: "/hi/blogs",
    alternates: {
        en: "/blogs",
        hi: "/hi/blogs",
    },
    keywords: ["hindi fabric blog", "hindi textile guide", "fabrics in hindi", "style tips hindi"],
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

type BlogsHindiPageProps = {
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
        return [] as any as BlogListRow[];
    }

    if ((data ?? []).length > 0) {
        return (data ?? []) as any as BlogListRow[];
    }

    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, cover_media:cover_media_id (public_url, alt_text), category:category_id (name)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (fallbackError) {
        return [] as any as BlogListRow[];
    }

    return (fallbackData ?? []) as any as BlogListRow[];
}

export default async function BlogsHindiPage({ searchParams }: BlogsHindiPageProps) {
    const posts = filterPublicContentPosts(await fetchPublishedPosts("hi"));
    const requestedCategory = getSingleParam(searchParams?.category).trim();
    const normalizedCategory = requestedCategory.toLocaleLowerCase("hi-IN");
    const filteredPosts = normalizedCategory
        ? posts.filter((post) => (post.category?.name || "").trim().toLocaleLowerCase("hi-IN") === normalizedCategory)
        : posts;
    const activeCategoryLabel = filteredPosts[0]?.category?.name || requestedCategory;
    const schemaMarkup = [
        buildWebPageSchema({
            path: "/hi/blogs",
            title: blogsHindiTitle,
            description: blogsHindiDescription,
            type: "CollectionPage",
        }),
        buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Hindi Blog", path: "/hi/blogs" },
        ]),
    ];

    return (
        <>
            {schemaMarkup.map((schema, index) => (
                <script
                    key={`blogs-hi-schema-${index}`}
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
                        alt="हिंदी फैब्रिक गाइड जर्नल कवर विजुअल"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1f1815]/85 via-[#1f1815]/60 to-[#1f1815]/20" />
                    <Container className="relative h-full flex items-center">
                        <div className="max-w-2xl text-white">
                            <p className="text-xs sm:text-sm tracking-[0.32em] uppercase mb-4 text-white/80">Hindi Journal</p>
                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">हिंदी स्टाइल और फैब्रिक गाइड्स</h1>
                            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                                असली फैब्रिक पहचान, आउटफिट प्लानिंग, और प्रीमियम टेक्सटाइल केयर पर उपयोगी हिंदी मार्गदर्शन।
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
                                        फ़िल्टर श्रेणी: <span className="font-medium text-foreground">{activeCategoryLabel}</span>
                                    </p>
                                    <Link href="/hi/blogs" className="text-accent hover:text-accent/80 transition-colors">
                                        सभी लेख देखें
                                    </Link>
                                </div>
                            )}
                            {filteredPosts.length === 0 ? (
                                <div className="rounded-lg border border-border bg-white px-6 py-8 text-center text-text-secondary">
                                    {requestedCategory
                                        ? "इस श्रेणी में अभी कोई प्रकाशित लेख उपलब्ध नहीं है।"
                                        : "अभी कोई प्रकाशित हिंदी लेख उपलब्ध नहीं है।"}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredPosts.map((post) => (
                                        <BlogCard
                                            key={post.id}
                                            hrefBase="/hi/blogs"
                                            locale="hi-IN"
                                            readMoreLabel="पूरा लेख पढ़ें"
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
