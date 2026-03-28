import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { validateBlogPostForPublish } from "@/lib/blogValidation";

function isAuthorized(req: NextRequest): boolean {
    const secret = process.env.BLOG_SCHEDULER_SECRET;
    if (!secret) return true;
    const provided = req.headers.get("x-blog-scheduler-secret") || "";
    return provided === secret;
}

export async function POST(req: NextRequest) {
    if (!isAuthorized(req)) {
        return NextResponse.json({ error: "Unauthorized scheduler request" }, { status: 401 });
    }

    try {
        const now = new Date();
        const runId = crypto.randomUUID();

        const { data: posts, error } = await supabaseAdmin
            .from("blog_posts")
            .select("*")
            .eq("status", "scheduled")
            .lte("scheduled_for", now.toISOString())
            .order("scheduled_for", { ascending: true })
            .limit(50);

        if (error) throw error;

        const results = [] as Array<{ post_id: string; status: string; errors?: string[] }>;

        for (const post of posts ?? []) {
            try {
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

                const validation = validateBlogPostForPublish(post, coverAltText);

                if (!validation.valid) {
                    const { error: fallbackError } = await supabaseAdmin
                        .from("blog_posts")
                        .update({ status: "draft" })
                        .eq("id", post.id);

                    if (fallbackError) throw fallbackError;

                    await supabaseAdmin
                        .from("blog_post_revisions")
                        .insert({
                            post_id: post.id,
                            save_type: "auto",
                            snapshot: { ...post, status: "draft" },
                        });

                    await supabaseAdmin
                        .from("blog_publish_notifications")
                        .insert({
                            post_id: post.id,
                            status: "draft",
                            message: "Scheduled publish failed validation and was reverted to draft.",
                            details: { run_id: runId, errors: validation.errors },
                        });

                    results.push({ post_id: post.id, status: "draft", errors: validation.errors });
                    continue;
                }

                const publishedAt = new Date().toISOString();
                const { data: publishedPost, error: publishError } = await supabaseAdmin
                    .from("blog_posts")
                    .update({ status: "published", published_at: publishedAt })
                    .eq("id", post.id)
                    .select("*")
                    .single();

                if (publishError) throw publishError;

                await supabaseAdmin
                    .from("blog_post_revisions")
                    .insert({
                        post_id: post.id,
                        save_type: "publish",
                        snapshot: publishedPost,
                    });

                await supabaseAdmin
                    .from("blog_publish_notifications")
                    .insert({
                        post_id: post.id,
                        status: "published",
                        message: "Scheduled publish succeeded.",
                        details: { run_id: runId },
                    });

                results.push({ post_id: post.id, status: "published" });
            } catch (postError: unknown) {
                const message = postError instanceof Error ? postError.message : "Scheduler failed for post";
                await supabaseAdmin
                    .from("blog_publish_notifications")
                    .insert({
                        post_id: post.id,
                        status: "error",
                        message,
                        details: { run_id: runId },
                    });
                results.push({ post_id: post.id, status: "error", errors: [message] });
            }
        }

        const publishedCount = results.filter((r) => r.status === "published").length;
        const failedCount = results.filter((r) => r.status === "draft").length;

        return NextResponse.json({
            processed: results.length,
            published: publishedCount,
            failed: failedCount,
            results,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to run scheduler";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
