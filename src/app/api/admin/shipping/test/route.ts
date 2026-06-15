import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { decrypt } from "@/lib/shipping/encryption";
import { ShiprocketService } from "@/lib/shipping/ShiprocketService";
import { DelhiveryService } from "@/lib/shipping/DelhiveryService";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const { provider } = body;

        if (provider === "shiprocket") {
            const email = body.shiprocketEmail || "";
            let password = body.shiprocketPassword || "";

            if (password === "••••••••••••") {
                const { data, error } = await supabaseAdmin
                    .from("site_settings")
                    .select("value")
                    .eq("key", "shipping_shiprocket_password")
                    .single();

                if (error || !data) {
                    return NextResponse.json({ success: false, error: "No password stored in database to test." }, { status: 400 });
                }

                let val = data.value;
                if (typeof val === "string") {
                    try { val = JSON.parse(val); } catch {}
                }
                password = decrypt(String(val ?? ""));
            }

            if (!email || !password) {
                return NextResponse.json({ success: false, error: "Email and password are required for Shiprocket testing." }, { status: 400 });
            }

            const service = new ShiprocketService({ email, password });
            const success = await service.testCredentials();
            if (success) {
                return NextResponse.json({ success: true, message: "Successfully authenticated with Shiprocket API." });
            } else {
                return NextResponse.json({ success: false, error: "Authentication failed. Please verify your email and password." });
            }
        } 
        
        if (provider === "delhivery") {
            let token = body.delhiveryToken || "";
            const sandbox = body.delhiverySandbox === true;

            if (token === "••••••••••••") {
                const { data, error } = await supabaseAdmin
                    .from("site_settings")
                    .select("value")
                    .eq("key", "shipping_delhivery_token")
                    .single();

                if (error || !data) {
                    return NextResponse.json({ success: false, error: "No token stored in database to test." }, { status: 400 });
                }

                let val = data.value;
                if (typeof val === "string") {
                    try { val = JSON.parse(val); } catch {}
                }
                token = decrypt(String(val ?? ""));
            }

            if (!token) {
                return NextResponse.json({ success: false, error: "Token is required for Delhivery testing." }, { status: 400 });
            }

            const service = new DelhiveryService({ token, sandbox });
            const success = await service.testCredentials();
            if (success) {
                return NextResponse.json({ success: true, message: "Successfully authenticated with Delhivery API." });
            } else {
                return NextResponse.json({ success: false, error: "Authentication failed. Please verify your token." });
            }
        }

        return NextResponse.json({ success: false, error: "Invalid provider selected." }, { status: 400 });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
