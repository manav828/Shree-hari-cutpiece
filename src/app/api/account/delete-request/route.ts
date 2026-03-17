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

        const note = reason
            ? `Account deletion requested by customer. Reason: ${reason}`
            : "Account deletion requested by customer.";

        const { error: logError } = await supabaseAdmin
            .from("customer_interaction_logs")
            .insert({
                user_id: userId,
                event_type: "support_contact",
                note,
                event_data: {
                    request_type: "account_delete",
                    created_from: "account_profile_page",
                },
            });

        if (logError) throw logError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to submit delete request";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
