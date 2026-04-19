import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export const runtime = "nodejs";

type VerifyPaymentBody = {
  internalOrderId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

function getAuthToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return auth.slice(7).trim() || null;
}

function isValidSignature(orderId: string, paymentId: string, signature: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return digest === signature;
}

export async function POST(req: NextRequest) {
  try {
    const token = getAuthToken(req);
    if (!token) {
      return NextResponse.json({ error: "Unauthorized request." }, { status: 401 });
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
    }

    const body = (await req.json()) as VerifyPaymentBody;
    const internalOrderId = String(body.internalOrderId || "").trim();
    const razorpayOrderId = String(body.razorpayOrderId || "").trim();
    const razorpayPaymentId = String(body.razorpayPaymentId || "").trim();
    const razorpaySignature = String(body.razorpaySignature || "").trim();

    if (!internalOrderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment verification fields." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json({ error: "Razorpay secret is not configured." }, { status: 500 });
    }

    if (!isValidSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature, keySecret)) {
      return NextResponse.json({ error: "Payment signature verification failed." }, { status: 400 });
    }

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .select("id, user_id, status, payment_status, razorpay_order_id")
      .eq("id", internalOrderId)
      .single();

    if (orderError || !orderData) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (orderData.user_id !== userData.user.id) {
      return NextResponse.json({ error: "You are not allowed to update this order." }, { status: 403 });
    }

    if (orderData.razorpay_order_id && orderData.razorpay_order_id !== razorpayOrderId) {
      return NextResponse.json({ error: "Razorpay order ID mismatch." }, { status: 400 });
    }

    if (orderData.payment_status === "paid") {
      return NextResponse.json({ success: true, orderId: orderData.id });
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        payment_method: "razorpay",
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
      })
      .eq("id", orderData.id);

    if (updateError) {
      throw new Error("Failed to update payment status.");
    }

    await supabaseAdmin.from("order_status_history").insert({
      order_id: orderData.id,
      from_status: orderData.status,
      to_status: orderData.status,
      note: `Razorpay payment verified. Payment ID: ${razorpayPaymentId}`,
    });

    return NextResponse.json({ success: true, orderId: orderData.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}