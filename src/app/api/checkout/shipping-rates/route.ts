import { NextRequest, NextResponse } from "next/server";
import { getShippingRatesConfig } from "@/lib/shipping/rates";
import { ShippingManager } from "@/lib/shipping/ShippingManager";

export const runtime = "nodejs";

export async function GET() {
  try {
    const config = await getShippingRatesConfig();
    return NextResponse.json(config);
  } catch (err: any) {
    console.error("Failed to load checkout configurations:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { pincode, state, weight, isCod } = await req.json();

    if (!pincode) {
      return NextResponse.json({ error: "Pincode is required." }, { status: 400 });
    }

    const liveRate = await ShippingManager.calculateCheckoutShipping(
      pincode,
      state || "",
      weight || 0.5,
      !!isCod
    );

    return NextResponse.json(liveRate);
  } catch (err: any) {
    console.error("Failed to calculate live shipping rate:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
