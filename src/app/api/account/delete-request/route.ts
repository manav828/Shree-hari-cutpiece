import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/apiAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function POST(req: NextRequest) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
        const reason = typeof body.reason === "string" ? body.reason.trim() : "";

        const dateStr = new Date().toISOString();
        const note = reason
            ? `Account soft-deleted by customer. Reason: ${reason}`
            : "Account soft-deleted by customer.";

        // 1. Log the support contact/deletion event
        const { error: logError } = await supabaseAdmin
            .from("customer_interaction_logs")
            .insert([
                {
                    user_id: userId,
                    event_type: "support_contact",
                    note,
                    event_data: {
                        request_type: "account_delete",
                        created_from: "account_profile_page",
                        timestamp: dateStr,
                    },
                },
                {
                    user_id: userId,
                    event_type: "status_changed",
                    note: "Account status changed to deleted. Profile anonymized.",
                    event_data: {
                        previous_status: "active",
                        new_status: "deleted",
                        timestamp: dateStr,
                    }
                }
            ]);

        if (logError) throw logError;

        // 2. Anonymize user profile & set status to deleted
        const { error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .update({
                full_name: "Deleted User",
                phone: "",
                avatar_url: null,
                newsletter_opt_in: false,
                sms_opt_in: false,
                marketing_opt_in: false,
                account_status: "deleted",
                preferred_language: "en",
                internal_notes: `Soft-deleted on ${dateStr}.${reason ? ` Reason: ${reason}` : ""}`,
                updated_at: dateStr,
            })
            .eq("id", userId);

        if (profileError) throw profileError;

        // 3. Soft-delete user addresses
        const { error: addressError } = await supabaseAdmin
            .from("user_addresses")
            .update({ is_deleted: true, updated_at: dateStr })
            .eq("user_id", userId);

        // We don't fail if they had no addresses, but if there's database error we throw
        if (addressError) throw addressError;

        // 4. Anonymize Auth User email & update password/metadata to prevent subsequent login
        const tempEmail = `deleted-${userId}@ecomshrihari.local`;
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email: tempEmail,
            email_confirm: true,
            password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10),
            user_metadata: { role: "deleted", deleted_at: dateStr },
            app_metadata: { role: "deleted" },
        });

        if (authError) throw authError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to perform account deletion";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

