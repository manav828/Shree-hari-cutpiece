import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type GatewayField = {
  key: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
};

type GatewayConfig = {
  id: string;
  name: string;
  description: string;
  isEnabledKey: string;
  fields: GatewayField[];
};

export async function GET() {
  try {
    const basePaymentsDir = path.join(process.cwd(), "src", "payments");
    
    if (!fs.existsSync(basePaymentsDir)) {
      return NextResponse.json({ gateways: [] });
    }

    const directories = fs.readdirSync(basePaymentsDir).filter((file) => {
      const fullPath = path.join(basePaymentsDir, file);
      return fs.statSync(fullPath).isDirectory();
    });

    const gateways: any[] = [];
    const dbKeysToFetch: string[] = [];
    const configs: GatewayConfig[] = [];

    for (const dir of directories) {
      const configPath = path.join(basePaymentsDir, dir, "config.json");
      if (fs.existsSync(configPath)) {
        try {
          const configContent = fs.readFileSync(configPath, "utf8");
          const config = JSON.parse(configContent) as GatewayConfig;
          configs.push(config);
          dbKeysToFetch.push(config.isEnabledKey);
          
          if (config.fields && Array.isArray(config.fields)) {
            for (const f of config.fields) {
              dbKeysToFetch.push(f.key);
            }
          }
        } catch (e) {
          console.error(`Error loading payment config for admin settings, directory ${dir}:`, e);
        }
      }
    }

    if (dbKeysToFetch.length === 0) {
      return NextResponse.json({ gateways: [] });
    }

    const { data: dbSettings, error: dbError } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", dbKeysToFetch);

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

    for (const config of configs) {
      const isEnabled = settingsMap[config.isEnabledKey] === "true";
      
      const fieldsWithValues = (config.fields || []).map((f) => {
        let value = settingsMap[f.key] || "";
        // Mask passwords
        if (f.type === "password" && value) {
          value = "••••••••••••";
        }
        return {
          ...f,
          value,
        };
      });

      gateways.push({
        id: config.id,
        name: config.name,
        description: config.description,
        isEnabledKey: config.isEnabledKey,
        enabled: isEnabled,
        fields: fieldsWithValues,
      });
    }

    return NextResponse.json({ gateways });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load payment settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    
    // Expect body to be a mapping of setting key to its new value
    // e.g. { payment_cod_enabled: true, payment_razorpay_key_id: 'rzp_...', ... }
    const upserts: Array<{ key: string; value: string }> = [];

    for (const [key, rawValue] of Object.entries(body)) {
      // Ignore password fields if they haven't changed (still masked)
      if (rawValue === "••••••••••••") {
        continue;
      }

      let stringVal = "";
      if (typeof rawValue === "boolean") {
        stringVal = rawValue ? "true" : "false";
      } else {
        stringVal = String(rawValue ?? "").trim();
      }

      upserts.push({
        key,
        value: JSON.stringify(stringVal),
      });
    }

    if (upserts.length > 0) {
      const { error } = await supabaseAdmin
        .from("site_settings")
        .upsert(upserts, { onConflict: "key" });

      if (error) throw error;
    }

    return NextResponse.json({ success: true });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update payment settings";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
