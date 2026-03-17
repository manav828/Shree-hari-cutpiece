import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

const ALLOWED_EVENT_TYPES = [
    "note_added",
    "support_contact",
    "status_changed",
    "email_sent",
    "order_placed",
] as const;

type AllowedEventType = (typeof ALLOWED_EVENT_TYPES)[number];

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const customerId = params.id;
        const body = await req.json();

        const note = typeof body.note === "string" ? body.note.trim() : "";
        if (!note) {
            return NextResponse.json({ error: "Note is required." }, { status: 400 });
        }

        const eventType: AllowedEventType = ALLOWED_EVENT_TYPES.includes(body.event_type)
            ? body.event_type
            : "note_added";

        const { data, error } = await supabaseAdmin
            .from("customer_interaction_logs")
            .insert({
                user_id: customerId,
                event_type: eventType,
                note,
            })
            .select("id, event_type, note, created_at, created_by")
            .single();

        if (error) throw error;

        return NextResponse.json({ interaction: data }, { status: 201 });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create note";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
