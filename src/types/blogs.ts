export type BlogLanguage = "en" | "hi" | "other";
export type BlogStatus = "draft" | "scheduled" | "published" | "unpublished";
export type BlogEditorMode = "visual" | "full_code";
export type BlogSaveType = "auto" | "manual" | "publish" | "restore";
export type BlogTwitterCardType = "summary" | "summary_large_image";
export type BlogRobotsDirective = "index,follow" | "noindex,follow" | "noindex,nofollow";

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    sort_order: number;
    created_at?: string;
    updated_at?: string;
}

export interface BlogTag {
    id: string;
    name: string;
    slug: string;
    created_at?: string;
    updated_at?: string;
}

export interface BlogMediaItem {
    id: string;
    file_name: string;
    bucket_path: string;
    public_url: string;
    mime_type: string | null;
    file_size_bytes: number | null;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    variants: Record<string, { path: string; url: string; width: number | null; height: number | null }>;
    uploaded_by: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface BlogPost {
    id: string;
    variant_group_id: string;
    language: BlogLanguage;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_media_id: string | null;
    author_name: string | null;
    status: BlogStatus;
    scheduled_for: string | null;
    published_at: string | null;
    editor_mode: BlogEditorMode;
    builder_layout: Record<string, unknown> | null;
    full_page_html: string | null;
    full_page_css: string | null;
    full_page_js: string | null;
    code_mode_locked: boolean;
    custom_js_acknowledged: boolean;
    category_id: string | null;
    schema_markup_enabled: boolean;
    seo_meta_title: string | null;
    seo_meta_description: string | null;
    seo_canonical_url: string | null;
    seo_og_title: string | null;
    seo_og_description: string | null;
    seo_og_image_media_id: string | null;
    seo_twitter_card_type: BlogTwitterCardType | null;
    seo_robots_directive: BlogRobotsDirective | null;
    show_header: boolean;
    show_cover: boolean;
    show_share_buttons: boolean;
    show_related_products: boolean;
    related_products_title: string | null;
    created_by: string | null;
    updated_by: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface BlogPostRevision {
    id: string;
    post_id: string;
    save_type: BlogSaveType;
    snapshot: Record<string, unknown>;
    created_by: string | null;
    created_at?: string;
}

export interface BlogSlugRedirect {
    id: string;
    post_id: string;
    old_slug: string;
    new_slug: string;
    created_by: string | null;
    created_at?: string;
}

export interface BlogRelatedProduct {
    id: string;
    post_id: string;
    product_id: string;
    sort_order: number;
    created_at?: string;
}

export interface BlogAnalyticsEvent {
    id: number;
    post_id: string;
    event_type: "page_view" | "product_click" | "collection_click" | "cta_click" | "share_click";
    referrer: string | null;
    device_type: "mobile" | "desktop" | "tablet" | "unknown" | null;
    target_id: string | null;
    event_at?: string;
}
