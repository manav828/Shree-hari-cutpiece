import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

type BannerPlacement = "announcement_bar" | "homepage_hero" | "shop_top" | "popup";

type BannerPayload = {
    id?: string;
    title: string;
    content_text?: string;
    image_url?: string;
    link_url?: string;
    placement: BannerPlacement;
    bg_color?: string;
    text_color?: string;
    is_active?: boolean;
    start_date?: string | null;
    end_date?: string | null;
    priority?: number;
};

const VALID_PLACEMENTS: BannerPlacement[] = ["announcement_bar", "homepage_hero", "shop_top", "popup"];

function isValidHexColor(value: string): boolean {
    return /^#[0-9A-Fa-f]{6}$/.test(value);
}

function isValidUrlLike(value: string): boolean {
    if (!value) return true;
    if (value.startsWith("/")) return true;
    try {
        const u = new URL(value);
        return ["http:", "https:"].includes(u.protocol);
    } catch {
        return false;
    }
}

function validateBannerPayload(payload: BannerPayload): string | null {
    if (!payload.title?.trim()) return "Banner title is required.";
    if (!VALID_PLACEMENTS.includes(payload.placement)) return "Invalid banner placement.";

    const bg = payload.bg_color ?? "#000000";
    const text = payload.text_color ?? "#FFFFFF";

    if (!isValidHexColor(bg)) return "Background color must be a valid hex color (#RRGGBB).";
    if (!isValidHexColor(text)) return "Text color must be a valid hex color (#RRGGBB).";

    if (!isValidUrlLike(payload.link_url ?? "")) {
        return "Link URL must be a valid URL or relative path.";
    }

    if (payload.start_date && payload.end_date) {
        const start = new Date(payload.start_date);
        const end = new Date(payload.end_date);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return "Invalid start or end date.";
        }
        if (end < start) {
            return "End date cannot be earlier than start date.";
        }
    }

    return null;
}

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("banners")
            .select("id, title, content_text, image_url, link_url, placement, bg_color, text_color, is_active, start_date, end_date, priority, deleted_at, created_at, updated_at")
            .is("deleted_at", null)
            .order("priority", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) throw error;

        return NextResponse.json({ banners: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load banners";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const action = String(formData.get("action") || "single-upload");

            if (action === "bulk-upload") {
                const fileEntries = formData.getAll("files");
                const files = fileEntries.filter((f): f is File => f instanceof File);

                if (files.length === 0) {
                    return NextResponse.json({ error: "No files provided for bulk upload." }, { status: 400 });
                }

                const imageUrls: string[] = [];
                const stamp = Date.now();

                for (let index = 0; index < files.length; index += 1) {
                    const file = files[index];
                    const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
                    const safeExt = (ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
                    const filePath = `banners/banner-${stamp}-${index + 1}.${safeExt}`;

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

                    imageUrls.push(publicUrlData.publicUrl);
                }

                return NextResponse.json({ success: true, imageUrls, count: imageUrls.length });
            }

            const file = formData.get("file");

            if (!(file instanceof File)) {
                return NextResponse.json({ error: "Missing file for image upload." }, { status: 400 });
            }

            const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
            const safeExt = (ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
            const filePath = `banners/banner-${Date.now()}.${safeExt}`;

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

        if (action === "bulk-create") {
            const banners = Array.isArray(body?.banners) ? (body.banners as BannerPayload[]) : [];

            if (banners.length === 0) {
                return NextResponse.json({ error: "No banners provided for bulk create." }, { status: 400 });
            }

            if (banners.length > 50) {
                return NextResponse.json({ error: "Maximum 50 banners allowed per bulk create." }, { status: 400 });
            }

            for (const banner of banners) {
                const validationError = validateBannerPayload(banner);
                if (validationError) {
                    return NextResponse.json({ error: validationError }, { status: 400 });
                }
            }

            const rows = banners.map((payload) => ({
                title: payload.title.trim(),
                content_text: payload.content_text?.trim() || null,
                image_url: payload.image_url?.trim() || null,
                link_url: payload.link_url?.trim() || null,
                placement: payload.placement,
                bg_color: payload.bg_color || "#000000",
                text_color: payload.text_color || "#FFFFFF",
                is_active: payload.is_active ?? true,
                start_date: payload.start_date || null,
                end_date: payload.end_date || null,
                priority: typeof payload.priority === "number" ? payload.priority : 0,
            }));

            const { error } = await supabaseAdmin
                .from("banners")
                .insert(rows);

            if (error) throw error;

            return NextResponse.json({ success: true, count: rows.length });
        }

        if (action === "soft-delete") {
            const id = String(body?.id || "");
            if (!id) {
                return NextResponse.json({ error: "Banner id is required." }, { status: 400 });
            }

            const { error } = await supabaseAdmin
                .from("banners")
                .update({ deleted_at: new Date().toISOString() })
                .eq("id", id)
                .is("deleted_at", null);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === "soft-delete-placement") {
            const placement = String(body?.placement || "") as BannerPlacement;
            if (!VALID_PLACEMENTS.includes(placement)) {
                return NextResponse.json({ error: "Valid placement is required." }, { status: 400 });
            }

            const { error } = await supabaseAdmin
                .from("banners")
                .update({ deleted_at: new Date().toISOString() })
                .eq("placement", placement)
                .is("deleted_at", null);

            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        const payload = body as BannerPayload;
        const validationError = validateBannerPayload(payload);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("banners")
            .insert({
                title: payload.title.trim(),
                content_text: payload.content_text?.trim() || null,
                image_url: payload.image_url?.trim() || null,
                link_url: payload.link_url?.trim() || null,
                placement: payload.placement,
                bg_color: payload.bg_color || "#000000",
                text_color: payload.text_color || "#FFFFFF",
                is_active: payload.is_active ?? true,
                start_date: payload.start_date || null,
                end_date: payload.end_date || null,
                priority: typeof payload.priority === "number" ? payload.priority : 0,
            });

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create banner";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const payload = await req.json() as BannerPayload & { action?: string };
        const action = String(payload.action || "");

        if (action === "set-placement-active") {
            const placement = String(payload.placement || "") as BannerPlacement;
            if (!VALID_PLACEMENTS.includes(placement)) {
                return NextResponse.json({ error: "Valid placement is required." }, { status: 400 });
            }

            const nextActive = payload.is_active ?? true;
            const { error } = await supabaseAdmin
                .from("banners")
                .update({ is_active: Boolean(nextActive) })
                .eq("placement", placement)
                .is("deleted_at", null);

            if (error) throw error;

            return NextResponse.json({ success: true });
        }

        const id = String(payload.id || "");

        if (!id) {
            return NextResponse.json({ error: "Banner id is required." }, { status: 400 });
        }

        const validationError = validateBannerPayload(payload);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("banners")
            .update({
                title: payload.title.trim(),
                content_text: payload.content_text?.trim() || null,
                image_url: payload.image_url?.trim() || null,
                link_url: payload.link_url?.trim() || null,
                placement: payload.placement,
                bg_color: payload.bg_color || "#000000",
                text_color: payload.text_color || "#FFFFFF",
                is_active: payload.is_active ?? true,
                start_date: payload.start_date || null,
                end_date: payload.end_date || null,
                priority: typeof payload.priority === "number" ? payload.priority : 0,
            })
            .eq("id", id)
            .is("deleted_at", null);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update banner";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
