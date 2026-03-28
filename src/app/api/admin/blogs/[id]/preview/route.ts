import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

function buildPreviewToken(): string {
    return randomBytes(24).toString("hex");
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;
        const body = await req.json().catch(() => ({}));
        const expiresInHours = Number(body?.expires_in_hours || 48);
        const ttlHours = Number.isFinite(expiresInHours) ? Math.min(Math.max(expiresInHours, 1), 168) : 48;

        const token = buildPreviewToken();
        const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000).toISOString();

        const { error } = await supabaseAdmin.from("blog_preview_tokens").insert({
            post_id: postId,
            token,
            expires_at: expiresAt,
        });

        if (error) throw error;

        const origin = new URL(req.url).origin;
        const previewUrl = `${origin}/api/admin/blogs/${postId}/preview?token=${token}`;

        return NextResponse.json({
            post_id: postId,
            token,
            expires_at: expiresAt,
            preview_url: previewUrl,
        }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to generate preview token";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const postId = params.id;
        const { searchParams } = new URL(req.url);
        const token = (searchParams.get("token") || "").trim();

        if (!token) {
            return NextResponse.json({ error: "token is required" }, { status: 400 });
        }

        const { data: tokenRow, error: tokenError } = await supabaseAdmin
            .from("blog_preview_tokens")
            .select("id, post_id, token, expires_at")
            .eq("post_id", postId)
            .eq("token", token)
            .single();

        if (tokenError || !tokenRow) {
            return NextResponse.json({ error: "Invalid preview token" }, { status: 404 });
        }

        if (new Date(tokenRow.expires_at).getTime() < Date.now()) {
            return NextResponse.json({ error: "Preview token expired" }, { status: 410 });
        }

        const { data: post, error: postError } = await supabaseAdmin
            .from("blog_posts")
            .select("*")
            .eq("id", postId)
            .single();

        if (postError) throw postError;

        return NextResponse.json({ post, preview_valid_until: tokenRow.expires_at });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to validate preview token";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
