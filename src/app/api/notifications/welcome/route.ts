import { NextRequest, NextResponse } from "next/server";
import { triggerRegistrationNotification } from "@/lib/notifications";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, phone, name, userId } = body;

        if (!email || !userId) {
            return NextResponse.json({ success: false, error: "Email and userId are required" }, { status: 400 });
        }

        // Security Gate: Verify user exists and account was created recently (last 15 minutes)
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (authError || !authData?.user) {
            return NextResponse.json({ success: false, error: "Access denied. User account not found." }, { status: 403 });
        }

        // Validate that request email matches user record email
        if (authData.user.email !== email) {
            return NextResponse.json({ success: false, error: "Access denied. Email mismatch." }, { status: 403 });
        }

        const createdAt = new Date(authData.user.created_at);
        const timeDiff = Date.now() - createdAt.getTime();
        const fifteenMinutes = 15 * 60 * 1000;

        if (timeDiff > fifteenMinutes) {
            return NextResponse.json({ success: false, error: "Access denied. Welcome window expired." }, { status: 403 });
        }

        const res = await triggerRegistrationNotification(name || "Customer", email, phone);
        return NextResponse.json(res);
    } catch (err: any) {
        console.error("Error in welcome notification API route:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
