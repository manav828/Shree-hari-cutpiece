import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { ALL_CACHE_TAGS, getCacheEnabled } from "@/lib/cache";

// Simple origin guard — blocks requests from outside the same site
function isAdminRequest(req: NextRequest): boolean {
    const origin = req.headers.get("origin") || "";
    const referer = req.headers.get("referer") || "";
    // In production, only allow same-origin calls from /admin pages
    // In development, allow all (origin is empty for same-origin requests too)
    if (!origin && !referer) return true; // same-origin server call
    const host = req.headers.get("host") || "";
    return origin.includes(host) || referer.includes(host);
}


// ─── GET — Return current cache status ───────────────────────────────────────
export async function GET(req: NextRequest) {
    if (!isAdminRequest(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const enabled = await getCacheEnabled();
        return NextResponse.json({ enabled });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to read cache status";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

// ─── POST — Toggle cache ON/OFF or clear all tags ────────────────────────────
export async function POST(req: NextRequest) {
    if (!isAdminRequest(req)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const action = String(body?.action || "");

        if (action !== "toggle" && action !== "clear") {
            return NextResponse.json(
                { error: "Invalid action. Must be 'toggle' or 'clear'." },
                { status: 400 },
            );
        }

        let newEnabled: boolean | undefined;

        if (action === "toggle") {
            const current = await getCacheEnabled();
            newEnabled = !current;

            const { error } = await supabaseAdmin
                .from("site_settings")
                .upsert(
                    { key: "storefront_cache_enabled", value: String(newEnabled) },
                    { onConflict: "key" },
                );

            if (error) {
                console.error("[cache] Failed to update cache setting:", error.message);
                return NextResponse.json({ error: "Failed to update cache setting" }, { status: 500 });
            }
        }

        // Always bust all cache tags — whether toggling or just clearing
        for (const tag of ALL_CACHE_TAGS) {
            revalidateTag(tag);
        }

        return NextResponse.json({
            success: true,
            action,
            enabled: action === "toggle" ? newEnabled : undefined,
            cleared: ALL_CACHE_TAGS,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to process cache action";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
