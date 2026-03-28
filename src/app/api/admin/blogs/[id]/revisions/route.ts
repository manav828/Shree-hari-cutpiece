import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

function diffSnapshots(before: Record<string, unknown>, after: Record<string, unknown>) {
    const keys = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
    return keys
        .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
        .map((key) => ({ key, before: before[key] ?? null, after: after[key] ?? null }));
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;

        const { data, error } = await supabaseAdmin
            .from("blog_post_revisions")
            .select("id, post_id, save_type, snapshot, created_by, created_at")
            .eq("post_id", postId)
            .order("created_at", { ascending: false })
            .limit(100);

        if (error) throw error;

        return NextResponse.json({ revisions: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch revisions";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;
        const body = await req.json();
        const action = typeof body?.action === "string" ? body.action : "";

        if (action === "compare") {
            const leftId = typeof body?.left_revision_id === "string" ? body.left_revision_id : "";
            const rightId = typeof body?.right_revision_id === "string" ? body.right_revision_id : "";

            if (!leftId || !rightId) {
                return NextResponse.json({ error: "left_revision_id and right_revision_id are required" }, { status: 400 });
            }

            const { data, error } = await supabaseAdmin
                .from("blog_post_revisions")
                .select("id, snapshot, created_at, save_type")
                .eq("post_id", postId)
                .in("id", [leftId, rightId]);

            if (error) throw error;

            const left = (data ?? []).find((row) => row.id === leftId);
            const right = (data ?? []).find((row) => row.id === rightId);

            if (!left || !right) {
                return NextResponse.json({ error: "One or both revisions not found" }, { status: 404 });
            }

            const leftSnapshot = (left.snapshot ?? {}) as Record<string, unknown>;
            const rightSnapshot = (right.snapshot ?? {}) as Record<string, unknown>;

            return NextResponse.json({
                left,
                right,
                diff: diffSnapshots(leftSnapshot, rightSnapshot),
            });
        }

        if (action === "restore") {
            const revisionId = typeof body?.revision_id === "string" ? body.revision_id : "";
            if (!revisionId) {
                return NextResponse.json({ error: "revision_id is required" }, { status: 400 });
            }

            const { data: revision, error: revisionError } = await supabaseAdmin
                .from("blog_post_revisions")
                .select("id, snapshot")
                .eq("post_id", postId)
                .eq("id", revisionId)
                .single();

            if (revisionError) throw revisionError;

            const snapshot = (revision.snapshot ?? {}) as Record<string, unknown>;

            // Prevent accidental ID replacement from snapshots.
            const { id: _ignoreId, created_at: _ignoreCreatedAt, updated_at: _ignoreUpdatedAt, ...rest } = snapshot;

            const { data: restoredPost, error: restoreError } = await supabaseAdmin
                .from("blog_posts")
                .update(rest)
                .eq("id", postId)
                .select("*")
                .single();

            if (restoreError) throw restoreError;

            const { error: insertRevisionError } = await supabaseAdmin
                .from("blog_post_revisions")
                .insert({
                    post_id: postId,
                    save_type: "restore",
                    snapshot: restoredPost,
                });

            if (insertRevisionError) throw insertRevisionError;

            return NextResponse.json({ post: restoredPost, restored_from_revision_id: revisionId });
        }

        return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to process revision action";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
