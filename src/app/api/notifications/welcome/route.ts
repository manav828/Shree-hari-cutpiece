import { NextRequest, NextResponse } from "next/server";
import { triggerRegistrationNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, phone, name } = body;

        if (!email) {
            return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });
        }

        const res = await triggerRegistrationNotification(name || "Customer", email, phone);
        return NextResponse.json(res);
    } catch (err: any) {
        console.error("Error in welcome notification API route:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
