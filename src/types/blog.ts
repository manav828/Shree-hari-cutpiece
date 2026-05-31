/**
 * Shared types for theme-aware Blog pages.
 * These define the contract between the route-level server component (data layer)
 * and each theme's visual BlogPage / BlogDetailPage component.
 */

/* ─── Blog List Page ──────────────────────────────────────────────── */

export type BlogListPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    cover_media?: { public_url: string | null; alt_text: string | null } | null;
    category?: { name: string | null } | null;
};

export type BlogPageProps = {
    posts: BlogListPost[];
    requestedCategory: string;
    activeCategoryLabel: string;
};

/* ─── Blog Detail Page ────────────────────────────────────────────── */

export type BlogMedia = {
    public_url: string | null;
    alt_text: string | null;
    width: number | null;
    height: number | null;
};

export type BlogCategoryInfo = {
    name: string | null;
    slug: string | null;
};

export type BlogTagInfo = {
    id: string;
    name: string;
    slug: string;
};

export type BlogVariant = {
    slug: string;
    language: "en" | "hi" | "other";
};

export type BlogDetailPost = {
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
    category?: BlogCategoryInfo | null;
};

export type RelatedPostView = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    cover_media?: BlogMedia | null;
    category?: BlogCategoryInfo | null;
};

export type RelatedProductView = {
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

export type BlogDetailPageProps = {
    post: BlogDetailPost;
    relatedPosts: RelatedPostView[];
    relatedProducts: RelatedProductView[];
    tags: BlogTagInfo[];
    readTime: string | null;
    shareUrl: string;
    variants: BlogVariant[];
    languageLabels: Record<BlogVariant["language"], string>;
    blogBasePath: string;
};
