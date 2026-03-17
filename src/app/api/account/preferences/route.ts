import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/apiAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET(req: NextRequest) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { data, error: prefsError } = await supabaseAdmin
            .from("user_profiles")
            .select("newsletter_opt_in, marketing_opt_in, sms_opt_in, preferred_language")
            .eq("id", userId)
            .maybeSingle();

        if (prefsError) throw prefsError;

        return NextResponse.json({
            preferences: {
                newsletter_opt_in: Boolean(data?.newsletter_opt_in ?? true),
                marketing_opt_in: Boolean(data?.marketing_opt_in ?? true),
                sms_opt_in: Boolean(data?.sms_opt_in ?? false),
                preferred_language: String(data?.preferred_language ?? "en"),
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch preferences";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const body = (await req.json()) as Record<string, unknown>;

        const updates = {
            id: userId,
            newsletter_opt_in: Boolean(body.newsletter_opt_in),
            marketing_opt_in: Boolean(body.marketing_opt_in),
            sms_opt_in: Boolean(body.sms_opt_in),
            preferred_language: typeof body.preferred_language === "string" && body.preferred_language.trim()
                ? body.preferred_language.trim()
                : "en",
            updated_at: new Date().toISOString(),
        };

        const { error: updateError } = await supabaseAdmin
            .from("user_profiles")
            .upsert(updates, { onConflict: "id" });

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update preferences";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
