import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

type GatewayConfig = {
  id: string;
  name: string;
  description: string;
  isEnabledKey: string;
  fields: Array<{ key: string; label: string; type: string }>;
};

export async function GET() {
  try {
    const basePaymentsDir = path.join(process.cwd(), "src", "payments");
    
    if (!fs.existsSync(basePaymentsDir)) {
      return NextResponse.json({ methods: [] });
    }

    const directories = fs.readdirSync(basePaymentsDir).filter((file) => {
      const fullPath = path.join(basePaymentsDir, file);
      return fs.statSync(fullPath).isDirectory();
    });

    const activeGateways: any[] = [];
    const dbKeysToFetch: string[] = [];
    const gatewayConfigs: Record<string, GatewayConfig> = {};

    for (const dir of directories) {
      const configPath = path.join(basePaymentsDir, dir, "config.json");
      if (fs.existsSync(configPath)) {
        try {
          const configContent = fs.readFileSync(configPath, "utf8");
          const config = JSON.parse(configContent) as GatewayConfig;
          gatewayConfigs[dir] = config;
          dbKeysToFetch.push(config.isEnabledKey);
          
          // If the gateway has fields, fetch the key ID (public safe keys) if needed
          if (config.id === "razorpay") {
            dbKeysToFetch.push("payment_razorpay_key_id");
          }
        } catch (e) {
          console.error(`Error loading payment config for directory ${dir}:`, e);
        }
      }
    }

    if (dbKeysToFetch.length === 0) {
      return NextResponse.json({ methods: [] });
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

    for (const [, config] of Object.entries(gatewayConfigs)) {
      const isEnabled = settingsMap[config.isEnabledKey] === "true";
      if (isEnabled) {
        const methodData: any = {
          id: config.id,
          name: config.name,
          description: config.description,
        };

        // Add public credentials safely
        if (config.id === "razorpay") {
          methodData.keyId = settingsMap["payment_razorpay_key_id"] || "";
        }

        activeGateways.push(methodData);
      }
    }

    return NextResponse.json({ methods: activeGateways });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load active payment methods";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
