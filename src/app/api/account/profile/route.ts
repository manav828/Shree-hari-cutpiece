import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/apiAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { validateName, validatePhone } from "@/lib/validation";

export async function GET(req: NextRequest) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const authUserRes = await supabaseAdmin.auth.admin.getUserById(userId);
        const email = authUserRes.data.user?.email ?? "";

        const { data, error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .select("id, full_name, phone, internal_notes, account_status, created_at, updated_at")
            .eq("id", userId)
            .maybeSingle();

        if (profileError) throw profileError;

        return NextResponse.json({
            profile: {
                id: userId,
                email,
                full_name: data?.full_name ?? "",
                phone: data?.phone ?? "",
                account_status: data?.account_status ?? "active",
                created_at: data?.created_at ?? null,
                updated_at: data?.updated_at ?? null,
            },
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch profile";
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
        const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
        const phone = typeof body.phone === "string" ? body.phone.trim() : "";

        if (!fullName) {
            return NextResponse.json({ error: "Full name is required" }, { status: 400 });
        }

        const nameErr = validateName(fullName);
        if (nameErr) {
            return NextResponse.json({ error: nameErr }, { status: 400 });
        }

        if (phone) {
            const phoneErr = validatePhone(phone);
            if (phoneErr) {
                return NextResponse.json({ error: phoneErr }, { status: 400 });
            }
        }

        const { error: updateError } = await supabaseAdmin
            .from("user_profiles")
            .upsert({
                id: userId,
                full_name: fullName,
                phone,
                updated_at: new Date().toISOString(),
            }, { onConflict: "id" });

        if (updateError) throw updateError;

        // Also update profiles table to keep both in sync
        const { error: profilesUpdateError } = await supabaseAdmin
            .from("profiles")
            .upsert({
                id: userId,
                full_name: fullName,
                phone,
            }, { onConflict: "id" });

        if (profilesUpdateError) throw profilesUpdateError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update profile";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
