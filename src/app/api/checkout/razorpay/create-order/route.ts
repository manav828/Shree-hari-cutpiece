import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export const runtime = "nodejs";

type CheckoutItem = {
  id: string;
  product_id?: string;
  variant_id?: string;
  name: string;
  image: string;
  price: number;
  meters: number;
  selling_mode?: "meter" | "piece";
  selected_options?: Array<{
    group_name?: string | null;
    value_labels?: string[] | null;
    input_value?: string | number | null;
  }>;
};

type CheckoutFormData = {
  fullName: string;
  addressLine1: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email?: string;
  notes?: string;
};

type RazorpayOrderResponse = {
  id: string;
  amount: number;
  currency: string;
};

const SHIPPING_THRESHOLD = 999;
const SHIPPING_CHARGE = 99;
const GST_RATE = 0.18;

function getAuthToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return auth.slice(7).trim() || null;
}

function generateOrderNumber() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `SH-${dateStr}-${randomSuffix}`;
}

function toSafeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/\s+/g, "").trim();
  if (cleaned.startsWith("+")) {
    return cleaned;
  }
  return `+91${cleaned}`;
}

function buildDeliveryAddress(formData: CheckoutFormData): string {
  const segments = [
    formData.addressLine1,
    formData.area,
    formData.landmark || "",
    formData.city,
    formData.state,
    formData.pincode,
  ].filter(Boolean);
  return segments.join(", ");
}

async function createRazorpayOrder(amountPaise: number, receipt: string, notes: Record<string, string>): Promise<RazorpayOrderResponse> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay keys are missing on server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${authHeader}`,
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt,
      notes,
    }),
  });

  const json = (await response.json()) as { id?: string; amount?: number; currency?: string; error?: { description?: string } };

  if (!response.ok || !json.id || typeof json.amount !== "number" || !json.currency) {
    throw new Error(json?.error?.description || "Unable to create Razorpay order.");
  }

  return {
    id: json.id,
    amount: json.amount,
    currency: json.currency,
  };
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

    const body = await req.json();
    const formData = (body?.formData || {}) as CheckoutFormData;
    const items = (body?.items || []) as CheckoutItem[];

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const requiredFields: Array<keyof CheckoutFormData> = [
      "fullName",
      "addressLine1",
      "area",
      "city",
      "state",
      "pincode",
      "phone",
    ];

    const missingField = requiredFields.find((field) => !String(formData[field] || "").trim());
    if (missingField) {
      return NextResponse.json({ error: "Please complete all required shipping fields." }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + toSafeNumber(item.price) * toSafeNumber(item.meters), 0);
    if (subtotal <= 0) {
      return NextResponse.json({ error: "Invalid cart total." }, { status: 400 });
    }

    const shippingAmount = subtotal >= SHIPPING_THRESHOLD ? 0 : SHIPPING_CHARGE;
    const gstAmount = Math.round(subtotal * GST_RATE);
    const totalAmount = subtotal + shippingAmount + gstAmount;
    const totalAmountPaise = Math.round(totalAmount * 100);

    const orderNumber = generateOrderNumber();
    const razorpayOrder = await createRazorpayOrder(totalAmountPaise, orderNumber, {
      source: "shree_hari_storefront",
      user_id: userData.user.id,
      city: formData.city,
    });

    const orderNotes = [
      formData.notes || "",
      `Tax (GST 18%): INR ${gstAmount}`,
      "Payment initiated via Razorpay",
    ]
      .filter(Boolean)
      .join(" | ");

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userData.user.id,
        status: "pending",
        payment_status: "pending",
        payment_method: "razorpay",
        subtotal,
        discount_amount: 0,
        shipping_amount: shippingAmount,
        total_amount: totalAmount,
        notes: orderNotes,
        delivery_address: buildDeliveryAddress(formData),
        contact_phone: normalizePhone(formData.phone),
        razorpay_order_id: razorpayOrder.id,
      })
      .select("id, order_number")
      .single();

    if (orderError || !orderData) {
      throw new Error(orderError?.message || "Failed to create local order.");
    }

    const { error: addressError } = await supabaseAdmin.from("order_addresses").insert({
      order_id: orderData.id,
      type: "shipping",
      full_name: formData.fullName,
      phone: normalizePhone(formData.phone),
      address_line1: formData.addressLine1,
      address_line2: [formData.area, formData.landmark || ""].filter(Boolean).join(", ") || null,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: "India",
    });

    if (addressError) {
      throw new Error("Failed to save shipping address.");
    }

    const orderItems = items.map((item) => ({
      order_id: orderData.id,
      product_id: item.product_id || null,
      variant_id: item.variant_id || null,
      product_name: item.name,
      image_url: item.image,
      selling_mode: item.selling_mode || "meter",
      quantity_or_meters: toSafeNumber(item.meters),
      price_per_unit: toSafeNumber(item.price),
      total_price: toSafeNumber(item.price) * toSafeNumber(item.meters),
      selected_options_json: item.selected_options || [],
    }));

    const { error: itemsError } = await supabaseAdmin.from("order_items").insert(orderItems);
    if (itemsError) {
      throw new Error("Failed to save order items.");
    }

    const { error: statusHistoryError } = await supabaseAdmin.from("order_status_history").insert({
      order_id: orderData.id,
      from_status: null,
      to_status: "pending",
      note: "Order created and awaiting Razorpay payment",
    });

    if (statusHistoryError) {
      throw new Error("Failed to save order status history.");
    }

    return NextResponse.json({
      success: true,
      internalOrderId: orderData.id,
      orderNumber: orderData.order_number,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to start payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}