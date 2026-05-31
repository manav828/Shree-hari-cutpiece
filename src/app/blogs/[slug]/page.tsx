import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { getSiteUrl } from "@/lib/siteUrl";
import { filterPublicContentPosts, isPublicContentPost } from "@/lib/blogPublicContent";
import { buildArticleSchema, buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";
import { getActiveTheme } from "@/lib/theme";
import themes from "@/themes/registry";

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

type BlogTagInfo = {
    id: string;
    name: string;
    slug: string;
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
    seo_keywords: string | null;
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
            "id, variant_group_id, language, title, slug, excerpt, cover_media_id, author_name, published_at, editor_mode, builder_layout, full_page_html, full_page_css, full_page_js, schema_markup_enabled, show_header, show_cover, show_share_buttons, show_related_products, related_products_title, seo_meta_title, seo_meta_description, seo_canonical_url, seo_og_title, seo_og_description, seo_og_image_media_id, seo_twitter_card_type, seo_robots_directive, seo_keywords, cover_media:cover_media_id (public_url, alt_text, width, height), og_media:seo_og_image_media_id (public_url, alt_text, width, height), category:category_id (name, slug)",
        )
        .eq("slug", slug)
        .eq("status", "published")
        .eq("language", language)
        .single();

    if (error) return null;
    return data as unknown as BlogDetailRow;
}

async function fetchPostTags(postId: string): Promise<BlogTagInfo[]> {
    const { data, error } = await supabaseAdmin
        .from("blog_post_tags")
        .select("tag_id, blog_tags(id, name, slug)")
        .eq("post_id", postId);

    if (error || !data) return [];
    return data
        .map((row: any) => row.blog_tags)
        .filter(Boolean) as BlogTagInfo[];
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

    // Resolve combined keywords for SEO metadata
    const tags = await fetchPostTags(post.id);
    const tagKeywords = tags.map((t) => t.name);
    const postKeywords = post.seo_keywords ? post.seo_keywords.split(",").map((k) => k.trim()) : [];
    const combinedKeywords = Array.from(new Set([...postKeywords, ...tagKeywords])).filter(Boolean);

    return {
        metadataBase: new URL(baseUrl),
        title: post.seo_meta_title || post.title,
        description: post.seo_meta_description || post.excerpt || post.title,
        alternates: {
            canonical: canonicalUrl,
            languages,
        },
        robots: post.seo_robots_directive || "index,follow",
        keywords: combinedKeywords,
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

    const [variants, relatedPosts, relatedProducts, tags, activeTheme] = await Promise.all([
        fetchVariants(post.variant_group_id),
        fetchRelatedPosts(post.id, post.language).then(filterPublicContentPosts),
        fetchRelatedProducts(post.id),
        fetchPostTags(post.id),
        getActiveTheme(),
    ]);

    const languageLabels: Record<BlogVariant["language"], string> = {
        en: "English",
        hi: "Hindi",
        other: "Other",
    };

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

    // Resolve visual component based on the active theme
    const themeConfig = themes[activeTheme] || themes["classic"];
    const ThemeBlogDetailPage = themeConfig.BlogDetailPage;

    return (
        <>
            {schemaMarkup.map((schema, index) => (
                <script
                    key={`blog-en-schema-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            <ThemeBlogDetailPage
                post={{
                    ...post,
                    cover_media: post.cover_media ?? null,
                    og_media: post.og_media ?? null,
                    category: post.category ?? null,
                }}
                relatedPosts={relatedPosts.map((rp) => ({
                    id: rp.id,
                    title: rp.title,
                    slug: rp.slug,
                    excerpt: rp.excerpt,
                    published_at: rp.published_at,
                    cover_media: rp.cover_media ?? undefined,
                    category: rp.category ?? undefined,
                }))}
                relatedProducts={relatedProducts}
                tags={tags}
                readTime={readTime}
                shareUrl={shareUrl}
                variants={variants}
                languageLabels={languageLabels}
                blogBasePath={getBlogBasePath(post.language)}
            />
        </>
    );
}
