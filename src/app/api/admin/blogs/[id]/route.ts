import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { CACHE_TAGS } from "@/lib/cache";
import { isThemeAgnosticLayout, listFromUnknown, normalizeBlogPayload } from "@/lib/blogs";
import { hasCustomJsInLayout } from "@/lib/blogCodeValidation";

async function replacePostTags(postId: string, tagIds: string[]) {
    const { error: deleteError } = await supabaseAdmin
        .from("blog_post_tags")
        .delete()
        .eq("post_id", postId);

    if (deleteError) throw deleteError;

    if (tagIds.length === 0) return;

    const rows = tagIds.map((tagId) => ({ post_id: postId, tag_id: tagId }));
    const { error: insertError } = await supabaseAdmin.from("blog_post_tags").insert(rows);
    if (insertError) throw insertError;
}

async function replaceRelatedPosts(postId: string, relatedPostIds: string[]) {
    const { error: deleteError } = await supabaseAdmin
        .from("blog_post_related_posts")
        .delete()
        .eq("post_id", postId);

    if (deleteError) throw deleteError;

    if (relatedPostIds.length === 0) return;

    const rows = relatedPostIds
        .filter((id) => id !== postId)
        .slice(0, 5)
        .map((relatedPostId) => ({ post_id: postId, related_post_id: relatedPostId }));

    if (rows.length === 0) return;

    const { error: insertError } = await supabaseAdmin.from("blog_post_related_posts").insert(rows);
    if (insertError) throw insertError;
}

async function replaceRelatedProducts(postId: string, productIds: string[]) {
    const { error: deleteError } = await supabaseAdmin
        .from("blog_post_related_products")
        .delete()
        .eq("post_id", postId);

    if (deleteError) throw deleteError;

    if (productIds.length === 0) return;

    const rows = productIds.slice(0, 10).map((productId, index) => ({
        post_id: postId,
        product_id: productId,
        sort_order: index,
    }));

    const { error: insertError } = await supabaseAdmin.from("blog_post_related_products").insert(rows);
    if (insertError) throw insertError;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;

        const [postRes, tagRes, relatedPostsRes, relatedProductsRes, redirectsRes, revisionsRes] = await Promise.all([
            supabaseAdmin.from("blog_posts").select("*").eq("id", postId).single(),
            supabaseAdmin
                .from("blog_post_tags")
                .select("tag_id, blog_tags(id, name, slug)")
                .eq("post_id", postId),
            supabaseAdmin
                .from("blog_post_related_posts")
                .select("related_post_id")
                .eq("post_id", postId),
            supabaseAdmin
                .from("blog_post_related_products")
                .select("product_id, sort_order")
                .eq("post_id", postId)
                .order("sort_order", { ascending: true }),
            supabaseAdmin
                .from("blog_slug_redirects")
                .select("id, old_slug, new_slug, created_at")
                .eq("post_id", postId)
                .order("created_at", { ascending: false }),
            supabaseAdmin
                .from("blog_post_revisions")
                .select("id, save_type, created_at")
                .eq("post_id", postId)
                .order("created_at", { ascending: false })
                .limit(25),
        ]);

        if (postRes.error) throw postRes.error;
        if (tagRes.error) throw tagRes.error;
        if (relatedPostsRes.error) throw relatedPostsRes.error;
        if (relatedProductsRes.error) throw relatedProductsRes.error;
        if (redirectsRes.error) throw redirectsRes.error;
        if (revisionsRes.error) throw revisionsRes.error;

        const post = postRes.data;
        const tagIds = (tagRes.data ?? []).map((row: { tag_id: string }) => row.tag_id);
        const tags = (tagRes.data ?? []).flatMap((row: any) => (row.blog_tags ? [row.blog_tags] : []));

        return NextResponse.json({
            post,
            tag_ids: tagIds,
            tags,
            related_post_ids: (relatedPostsRes.data ?? []).map((row: { related_post_id: string }) => row.related_post_id),
            related_products: (relatedProductsRes.data ?? []).map((row) => ({ product_id: row.product_id, sort_order: row.sort_order })),
            redirects: redirectsRes.data ?? [],
            revision_history: revisionsRes.data ?? [],
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch blog post";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;
        const body = await req.json();

        const { data: existing, error: existingError } = await supabaseAdmin
            .from("blog_posts")
            .select("id, slug, status, code_mode_locked")
            .eq("id", postId)
            .single();

        if (existingError) throw existingError;

        const payload = normalizeBlogPayload((body ?? {}) as Record<string, unknown>);
        const hasCustomJs = Boolean(payload.full_page_js?.trim())
            || hasCustomJsInLayout(payload.builder_layout ?? null);

        if (hasCustomJs && !payload.custom_js_acknowledged) {
            return NextResponse.json({ error: "Custom JS acknowledgment is required before saving." }, { status: 400 });
        }

        if (existing.code_mode_locked && payload.editor_mode === "visual") {
            return NextResponse.json({ error: "This post is locked to code mode and cannot switch back to visual." }, { status: 400 });
        }

        if (payload.builder_layout && !isThemeAgnosticLayout(payload.builder_layout)) {
            return NextResponse.json({ error: "Builder layout must remain theme-agnostic. Remove themeId-specific values." }, { status: 400 });
        }

        if (!payload.title && typeof body?.title !== "undefined") {
            return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
        }

        if (!payload.slug && typeof body?.slug !== "undefined") {
            return NextResponse.json({ error: "Slug cannot be empty." }, { status: 400 });
        }

        if (payload.slug && payload.slug !== existing.slug) {
            const { data: slugMatch, error: slugError } = await supabaseAdmin
                .from("blog_posts")
                .select("id")
                .eq("slug", payload.slug)
                .neq("id", postId)
                .limit(1);

            if (slugError) throw slugError;
            if ((slugMatch ?? []).length > 0) {
                return NextResponse.json({ error: "Slug already exists. Choose a unique slug." }, { status: 409 });
            }
        }

        const { data: post, error } = await supabaseAdmin
            .from("blog_posts")
            .update(payload)
            .eq("id", postId)
            .select("*")
            .single();

        if (error) throw error;

        if (Array.isArray(body?.tag_ids)) {
            await replacePostTags(postId, listFromUnknown(body.tag_ids));
        }

        if (Array.isArray(body?.related_post_ids)) {
            await replaceRelatedPosts(postId, listFromUnknown(body.related_post_ids));
        }

        if (Array.isArray(body?.related_product_ids)) {
            await replaceRelatedProducts(postId, listFromUnknown(body.related_product_ids));
        }

        const newSlug = post.slug;
        if (newSlug !== existing.slug && existing.status === "published") {
            await supabaseAdmin
                .from("blog_slug_redirects")
                .upsert({
                    post_id: postId,
                    old_slug: existing.slug,
                    new_slug: newSlug,
                }, { onConflict: "old_slug" });
        }

        const { error: revisionError } = await supabaseAdmin
            .from("blog_post_revisions")
            .insert({
                post_id: postId,
                save_type: "manual",
                snapshot: post,
            });

        if (revisionError) throw revisionError;

        revalidateTag(CACHE_TAGS.blogPosts);
        return NextResponse.json({ post });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update blog post";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;

        const { error } = await supabaseAdmin
            .from("blog_posts")
            .delete()
            .eq("id", postId);

        if (error) throw error;

        revalidateTag(CACHE_TAGS.blogPosts);
        return NextResponse.json({ ok: true, id: postId });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete blog post";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
