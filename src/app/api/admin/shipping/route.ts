import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { encrypt } from "@/lib/shipping/encryption";

export const runtime = "nodejs";

const SETTING_KEYS = [
    "shipping_provider",
    "shipping_shiprocket_email",
    "shipping_shiprocket_password",
    "shipping_delhivery_token",
    "shipping_delhivery_sandbox",
    "shipping_default_fee",
    "shipping_free_threshold",
    "shipping_cod_fee",
    "shipping_cod_advance_type",
    "shipping_cod_advance_value",
    "shipping_cod_available",
    "shipping_state_groups",
    "tax_mode",
    "tax_rate"
];

export async function GET() {
    try {
        const { data: dbSettings, error: dbError } = await supabaseAdmin
            .from("site_settings")
            .select("key, value")
            .in("key", SETTING_KEYS);

        if (dbError) throw dbError;

        const settingsMap: Record<string, string> = (dbSettings ?? []).reduce<Record<string, string>>((acc, row) => {
            let val = row.value;
            if (typeof val === "string") {
                try {
                    val = JSON.parse(val);
                } catch {
                    // Fallback
                }
            }
            acc[row.key] = String(val ?? "");
            return acc;
        }, {});

        const responseData = {
            provider: settingsMap["shipping_provider"] || "manual",
            shiprocketEmail: settingsMap["shipping_shiprocket_email"] || "",
            shiprocketPassword: settingsMap["shipping_shiprocket_password"] ? "••••••••••••" : "",
            delhiveryToken: settingsMap["shipping_delhivery_token"] ? "••••••••••••" : "",
            delhiverySandbox: settingsMap["shipping_delhivery_sandbox"] === "true",
            defaultFee: settingsMap["shipping_default_fee"] || "99",
            freeThreshold: settingsMap["shipping_free_threshold"] || "999",
            codFee: settingsMap["shipping_cod_fee"] || "0",
            codAdvanceType: settingsMap["shipping_cod_advance_type"] || "none",
            codAdvanceValue: settingsMap["shipping_cod_advance_value"] || "0",
            codAvailable: settingsMap["shipping_cod_available"] !== "false", // default to true if not set
            stateGroups: settingsMap["shipping_state_groups"] || "[]",
            taxMode: settingsMap["tax_mode"] || "none",
            taxRate: settingsMap["tax_rate"] || "0",
        };

        return NextResponse.json(responseData);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        
        const upserts: Array<{ key: string; value: string }> = [];

        if (body.provider !== undefined) {
            upserts.push({ key: "shipping_provider", value: JSON.stringify(body.provider) });
        }

        if (body.shiprocketEmail !== undefined) {
            upserts.push({ key: "shipping_shiprocket_email", value: JSON.stringify(body.shiprocketEmail) });
        }

        if (body.shiprocketPassword !== undefined && body.shiprocketPassword !== "••••••••••••") {
            const encrypted = encrypt(body.shiprocketPassword);
            upserts.push({ key: "shipping_shiprocket_password", value: JSON.stringify(encrypted) });
        }

        if (body.delhiveryToken !== undefined && body.delhiveryToken !== "••••••••••••") {
            const encrypted = encrypt(body.delhiveryToken);
            upserts.push({ key: "shipping_delhivery_token", value: JSON.stringify(encrypted) });
        }

        if (body.delhiverySandbox !== undefined) {
            upserts.push({ key: "shipping_delhivery_sandbox", value: JSON.stringify(String(body.delhiverySandbox)) });
        }

        if (body.defaultFee !== undefined) {
            upserts.push({ key: "shipping_default_fee", value: JSON.stringify(String(body.defaultFee)) });
        }

        if (body.freeThreshold !== undefined) {
            upserts.push({ key: "shipping_free_threshold", value: JSON.stringify(String(body.freeThreshold)) });
        }

        if (body.codFee !== undefined) {
            upserts.push({ key: "shipping_cod_fee", value: JSON.stringify(String(body.codFee)) });
        }

        if (body.codAdvanceType !== undefined) {
            upserts.push({ key: "shipping_cod_advance_type", value: JSON.stringify(String(body.codAdvanceType)) });
        }

        if (body.codAdvanceValue !== undefined) {
            upserts.push({ key: "shipping_cod_advance_value", value: JSON.stringify(String(body.codAdvanceValue)) });
        }

        if (body.codAvailable !== undefined) {
            upserts.push({ key: "shipping_cod_available", value: JSON.stringify(String(body.codAvailable)) });
        }

        if (body.stateGroups !== undefined) {
            upserts.push({
                key: "shipping_state_groups",
                value: typeof body.stateGroups === "string" ? body.stateGroups : JSON.stringify(body.stateGroups)
            });
        }

        if (body.taxMode !== undefined) {
            upserts.push({ key: "tax_mode", value: JSON.stringify(String(body.taxMode)) });
        }

        if (body.taxRate !== undefined) {
            upserts.push({ key: "tax_rate", value: JSON.stringify(String(body.taxRate)) });
        }

        if (upserts.length > 0) {
            const { error } = await supabaseAdmin
                .from("site_settings")
                .upsert(upserts, { onConflict: "key" });

            if (error) throw error;
        }

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

