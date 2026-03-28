import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { validateBlogPostForPublish } from "@/lib/blogValidation";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;

        const { data: post, error } = await supabaseAdmin
            .from("blog_posts")
            .select("*")
            .eq("id", postId)
            .single();

        if (error) throw error;

        let coverAltText: string | null = null;
        if (post.cover_media_id) {
            const { data: media, error: mediaError } = await supabaseAdmin
                .from("blog_media_library")
                .select("alt_text")
                .eq("id", post.cover_media_id)
                .single();

            if (mediaError) throw mediaError;
            coverAltText = media?.alt_text ?? null;
        }

        const result = validateBlogPostForPublish(post, coverAltText);

        if (post.slug) {
            const { data: slugMatch, error: slugError } = await supabaseAdmin
                .from("blog_posts")
                .select("id")
                .eq("slug", post.slug)
                .neq("id", postId)
                .limit(1);

            if (slugError) throw slugError;
            if ((slugMatch ?? []).length > 0) {
                result.errors.push("Slug already exists. Choose a unique slug.");
                result.valid = false;
            }
        }

        return NextResponse.json({
            post_id: postId,
            valid: result.valid,
            errors: result.errors,
            warnings: result.warnings,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to validate blog post";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
