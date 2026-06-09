import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { CACHE_TAGS } from "@/lib/cache";
import {
    BLOG_SORT_FIELDS,
    isThemeAgnosticLayout,
    listFromUnknown,
    normalizeBlogPayload,
    parseBlogListFilters,
} from "@/lib/blogs";
import { hasCustomJsInLayout } from "@/lib/blogCodeValidation";

async function fetchPostTags(postIds: string[]): Promise<Record<string, Array<{ id: string; name: string; slug: string }>>> {
    if (postIds.length === 0) return {};

    const { data, error } = await supabaseAdmin
        .from("blog_post_tags")
        .select("post_id, blog_tags(id, name, slug)")
        .in("post_id", postIds);

    if (error) throw error;

    return (data ?? []).reduce<Record<string, Array<{ id: string; name: string; slug: string }>>>((acc, row: any) => {
        if (!acc[row.post_id]) acc[row.post_id] = [];
        if (row.blog_tags) {
            acc[row.post_id].push(row.blog_tags);
        }
        return acc;
    }, {});
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const filters = parseBlogListFilters(searchParams);

        const from = (filters.page - 1) * filters.limit;
        const to = from + filters.limit - 1;

        let filteredPostIds: string[] | null = null;
        if (filters.tagId !== "all") {
            const { data: taggedRows, error: tagFilterError } = await supabaseAdmin
                .from("blog_post_tags")
                .select("post_id")
                .eq("tag_id", filters.tagId);

            if (tagFilterError) throw tagFilterError;
            filteredPostIds = (taggedRows ?? []).map((row: { post_id: string }) => row.post_id);

            if (filteredPostIds.length === 0) {
                return NextResponse.json({ posts: [], page: filters.page, limit: filters.limit, total: 0, total_pages: 1 });
            }
        }

        let query = supabaseAdmin
            .from("blog_posts")
            .select(
                "id, variant_group_id, language, title, slug, excerpt, status, scheduled_for, published_at, category_id, author_name, created_at, updated_at",
                { count: "exact" },
            );

        if (filters.status !== "all") {
            query = query.eq("status", filters.status);
        }

        if (filters.language !== "all") {
            query = query.eq("language", filters.language);
        }

        if (filters.categoryId !== "all") {
            query = query.eq("category_id", filters.categoryId);
        }

        if (filters.search) {
            const safeSearch = filters.search.replace(/,/g, "").replace(/%/g, "");
            query = query.or([
                `title.ilike.%${safeSearch}%`,
                `slug.ilike.%${safeSearch}%`,
                `excerpt.ilike.%${safeSearch}%`,
            ].join(","));
        }

        if (filters.dateFrom) {
            query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
        }

        if (filters.dateTo) {
            query = query.lte("created_at", `${filters.dateTo}T23:59:59`);
        }

        if (filteredPostIds) {
            query = query.in("id", filteredPostIds);
        }

        const orderField = BLOG_SORT_FIELDS[filters.sortBy] ?? BLOG_SORT_FIELDS.updated_at;

        const { data: posts, count, error } = await query
            .order(orderField, { ascending: filters.sortOrder === "asc", nullsFirst: false })
            .range(from, to);

        if (error) throw error;

        const postIds = (posts ?? []).map((post) => post.id);

        const [categoriesRes, tagsByPost] = await Promise.all([
            supabaseAdmin
                .from("blog_categories")
                .select("id, name, slug")
                .in("id", (posts ?? []).map((post) => post.category_id).filter(Boolean)),
            fetchPostTags(postIds),
        ]);

        if (categoriesRes.error) throw categoriesRes.error;

        const categoriesById = (categoriesRes.data ?? []).reduce<Record<string, { id: string; name: string; slug: string }>>((acc, category) => {
            acc[category.id] = category;
            return acc;
        }, {});

        const merged = (posts ?? []).map((post) => ({
            ...post,
            category: post.category_id ? categoriesById[post.category_id] ?? null : null,
            tags: tagsByPost[post.id] ?? [],
        }));

        const total = count ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / filters.limit));

        return NextResponse.json({
            posts: merged,
            page: filters.page,
            limit: filters.limit,
            total,
            total_pages: totalPages,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch blog posts";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const payload = normalizeBlogPayload((body ?? {}) as Record<string, unknown>);

        if (!payload.title) {
            return NextResponse.json({ error: "Title is required." }, { status: 400 });
        }

        if (!payload.slug) {
            return NextResponse.json({ error: "Slug is required." }, { status: 400 });
        }

        if (!isThemeAgnosticLayout(payload.builder_layout)) {
            return NextResponse.json({ error: "Builder layout must remain theme-agnostic. Remove themeId-specific values." }, { status: 400 });
        }

        if (payload.slug) {
            const { data: slugMatch, error: slugError } = await supabaseAdmin
                .from("blog_posts")
                .select("id")
                .eq("slug", payload.slug)
                .limit(1);

            if (slugError) throw slugError;
            if ((slugMatch ?? []).length > 0) {
                return NextResponse.json({ error: "Slug already exists. Choose a unique slug." }, { status: 409 });
            }
        }

        const hasCustomJs = Boolean(payload.full_page_js?.trim())
            || hasCustomJsInLayout(payload.builder_layout ?? null);

        if (hasCustomJs && !payload.custom_js_acknowledged) {
            return NextResponse.json({ error: "Custom JS acknowledgment is required before saving." }, { status: 400 });
        }

        const { data: post, error } = await supabaseAdmin
            .from("blog_posts")
            .insert(payload)
            .select("*")
            .single();

        if (error) throw error;

        const tagIds = listFromUnknown(body?.tag_ids);
        if (tagIds.length > 0) {
            const rows = tagIds.map((tagId) => ({ post_id: post.id, tag_id: tagId }));
            const { error: tagsError } = await supabaseAdmin.from("blog_post_tags").insert(rows);
            if (tagsError) throw tagsError;
        }

        const relatedPostIds = listFromUnknown(body?.related_post_ids);
        if (relatedPostIds.length > 0) {
            const rows = relatedPostIds
                .filter((id) => id !== post.id)
                .slice(0, 5)
                .map((relatedPostId) => ({ post_id: post.id, related_post_id: relatedPostId }));
            if (rows.length > 0) {
                const { error: relPostsError } = await supabaseAdmin.from("blog_post_related_posts").insert(rows);
                if (relPostsError) throw relPostsError;
            }
        }

        const relatedProductIds = listFromUnknown(body?.related_product_ids);
        if (relatedProductIds.length > 0) {
            const rows = relatedProductIds.slice(0, 10).map((productId, index) => ({
                post_id: post.id,
                product_id: productId,
                sort_order: index,
            }));
            if (rows.length > 0) {
                const { error: relProductsError } = await supabaseAdmin.from("blog_post_related_products").insert(rows);
                if (relProductsError) throw relProductsError;
            }
        }


        const { error: revisionError } = await supabaseAdmin
            .from("blog_post_revisions")
            .insert({
                post_id: post.id,
                save_type: "manual",
                snapshot: post,
            });

        if (revisionError) throw revisionError;

        revalidateTag(CACHE_TAGS.blogPosts);
        return NextResponse.json({ post }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create blog post";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const action = typeof body?.action === "string" ? body.action : "";

        if (action === "quick-edit") {
            const id = typeof body?.id === "string" ? body.id : "";
            if (!id) return NextResponse.json({ error: "id is required for quick-edit" }, { status: 400 });

            const status = typeof body?.status === "string" ? body.status : undefined;
            const scheduledFor = typeof body?.scheduled_for === "string" ? body.scheduled_for : undefined;

            const patch: Record<string, unknown> = {};
            if (status) patch.status = status;
            if (typeof scheduledFor !== "undefined") patch.scheduled_for = scheduledFor || null;
            if (status === "published") patch.published_at = new Date().toISOString();

            const { data, error } = await supabaseAdmin
                .from("blog_posts")
                .update(patch)
                .eq("id", id)
                .select("id, status, scheduled_for, published_at, updated_at")
                .single();

            if (error) throw error;
            revalidateTag(CACHE_TAGS.blogPosts);
            return NextResponse.json({ post: data });
        }

        if (action === "bulk-status") {
            const ids = listFromUnknown(body?.ids);
            const status = typeof body?.status === "string" ? body.status : "";
            if (ids.length === 0) return NextResponse.json({ error: "ids are required" }, { status: 400 });
            if (!status) return NextResponse.json({ error: "status is required" }, { status: 400 });

            const updatePatch: Record<string, unknown> = { status };
            if (status === "published") updatePatch.published_at = new Date().toISOString();

            const { error } = await supabaseAdmin
                .from("blog_posts")
                .update(updatePatch)
                .in("id", ids);

            if (error) throw error;
            revalidateTag(CACHE_TAGS.blogPosts);
            return NextResponse.json({ ok: true, updated_count: ids.length });
        }

        if (action === "bulk-delete") {
            const ids = listFromUnknown(body?.ids);
            if (ids.length === 0) return NextResponse.json({ error: "ids are required" }, { status: 400 });

            const { error } = await supabaseAdmin
                .from("blog_posts")
                .delete()
                .in("id", ids);

            if (error) throw error;
            revalidateTag(CACHE_TAGS.blogPosts);
            return NextResponse.json({ ok: true, deleted_count: ids.length });
        }

        return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to apply blog bulk/quick action";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
