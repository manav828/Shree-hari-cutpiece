import type { BlogEditorMode, BlogLanguage, BlogPost, BlogStatus } from "@/types/blogs";

export const BLOG_SORT_FIELDS = {
    created_at: "created_at",
    updated_at: "updated_at",
    published_at: "published_at",
    scheduled_for: "scheduled_for",
    title: "title",
    status: "status",
    language: "language",
} as const;

export type BlogSortField = keyof typeof BLOG_SORT_FIELDS;

export type BlogListFilters = {
    page: number;
    limit: number;
    status: BlogStatus | "all";
    language: BlogLanguage | "all";
    categoryId: string | "all";
    tagId: string | "all";
    search: string;
    dateFrom: string;
    dateTo: string;
    sortBy: BlogSortField;
    sortOrder: "asc" | "desc";
};

const BLOG_STATUSES: Array<BlogStatus> = ["draft", "scheduled", "published", "unpublished"];
const BLOG_LANGUAGES: Array<BlogLanguage> = ["en", "hi", "other"];
const BLOG_EDITOR_MODES: Array<BlogEditorMode> = ["visual", "full_code"];

export function cleanString(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

export function cleanNullableString(value: unknown): string | null {
    const cleaned = cleanString(value);
    return cleaned.length > 0 ? cleaned : null;
}

export function toBoolean(value: unknown, fallback = false): boolean {
    return typeof value === "boolean" ? value : fallback;
}

export function toNumber(value: unknown, fallback = 0): number {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
    }
    return fallback;
}

export function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

export function parseBlogListFilters(searchParams: URLSearchParams): BlogListFilters {
    const page = Math.max(1, toNumber(searchParams.get("page"), 1));
    const limit = Math.min(100, Math.max(1, toNumber(searchParams.get("limit"), 20)));
    const statusParam = cleanString(searchParams.get("status"));
    const languageParam = cleanString(searchParams.get("language"));
    const sortByParam = cleanString(searchParams.get("sortBy")) as BlogSortField;
    const sortOrderParam = cleanString(searchParams.get("sortOrder")).toLowerCase();

    const status = BLOG_STATUSES.includes(statusParam as BlogStatus) ? (statusParam as BlogStatus) : "all";
    const language = BLOG_LANGUAGES.includes(languageParam as BlogLanguage) ? (languageParam as BlogLanguage) : "all";

    const sortBy = Object.prototype.hasOwnProperty.call(BLOG_SORT_FIELDS, sortByParam)
        ? sortByParam
        : "updated_at";

    const sortOrder: "asc" | "desc" = sortOrderParam === "asc" ? "asc" : "desc";

    return {
        page,
        limit,
        status,
        language,
        categoryId: cleanString(searchParams.get("categoryId")) || "all",
        tagId: cleanString(searchParams.get("tagId")) || "all",
        search: cleanString(searchParams.get("search")),
        dateFrom: cleanString(searchParams.get("dateFrom")),
        dateTo: cleanString(searchParams.get("dateTo")),
        sortBy,
        sortOrder,
    };
}

export function isThemeAgnosticLayout(layout: unknown): boolean {
    if (layout === null || typeof layout === "undefined") return true;
    if (typeof layout !== "object") return false;

    const root = layout as Record<string, unknown>;
    const sections = root.sections;
    if (!Array.isArray(sections)) return true;

    return sections.every((section) => {
        if (!section || typeof section !== "object") return false;
        const block = section as Record<string, unknown>;
        if (typeof block.type !== "string" || block.type.trim() === "") return false;
        if (typeof block.visible !== "undefined" && typeof block.visible !== "boolean") return false;

        // Theme independence rule: layout can carry neutral style tokens but not concrete theme IDs.
        if (typeof block.themeId === "string" && block.themeId.trim() !== "") return false;

        return true;
    });
}

export function normalizeBlogPayload(input: Record<string, unknown>): Partial<BlogPost> {
    const title = cleanString(input.title);
    const rawSlug = cleanString(input.slug);
    const generatedSlug = rawSlug || slugify(title);
    const variantGroupId = cleanNullableString(input.variant_group_id);

    const status = cleanString(input.status) as BlogStatus;
    const language = cleanString(input.language) as BlogLanguage;
    const editorMode = cleanString(input.editor_mode) as BlogEditorMode;

    return {
        ...(variantGroupId ? { variant_group_id: variantGroupId } : {}),
        title,
        slug: generatedSlug,
        excerpt: cleanNullableString(input.excerpt),
        cover_media_id: cleanNullableString(input.cover_media_id),
        author_name: cleanNullableString(input.author_name),
        status: BLOG_STATUSES.includes(status) ? status : "draft",
        scheduled_for: cleanNullableString(input.scheduled_for),
        published_at: cleanNullableString(input.published_at),
        editor_mode: BLOG_EDITOR_MODES.includes(editorMode) ? editorMode : "visual",
        builder_layout: (input.builder_layout as Record<string, unknown> | null) ?? null,
        full_page_html: cleanNullableString(input.full_page_html),
        full_page_css: cleanNullableString(input.full_page_css),
        full_page_js: cleanNullableString(input.full_page_js),
        code_mode_locked: toBoolean(input.code_mode_locked, false),
        custom_js_acknowledged: toBoolean(input.custom_js_acknowledged, false),
        category_id: cleanNullableString(input.category_id),
        schema_markup_enabled: typeof input.schema_markup_enabled === "boolean" ? input.schema_markup_enabled : true,
        show_header: toBoolean(input.show_header, true),
        show_cover: toBoolean(input.show_cover, true),
        show_share_buttons: toBoolean(input.show_share_buttons, true),
        show_related_products: toBoolean(input.show_related_products, true),
        related_products_title: cleanNullableString(input.related_products_title),
        seo_meta_title: cleanNullableString(input.seo_meta_title),
        seo_meta_description: cleanNullableString(input.seo_meta_description),
        seo_canonical_url: cleanNullableString(input.seo_canonical_url),
        seo_og_title: cleanNullableString(input.seo_og_title),
        seo_og_description: cleanNullableString(input.seo_og_description),
        seo_og_image_media_id: cleanNullableString(input.seo_og_image_media_id),
        seo_twitter_card_type: cleanNullableString(input.seo_twitter_card_type) as BlogPost["seo_twitter_card_type"],
        seo_robots_directive: cleanNullableString(input.seo_robots_directive) as BlogPost["seo_robots_directive"],
        language: BLOG_LANGUAGES.includes(language) ? language : "en",
    };
}

export function listFromUnknown(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => cleanString(item))
        .filter(Boolean);
}
