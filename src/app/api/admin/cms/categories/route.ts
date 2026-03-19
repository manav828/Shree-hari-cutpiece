import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

type CategoryPayload = {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    is_active?: boolean;
    sort_order?: number;
};

function slugify(input: string): string {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

function isValidSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug);
}

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("categories")
            .select("id, name, slug, description, image, sort_order, is_active, deleted_at, created_at, updated_at")
            .is("deleted_at", null)
            .order("sort_order", { ascending: true });

        if (error) throw error;

        return NextResponse.json({ categories: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load categories";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file");

            if (!(file instanceof File)) {
                return NextResponse.json({ error: "Missing file for image upload." }, { status: 400 });
            }

            const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
            const safeExt = (ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
            const filePath = `categories/category-${Date.now()}.${safeExt}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from("cms-assets")
                .upload(filePath, file, {
                    upsert: false,
                    contentType: file.type || "application/octet-stream",
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabaseAdmin.storage
                .from("cms-assets")
                .getPublicUrl(filePath);

            return NextResponse.json({ success: true, imageUrl: publicUrlData.publicUrl });
        }

        const body = await req.json();
        const action = String(body?.action || "create");

        if (action === "reorder") {
            const sourceId = String(body?.sourceId || "");
            const targetId = String(body?.targetId || "");

            if (!sourceId || !targetId) {
                return NextResponse.json({ error: "sourceId and targetId are required." }, { status: 400 });
            }

            const { data: rows, error: loadError } = await supabaseAdmin
                .from("categories")
                .select("id, sort_order")
                .in("id", [sourceId, targetId])
                .is("deleted_at", null);

            if (loadError) throw loadError;
            if (!rows || rows.length !== 2) {
                return NextResponse.json({ error: "Categories not found for reorder." }, { status: 404 });
            }

            const source = rows.find((r) => r.id === sourceId);
            const target = rows.find((r) => r.id === targetId);

            if (!source || !target) {
                return NextResponse.json({ error: "Invalid reorder selection." }, { status: 400 });
            }

            const { error: updateSourceError } = await supabaseAdmin
                .from("categories")
                .update({ sort_order: target.sort_order })
                .eq("id", source.id);

            if (updateSourceError) throw updateSourceError;

            const { error: updateTargetError } = await supabaseAdmin
                .from("categories")
                .update({ sort_order: source.sort_order })
                .eq("id", target.id);

            if (updateTargetError) throw updateTargetError;

            return NextResponse.json({ success: true });
        }

        if (action === "soft-delete") {
            const id = String(body?.id || "");
            if (!id) {
                return NextResponse.json({ error: "Category id is required." }, { status: 400 });
            }

            const { error } = await supabaseAdmin
                .from("categories")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id)
                .is("deleted_at", null);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        const payload = body as CategoryPayload;
        const name = String(payload.name || "").trim();
        const rawSlug = String(payload.slug || "").trim();
        const slug = rawSlug ? slugify(rawSlug) : slugify(name);

        if (!name) {
            return NextResponse.json({ error: "Category name is required." }, { status: 400 });
        }

        if (!slug || !isValidSlug(slug)) {
            return NextResponse.json({ error: "Slug must contain only lowercase letters, numbers, and hyphens." }, { status: 400 });
        }

        const { data: existing, error: existingError } = await supabaseAdmin
            .from("categories")
            .select("id")
            .eq("slug", slug)
            .is("deleted_at", null)
            .maybeSingle();

        if (existingError) throw existingError;
        if (existing) {
            return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
        }

        const { data: maxRow, error: maxError } = await supabaseAdmin
            .from("categories")
            .select("sort_order")
            .is("deleted_at", null)
            .order("sort_order", { ascending: false })
            .limit(1)
            .maybeSingle();

        if (maxError) throw maxError;

        const { error } = await supabaseAdmin
            .from("categories")
            .insert({
                name,
                slug,
                description: payload.description?.trim() || null,
                image: payload.image || null,
                is_active: payload.is_active ?? true,
                sort_order: typeof payload.sort_order === "number" ? payload.sort_order : ((maxRow?.sort_order ?? -1) + 1),
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save category";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const payload = await req.json() as CategoryPayload;
        const id = String(payload.id || "");
        const name = String(payload.name || "").trim();
        const rawSlug = String(payload.slug || "").trim();
        const slug = rawSlug ? slugify(rawSlug) : slugify(name);

        if (!id) {
            return NextResponse.json({ error: "Category id is required." }, { status: 400 });
        }

        if (!name) {
            return NextResponse.json({ error: "Category name is required." }, { status: 400 });
        }

        if (!slug || !isValidSlug(slug)) {
            return NextResponse.json({ error: "Slug must contain only lowercase letters, numbers, and hyphens." }, { status: 400 });
        }

        const { data: existing, error: existingError } = await supabaseAdmin
            .from("categories")
            .select("id")
            .eq("slug", slug)
            .neq("id", id)
            .is("deleted_at", null)
            .maybeSingle();

        if (existingError) throw existingError;
        if (existing) {
            return NextResponse.json({ error: "Slug already exists." }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("categories")
            .update({
                name,
                slug,
                description: payload.description?.trim() || null,
                image: payload.image || null,
                is_active: payload.is_active ?? true,
            })
            .eq("id", id)
            .is("deleted_at", null);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update category";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
