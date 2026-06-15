import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { triggerOrderNotification } from "@/lib/notifications";

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

async function getRazorpaySecret(): Promise<string> {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "payment_razorpay_key_secret")
      .maybeSingle();

    if (error) throw error;
    
    let val = data?.value;
    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch {
        // Fallback
      }
    }
    return String(val ?? "") || process.env.RAZORPAY_KEY_SECRET || "";
  } catch (err) {
    console.error("Error loading payment secret:", err);
    return process.env.RAZORPAY_KEY_SECRET || "";
  }
}

export default async function handleVerifyPayment(req: NextRequest) {
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

    const keySecret = await getRazorpaySecret();
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

    if (orderData.payment_status === "paid" || orderData.payment_status === "advance_paid") {
      return NextResponse.json({ success: true, orderId: orderData.id });
    }

    const isCod = orderData.payment_method === "cod";
    const updatePayload: any = {
      payment_status: isCod ? "advance_paid" : "paid",
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
    };
    if (!isCod) {
      updatePayload.payment_method = "razorpay";
    }

    const { error: updateError } = await supabaseAdmin
      .from("orders")
      .update(updatePayload)
      .eq("id", orderData.id);

    if (updateError) {
      throw new Error("Failed to update payment status.");
    }

    await supabaseAdmin.from("order_status_history").insert({
      order_id: orderData.id,
      from_status: orderData.status,
      to_status: orderData.status,
      note: isCod
        ? `COD partial advance payment verified via Razorpay. Payment ID: ${razorpayPaymentId}`
        : `Razorpay payment verified. Payment ID: ${razorpayPaymentId}`,
    });


    // Fire order confirmation notifications in background
    triggerOrderNotification(orderData.id, "confirmation").catch(err => {
      console.error("[verify-payment] Background notification dispatch error:", err);
    });

    return NextResponse.json({ success: true, orderId: orderData.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to verify payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
