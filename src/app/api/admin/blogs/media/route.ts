import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { cleanString, toNumber } from "@/lib/blogs";

const DEFAULT_MAX_MB = 10;
const BUCKET_NAME = "blog-media";
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

type VariantInfo = {
    path: string;
    url: string;
    width: number | null;
    height: number | null;
};

const VARIANT_SIZES = [
    { key: "thumbnail", width: 200 },
    { key: "medium", width: 800 },
    { key: "large", width: 1600 },
];

function safeFileStem(fileName: string) {
    const parts = fileName.split(".");
    const raw = parts.length > 1 ? parts.slice(0, -1).join(".") : fileName;
    return raw.replace(/[^a-zA-Z0-9-_.]/g, "-").toLowerCase();
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, toNumber(searchParams.get("page"), 1));
        const limit = Math.min(100, Math.max(1, toNumber(searchParams.get("limit"), 24)));
        const search = cleanString(searchParams.get("search"));
        const dateFrom = cleanString(searchParams.get("dateFrom"));
        const dateTo = cleanString(searchParams.get("dateTo"));
        const id = cleanString(searchParams.get("id"));

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabaseAdmin
            .from("blog_media_library")
            .select("id, file_name, bucket_path, public_url, mime_type, file_size_bytes, width, height, alt_text, variants, created_at", { count: "exact" })
            .order("created_at", { ascending: false })
            .range(from, to);

        if (search) {
            const safeSearch = search.replace(/,/g, "").replace(/%/g, "");
            query = query.or([`file_name.ilike.%${safeSearch}%`, `alt_text.ilike.%${safeSearch}%`].join(","));
        }

        if (dateFrom) {
            query = query.gte("created_at", `${dateFrom}T00:00:00`);
        }

        if (dateTo) {
            query = query.lte("created_at", `${dateTo}T23:59:59`);
        }

        if (id) {
            query = query.eq("id", id);
        }

        const { data, count, error } = await query;
        if (error) throw error;

        const total = count ?? 0;
        const totalPages = Math.max(1, Math.ceil(total / limit));

        return NextResponse.json({
            media: data ?? [],
            page,
            limit,
            total,
            total_pages: totalPages,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load media";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";
        if (!contentType.includes("multipart/form-data")) {
            return NextResponse.json({ error: "multipart/form-data is required." }, { status: 400 });
        }

        const formData = await req.formData();
        const file = formData.get("file");
        const altText = cleanString(formData.get("alt_text"));

        if (!(file instanceof File)) {
            return NextResponse.json({ error: "Missing file for upload." }, { status: 400 });
        }

        const maxMb = toNumber(process.env.BLOG_MEDIA_MAX_MB, DEFAULT_MAX_MB) || DEFAULT_MAX_MB;
        const maxBytes = maxMb * 1024 * 1024;

        if (file.size > maxBytes) {
            return NextResponse.json({ error: `File exceeds ${maxMb} MB limit.` }, { status: 400 });
        }

        if (!ALLOWED_MIME_TYPES.includes(file.type)) {
            return NextResponse.json({ error: "Only JPG, PNG, and WebP files are allowed." }, { status: 400 });
        }

        const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
        const safeExt = (ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
        const baseName = safeFileStem(file.name);
        const filePath = `blogs/${Date.now()}-${baseName}`;
        const storagePath = `${filePath}.${safeExt}`;

        const buffer = Buffer.from(await file.arrayBuffer());
        const metadata = await sharp(buffer).metadata();

        const { error: uploadError } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(storagePath, buffer, {
                upsert: false,
                contentType: file.type || "application/octet-stream",
            });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabaseAdmin.storage
            .from(BUCKET_NAME)
            .getPublicUrl(storagePath);

        const variants: Record<string, VariantInfo> = {};

        for (const variant of VARIANT_SIZES) {
            try {
                const variantBuffer = await sharp(buffer)
                    .resize({ width: variant.width, withoutEnlargement: true })
                    .toBuffer();
                const variantMeta = await sharp(variantBuffer).metadata();
                const variantPath = `${filePath}_${variant.key}.${safeExt}`;

                const { error: variantUploadError } = await supabaseAdmin.storage
                    .from(BUCKET_NAME)
                    .upload(variantPath, variantBuffer, {
                        upsert: false,
                        contentType: file.type || "application/octet-stream",
                    });

                if (variantUploadError) throw variantUploadError;

                const { data: variantUrlData } = supabaseAdmin.storage
                    .from(BUCKET_NAME)
                    .getPublicUrl(variantPath);

                variants[variant.key] = {
                    path: variantPath,
                    url: variantUrlData.publicUrl,
                    width: variantMeta.width ?? null,
                    height: variantMeta.height ?? null,
                };
            } catch {
                // Best-effort variant generation; skip failures.
            }
        }

        const { data: mediaItem, error: insertError } = await supabaseAdmin
            .from("blog_media_library")
            .insert({
                file_name: file.name,
                bucket_path: storagePath,
                public_url: publicUrlData.publicUrl,
                mime_type: file.type || null,
                file_size_bytes: file.size,
                width: metadata.width ?? null,
                height: metadata.height ?? null,
                alt_text: altText || null,
                variants,
            })
            .select("*")
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({ media: mediaItem }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to upload media";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const id = cleanString(body?.id);
        if (!id) return NextResponse.json({ error: "Media id is required." }, { status: 400 });

        const altText = typeof body?.alt_text === "string" ? body.alt_text.trim() : "";

        const { data, error } = await supabaseAdmin
            .from("blog_media_library")
            .update({ alt_text: altText || null })
            .eq("id", id)
            .select("*")
            .single();

        if (error) throw error;

        return NextResponse.json({ media: data });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update media";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const body = await req.json();
        const id = cleanString(body?.id);
        if (!id) return NextResponse.json({ error: "Media id is required." }, { status: 400 });

        const { data: media, error: mediaError } = await supabaseAdmin
            .from("blog_media_library")
            .select("id, bucket_path, variants")
            .eq("id", id)
            .single();

        if (mediaError) throw mediaError;

        const { data: usage, error: usageError } = await supabaseAdmin
            .from("blog_posts")
            .select("id")
            .or([`cover_media_id.eq.${id}`, `seo_og_image_media_id.eq.${id}`].join(","))
            .eq("status", "published")
            .limit(1);

        if (usageError) throw usageError;

        if (usage && usage.length > 0) {
            return NextResponse.json({ error: "Media is used in a published post." }, { status: 409 });
        }

        const { error: deleteRowError } = await supabaseAdmin
            .from("blog_media_library")
            .delete()
            .eq("id", id);

        if (deleteRowError) throw deleteRowError;

        if (media?.bucket_path) {
            await supabaseAdmin.storage.from(BUCKET_NAME).remove([media.bucket_path]);
        }

        const variantPaths = Object.values((media?.variants ?? {}) as Record<string, VariantInfo>)
            .map((variant) => variant?.path)
            .filter((path): path is string => Boolean(path));

        if (variantPaths.length > 0) {
            await supabaseAdmin.storage.from(BUCKET_NAME).remove(variantPaths);
        }

        return NextResponse.json({ success: true, id });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete media";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
