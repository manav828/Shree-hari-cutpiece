import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { cleanNullableString, cleanString, slugify, toBoolean, toNumber } from "@/lib/blogs";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("blog_categories")
            .select("id, name, slug, description, is_active, sort_order, created_at, updated_at")
            .order("sort_order", { ascending: true })
            .order("name", { ascending: true });

        if (error) throw error;
        return NextResponse.json({ categories: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch blog categories";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const action = cleanString(body?.action || "create");

        if (action === "create") {
            const name = cleanString(body?.name);
            if (!name) return NextResponse.json({ error: "Category name is required." }, { status: 400 });

            const slug = cleanString(body?.slug) || slugify(name);
            if (!slug) return NextResponse.json({ error: "Category slug is required." }, { status: 400 });

            const payload = {
                name,
                slug,
                description: cleanNullableString(body?.description),
                is_active: toBoolean(body?.is_active, true),
                sort_order: toNumber(body?.sort_order, 0),
            };

            const { data, error } = await supabaseAdmin
                .from("blog_categories")
                .insert(payload)
                .select("*")
                .single();

            if (error) throw error;
            return NextResponse.json({ category: data }, { status: 201 });
        }

        if (action === "update") {
            const id = cleanString(body?.id);
            if (!id) return NextResponse.json({ error: "Category id is required." }, { status: 400 });

            const patch = {
                name: cleanString(body?.name) || undefined,
                slug: cleanString(body?.slug) || undefined,
                description: typeof body?.description === "undefined" ? undefined : cleanNullableString(body?.description),
                is_active: typeof body?.is_active === "boolean" ? body.is_active : undefined,
                sort_order: typeof body?.sort_order === "undefined" ? undefined : toNumber(body.sort_order, 0),
            } as Record<string, unknown>;

            Object.keys(patch).forEach((key) => {
                if (typeof patch[key] === "undefined") delete patch[key];
            });

            const { data, error } = await supabaseAdmin
                .from("blog_categories")
                .update(patch)
                .eq("id", id)
                .select("*")
                .single();

            if (error) throw error;
            return NextResponse.json({ category: data });
        }

        return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upsert blog category";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
