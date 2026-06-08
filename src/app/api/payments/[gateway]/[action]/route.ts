import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9_-]+$/;

export async function POST(
  req: NextRequest,
  { params }: { params: { gateway: string; action: string } }
) {
  try {
    const { gateway, action } = params;

    // Security Check 1: Prevent path traversal by strictly validating path tokens
    if (!ALPHANUMERIC_REGEX.test(gateway) || !ALPHANUMERIC_REGEX.test(action)) {
      return NextResponse.json({ error: "Invalid gateway or action parameter." }, { status: 400 });
    }

    const basePaymentsDir = path.join(process.cwd(), "src", "payments");
    const gatewayDir = path.join(basePaymentsDir, gateway);
    const handlerPath = path.join(gatewayDir, "api", `${action}.ts`);

    // Security Check 2: Verify that the resolved paths lie within the base payments directory
    if (!gatewayDir.startsWith(basePaymentsDir) || !handlerPath.startsWith(gatewayDir)) {
      return NextResponse.json({ error: "Access denied." }, { status: 403 });
    }

    // Security Check 3: Check if the folder and file actually exist in the codebase
    if (!fs.existsSync(gatewayDir) || !fs.existsSync(handlerPath)) {
      return NextResponse.json({ error: `Payment method action not supported.` }, { status: 404 });
    }

    // Dynamic import and execution
    try {
      const handlerModule = await import(`@/payments/${gateway}/api/${action}`);
      if (typeof handlerModule.default !== "function") {
        throw new Error(`Handler in ${gateway}/${action} does not export a default function.`);
      }
      return await handlerModule.default(req);
    } catch (importErr) {
      console.error(`Failed to dynamically import handler for ${gateway}/${action}:`, importErr);
      return NextResponse.json({ error: "Failed to initialize payment handler." }, { status: 500 });
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal payment router error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
