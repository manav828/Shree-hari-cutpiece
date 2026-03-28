import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { cleanString, slugify } from "@/lib/blogs";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("blog_tags")
            .select("id, name, slug, created_at, updated_at")
            .order("name", { ascending: true });

        if (error) throw error;
        return NextResponse.json({ tags: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch blog tags";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const action = cleanString(body?.action || "create");

        if (action === "create") {
            const name = cleanString(body?.name);
            if (!name) return NextResponse.json({ error: "Tag name is required." }, { status: 400 });

            const slug = cleanString(body?.slug) || slugify(name);
            if (!slug) return NextResponse.json({ error: "Tag slug is required." }, { status: 400 });

            const { data, error } = await supabaseAdmin
                .from("blog_tags")
                .insert({ name, slug })
                .select("*")
                .single();

            if (error) throw error;
            return NextResponse.json({ tag: data }, { status: 201 });
        }

        if (action === "update") {
            const id = cleanString(body?.id);
            if (!id) return NextResponse.json({ error: "Tag id is required." }, { status: 400 });

            const patch = {
                name: cleanString(body?.name) || undefined,
                slug: cleanString(body?.slug) || undefined,
            } as Record<string, unknown>;

            Object.keys(patch).forEach((key) => {
                if (typeof patch[key] === "undefined") delete patch[key];
            });

            const { data, error } = await supabaseAdmin
                .from("blog_tags")
                .update(patch)
                .eq("id", id)
                .select("*")
                .single();

            if (error) throw error;
            return NextResponse.json({ tag: data });
        }

        return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upsert blog tag";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
