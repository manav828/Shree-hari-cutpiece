import { notFound, permanentRedirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogCard from "@/components/blog/BlogCard";
import BlogRenderer from "@/components/blog/BlogRenderer";
import ShareButtons from "@/components/blog/ShareButtons";
import ProductCard from "@/components/shop/ProductCard";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { getSiteUrl } from "@/lib/siteUrl";
import { filterPublicContentPosts, isPublicContentPost } from "@/lib/blogPublicContent";
import { buildArticleSchema, buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";

export const dynamic = "force-dynamic";

interface BlogDetailPageProps {
    params: { slug: string };
}

type BlogMedia = {
    public_url: string | null;
    alt_text: string | null;
    width: number | null;
    height: number | null;
};

type BlogCategory = {
    name: string | null;
    slug: string | null;
};

type BlogDetailRow = {
    id: string;
    variant_group_id: string;
    language: "en" | "hi" | "other";
    title: string;
    slug: string;
    excerpt: string | null;
    cover_media_id: string | null;
    author_name: string | null;
    published_at: string | null;
    editor_mode: "visual" | "full_code";
    builder_layout: Record<string, unknown> | null;
    full_page_html: string | null;
    full_page_css: string | null;
    full_page_js: string | null;
    schema_markup_enabled: boolean;
    show_header: boolean;
    show_cover: boolean;
    show_share_buttons: boolean;
    show_related_products: boolean;
    related_products_title: string | null;
    seo_meta_title: string | null;
    seo_meta_description: string | null;
    seo_canonical_url: string | null;
    seo_og_title: string | null;
    seo_og_description: string | null;
    seo_og_image_media_id: string | null;
    seo_twitter_card_type: "summary" | "summary_large_image" | null;
    seo_robots_directive: "index,follow" | "noindex,follow" | "noindex,nofollow" | null;
    cover_media?: BlogMedia | null;
    og_media?: BlogMedia | null;
    category?: BlogCategory | null;
};

type BlogVariant = {
    slug: string;
    language: "en" | "hi" | "other";
};

type RelatedPostRow = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    cover_media?: BlogMedia | null;
    category?: BlogCategory | null;
};

type RelatedProductRow = {
    id: string;
    name: string;
    slug: string;
    sell_mode: string | null;
    categories?: { name?: string | null; slug?: string | null } | Array<{ name?: string | null; slug?: string | null }> | null;
    product_variants?: Array<{
        price?: number | null;
        original_price?: number | null;
        is_default?: boolean | null;
        variant_images?: Array<{ image_url?: string | null; is_primary?: boolean | null }> | null;
    }> | null;
};

type RelatedProductView = {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    unit: string;
    category: string;
    image: string;
    images: string[];
};

const DEFAULT_LANGUAGE: BlogVariant["language"] = "en";

function getBlogBasePath(language: BlogVariant["language"]) {
    return language === "hi" ? "/hi/blogs" : "/blogs";
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function collectText(value: unknown, acc: string[]) {
    if (typeof value === "string") {
        acc.push(stripHtml(value));
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((item) => collectText(item, acc));
        return;
    }
    if (value && typeof value === "object") {
        Object.values(value as Record<string, unknown>).forEach((item) => collectText(item, acc));
    }
}

function extractTextFromLayout(layout: Record<string, unknown> | null): string {
    if (!layout) return "";
    const sections = Array.isArray((layout as { sections?: unknown }).sections)
        ? ((layout as { sections: unknown[] }).sections)
        : [];

    const pieces: string[] = [];
    sections.forEach((section) => {
        if (!section || typeof section !== "object") return;
        const content = (section as { content?: Record<string, unknown> }).content ?? {};
        collectText(content, pieces);
    });
    return pieces.join(" ");
}

function estimateReadTime(text: string): string | null {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    if (!words) return null;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} min read`;
}

async function fetchPost(slug: string, language: BlogVariant["language"]): Promise<BlogDetailRow | null> {
    const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select(
            "id, variant_group_id, language, title, slug, excerpt, cover_media_id, author_name, published_at, editor_mode, builder_layout, full_page_html, full_page_css, full_page_js, schema_markup_enabled, show_header, show_cover, show_share_buttons, show_related_products, related_products_title, seo_meta_title, seo_meta_description, seo_canonical_url, seo_og_title, seo_og_description, seo_og_image_media_id, seo_twitter_card_type, seo_robots_directive, cover_media:cover_media_id (public_url, alt_text, width, height), og_media:seo_og_image_media_id (public_url, alt_text, width, height), category:category_id (name, slug)",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .eq("language", language)
        .single();

    if (error) return null;
    return data as unknown as BlogDetailRow;
}

async function fetchVariants(variantGroupId: string): Promise<BlogVariant[]> {
    const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("slug, language")
        .eq("variant_group_id", variantGroupId)
        .eq("status", "published");

    if (error) return [];
    return (data ?? []) as BlogVariant[];
}

async function fetchRelatedPosts(postId: string, language: BlogVariant["language"]): Promise<RelatedPostRow[]> {
    const { data: relatedRows, error: relatedError } = await supabaseAdmin
        .from("blog_post_related_posts")
        .select("related_post_id")
        .eq("post_id", postId)
        .limit(3);

    if (relatedError) return [];

    const relatedIds = (relatedRows ?? []).map((row: { related_post_id: string }) => row.related_post_id);
    if (relatedIds.length === 0) return [];

    const { data: posts, error } = await supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, cover_media:cover_media_id (public_url, alt_text, width, height), category:category_id (name, slug)")
        .in("id", relatedIds)
        .eq("status", "published")
        .eq("language", language);

    if (error) return [];

    const mapped = (posts ?? []) as unknown as RelatedPostRow[];
    const orderMap = new Map(relatedIds.map((id, index) => [id, index]));
    return mapped.sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0));
}

async function fetchRelatedProducts(postId: string): Promise<RelatedProductView[]> {
    const { data: relatedRows, error: relatedError } = await supabaseAdmin
        .from("blog_post_related_products")
        .select("product_id, sort_order")
        .eq("post_id", postId)
        .order("sort_order", { ascending: true });

    if (relatedError) return [] as RelatedProductView[];

    const productIds = (relatedRows ?? []).map((row: { product_id: string }) => row.product_id);
    if (productIds.length === 0) return [] as RelatedProductView[];

    const { data: products, error } = await supabaseAdmin
        .from("products")
        .select("id, name, slug, sell_mode, categories ( name, slug ), product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )")
        .in("id", productIds)
        .eq("is_active", true);

    if (error) return [] as RelatedProductView[];

    const orderMap = new Map(productIds.map((id, index) => [id, index]));
    const fallbackImage = "/products/1c.jpeg";

    return (products ?? [])
        .map((row) => row as RelatedProductRow)
        .sort((a, b) => (orderMap.get(a.id) ?? 0) - (orderMap.get(b.id) ?? 0))
        .map((product) => {
            const variants = product.product_variants ?? [];
            const defaultVariant = variants.find((variant) => variant.is_default) || variants[0];
            const images = defaultVariant?.variant_images ?? [];
            const primaryImage = images.find((img) => img.is_primary)?.image_url
                || images[0]?.image_url
                || fallbackImage;
            const categoryEntry = Array.isArray(product.categories) ? product.categories[0] : product.categories;
            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: defaultVariant?.price ?? 0,
                originalPrice: defaultVariant?.original_price ?? defaultVariant?.price ?? 0,
                unit: product.sell_mode === "meter" ? "meter" : "pc",
                category: categoryEntry?.name ?? "",
                image: primaryImage || fallbackImage,
                images: primaryImage ? [primaryImage] : [fallbackImage],
            };
        });
}

async function fetchRedirect(slug: string, language: BlogVariant["language"]) {
    const { data, error } = await supabaseAdmin
        .from("blog_slug_redirects")
        .select("new_slug, blog_posts(language, status, title, slug, excerpt)")
        .eq("old_slug", slug)
        .limit(1);

    if (error) return null;
    const row = (data ?? [])[0] as {
        new_slug?: string;
        blog_posts?: { language?: string; status?: string; title?: string | null; slug?: string | null; excerpt?: string | null } | null;
    } | undefined;
    if (!row?.new_slug) return null;
    if (row.blog_posts?.status !== "published") return null;
    if (row.blog_posts?.language !== language) return null;
    if (!isPublicContentPost({
        title: row.blog_posts?.title,
        slug: row.blog_posts?.slug || row.new_slug,
        excerpt: row.blog_posts?.excerpt,
    })) {
        return null;
    }
    return row.new_slug;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
    const post = await fetchPost(params.slug, DEFAULT_LANGUAGE);
    if (!post || !isPublicContentPost(post)) {
        return { title: "Post Not Found" };
    }

    const baseUrl = getSiteUrl();
    const canonicalPath = `${getBlogBasePath(post.language)}/${post.slug}`;
    const canonicalUrl = post.seo_canonical_url || `${baseUrl}${canonicalPath}`;
    const ogTitle = post.seo_og_title || post.seo_meta_title || post.title;
    const ogDescription = post.seo_og_description || post.seo_meta_description || post.excerpt || "";
    const ogImageUrl = post.og_media?.public_url || post.cover_media?.public_url || "";

    const variants = await fetchVariants(post.variant_group_id);
    const languages: Record<string, string> = {};
    variants.forEach((variant) => {
        const key = variant.language === "hi" ? "hi" : "en";
        if (!languages[key]) {
            languages[key] = `${baseUrl}${getBlogBasePath(variant.language)}/${variant.slug}`;
        }
    });

    return {
        metadataBase: new URL(baseUrl),
        title: post.seo_meta_title || post.title,
        description: post.seo_meta_description || post.excerpt || post.title,
        alternates: {
            canonical: canonicalUrl,
            languages,
        },
        robots: post.seo_robots_directive || "index,follow",
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            type: "article",
            url: canonicalUrl,
            images: ogImageUrl ? [{ url: ogImageUrl }] : undefined,
        },
        twitter: {
            card: post.seo_twitter_card_type || "summary_large_image",
            title: ogTitle,
            description: ogDescription,
            images: ogImageUrl ? [ogImageUrl] : undefined,
        },
    };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
    const post = await fetchPost(params.slug, DEFAULT_LANGUAGE);

    if (!post) {
        const redirectSlug = await fetchRedirect(params.slug, DEFAULT_LANGUAGE);
        if (redirectSlug) {
            permanentRedirect(`${getBlogBasePath(DEFAULT_LANGUAGE)}/${redirectSlug}`);
        }
        notFound();
    }

    if (!isPublicContentPost(post)) {
        notFound();
    }

    const variants = await fetchVariants(post.variant_group_id);
    const relatedPosts = filterPublicContentPosts(await fetchRelatedPosts(post.id, post.language));
    const relatedProducts = await fetchRelatedProducts(post.id);
    const languageLabels: Record<BlogVariant["language"], string> = {
        en: "English",
        hi: "Hindi",
        other: "Other",
    };

    const activeVariants = variants.filter((variant) => variant.language !== post.language);
    const contentText = post.editor_mode === "full_code"
        ? stripHtml(post.full_page_html || "")
        : extractTextFromLayout(post.builder_layout);
    const readTime = estimateReadTime(contentText);
    const articlePath = `${getBlogBasePath(post.language)}/${post.slug}`;
    const shareUrl = post.seo_canonical_url || `${getSiteUrl()}${articlePath}`;

    const schemaMarkup: Array<Record<string, unknown>> = [
        buildWebPageSchema({
            path: articlePath,
            title: post.seo_meta_title || post.title,
            description: post.seo_meta_description || post.excerpt || post.title,
            type: "Article",
        }),
        buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: getBlogBasePath(post.language) },
            { name: post.title, path: articlePath },
        ]),
    ];

    if (post.schema_markup_enabled) {
        schemaMarkup.push(
            buildArticleSchema({
                path: articlePath,
                headline: post.seo_meta_title || post.title,
                description: post.seo_meta_description || post.excerpt || post.title,
                image: post.og_media?.public_url || post.cover_media?.public_url,
                datePublished: post.published_at,
                authorName: post.author_name,
                inLanguage: post.language,
            }),
        );
    }

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-6 lg:pt-12 pb-0 bg-background min-h-screen">
                <Container>
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <ol className="flex items-center gap-2 text-sm text-text-secondary">
                            <li>
                                <Link href="/" className="hover:text-accent transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>/</li>
                            <li>
                                <Link href="/blogs" className="hover:text-accent transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="text-foreground truncate max-w-[200px] sm:max-w-xs">{post.title}</li>
                        </ol>
                    </nav>

                    <article className="max-w-5xl mx-auto">
                        {schemaMarkup.map((schema, index) => (
                            <script
                                key={`blog-en-schema-${index}`}
                                type="application/ld+json"
                                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                            />
                        ))}
                        {/* Header */}
                        {post.show_header !== false && (
                            <header className="text-center mb-8">
                                {post.category?.name && (
                                    <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-xs font-semibold tracking-widest uppercase mb-6 rounded-full">
                                        {post.category.name}
                                    </span>
                                )}
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-8">
                                    {post.title}
                                </h1>
                                <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-serif">
                                            {(post.author_name || "S").charAt(0)}
                                        </span>
                                        <span>{post.author_name || "Editorial Team"}</span>
                                    </div>
                                    {post.published_at && (
                                        <>
                                            <span>•</span>
                                            <span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                        </>
                                    )}
                                    {readTime && (
                                        <>
                                            <span>•</span>
                                            <span>{readTime}</span>
                                        </>
                                    )}
                                </div>
                                {activeVariants.length > 0 && (
                                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                        {activeVariants.map((variant) => (
                                            <Link
                                                key={variant.language}
                                                href={`${getBlogBasePath(variant.language)}/${variant.slug}`}
                                                className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:text-foreground"
                                            >
                                                {languageLabels[variant.language] || variant.language}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </header>
                        )}

                        {/* Featured Image */}
                        {post.show_cover !== false && (
                            <div className="aspect-[16/9] sm:aspect-[2/1] relative overflow-hidden bg-background-secondary mb-16 rounded-lg">
                                {post.cover_media?.public_url ? (
                                    <Image
                                        src={post.cover_media.public_url}
                                        alt={post.cover_media.alt_text || post.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 960px"
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-full prose-p:text-text-secondary prose-headings:font-serif prose-headings:text-foreground">
                            {post.excerpt && (
                                <p className="text-xl md:text-2xl text-foreground/80 font-serif italic mb-10 leading-relaxed border-l-4 border-accent pl-6">
                                    {post.excerpt}
                                </p>
                            )}
                            {post.show_share_buttons !== false && (
                                <div className="mb-10">
                                    <ShareButtons title={post.title} url={shareUrl} />
                                </div>
                            )}
                            {post.editor_mode === "full_code" ? (
                                <div className="space-y-6">
                                    {post.full_page_css && <style dangerouslySetInnerHTML={{ __html: post.full_page_css }} />}
                                    {post.full_page_html && <div dangerouslySetInnerHTML={{ __html: post.full_page_html }} />}
                                    {post.full_page_js && <script dangerouslySetInnerHTML={{ __html: post.full_page_js }} />}
                                </div>
                            ) : (
                                <BlogRenderer layout={post.builder_layout} />
                            )}
                            <div className="mt-14 rounded-2xl border border-border bg-background-secondary px-6 py-6">
                                <p className="text-xs tracking-[0.28em] uppercase text-text-secondary">Continue Exploring</p>
                                <h3 className="mt-2 font-serif text-2xl text-foreground">Keep Building Your Fabric Plan</h3>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={getBlogBasePath(post.language)}
                                        className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                                    >
                                        All Journal Articles
                                    </Link>
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                                    >
                                        Browse Fabric Collection
                                    </Link>
                                    {post.category?.name && (
                                        <Link
                                            href={`${getBlogBasePath(post.language)}?category=${encodeURIComponent(post.category.name)}`}
                                            className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                                        >
                                            More in {post.category.name}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                </Container>

                {post.show_related_products !== false && relatedProducts.length > 0 && (
                    <section className="mt-24 border-t border-border pt-12 bg-background-secondary">
                        <Container>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6 text-center">
                                {post.related_products_title || "Shop This Story"}
                            </h2>
                            <div
                                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-6"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {relatedProducts.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* More Articles Section */}
                {relatedPosts.length > 0 && (
                    <section className="mt-32 border-t border-border pt-20 bg-background-secondary">
                        <Container>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-10 text-center">
                                More from our Journal
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {relatedPosts.map((relatedPost) => (
                                    <BlogCard
                                        key={relatedPost.id}
                                        post={{
                                            id: relatedPost.id,
                                            title: relatedPost.title,
                                            slug: relatedPost.slug,
                                            excerpt: relatedPost.excerpt,
                                            imageUrl: relatedPost.cover_media?.public_url ?? null,
                                            imageAlt: relatedPost.cover_media?.alt_text ?? relatedPost.title,
                                            category: relatedPost.category?.name ?? null,
                                            publishedAt: relatedPost.published_at,
                                        }}
                                    />
                                ))}
                            </div>
                        </Container>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
}
