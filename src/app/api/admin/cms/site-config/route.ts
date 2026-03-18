import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

type ConfigUpdate = {
    key: string;
    value: string;
    type: "text" | "textarea" | "number" | "url";
    label?: string;
    group?: string;
    required?: boolean;
};

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

function validateUpdates(updates: ConfigUpdate[]): string | null {
    for (const item of updates) {
        if (!item.key?.trim()) return "Every update must include a key.";

        const v = (item.value ?? "").trim();
        if (item.required && !v) {
            return `Field ${item.key} is required.`;
        }

        if (item.type === "url" && v && !isValidUrlLike(v)) {
            return `Field ${item.key} must be a valid URL or relative path.`;
        }
    }

    return null;
}

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from("site_config")
            .select("key, value, label, group, type, updated_at");

        if (error) throw error;

        const map = (data ?? []).reduce<Record<string, string>>((acc, row) => {
            acc[row.key] = row.value ?? "";
            return acc;
        }, {});

        return NextResponse.json({ items: data ?? [], map });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load site config";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";

        // Multipart upload for image fields.
        if (contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            const file = formData.get("file");
            const key = String(formData.get("key") || "").trim();
            const group = String(formData.get("group") || "misc").trim();
            const label = String(formData.get("label") || key);

            if (!key) {
                return NextResponse.json({ error: "Missing key for image upload." }, { status: 400 });
            }

            if (!(file instanceof File)) {
                return NextResponse.json({ error: "Missing file for image upload." }, { status: 400 });
            }

            const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
            const safeExt = (ext || "jpg").replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
            const filePath = `${group}/${key}-${Date.now()}.${safeExt}`;

            const { error: uploadError } = await supabaseAdmin.storage
                .from("cms-assets")
                .upload(filePath, file, {
                    upsert: false,
                    contentType: file.type || "application/octet-stream",
                });

            if (uploadError) {
                throw uploadError;
            }

            const { data: publicUrlData } = supabaseAdmin.storage
                .from("cms-assets")
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            const { error: upsertError } = await supabaseAdmin
                .from("site_config")
                .upsert(
                    {
                        key,
                        value: publicUrl,
                        label,
                        group,
                        type: "url",
                    },
                    { onConflict: "key" },
                );

            if (upsertError) throw upsertError;

            return NextResponse.json({ success: true, key, value: publicUrl });
        }

        // JSON upsert for text/url fields.
        const body = await req.json();
        const updates = (body?.updates ?? []) as ConfigUpdate[];

        if (!Array.isArray(updates) || updates.length === 0) {
            return NextResponse.json({ error: "No updates provided." }, { status: 400 });
        }

        const validationError = validateUpdates(updates);
        if (validationError) {
            return NextResponse.json({ error: validationError }, { status: 400 });
        }

        const payload = updates.map((u) => ({
            key: u.key.trim(),
            value: u.value ?? "",
            label: u.label ?? u.key,
            group: u.group ?? "misc",
            type: u.type,
        }));

        const { error } = await supabaseAdmin
            .from("site_config")
            .upsert(payload, { onConflict: "key" });

        if (error) throw error;

        return NextResponse.json({ success: true, count: payload.length });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to save site config";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
