import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { calculateCouponDiscount, evaluateCouponEligibility, normalizeCouponCode } from "@/lib/coupons";
import type { Coupon } from "@/types/coupons";
import { calculateCheckoutDetails, getShippingRatesConfig } from "@/lib/shipping/rates";

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

// Constants removed to use dynamic rates configurations

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

async function getPaymentConfig(): Promise<{
  codEnabled: boolean;
  razorpayEnabled: boolean;
  razorpayKeyId: string;
  razorpayKeySecret: string;
}> {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "payment_cod_enabled",
        "payment_razorpay_enabled",
        "payment_razorpay_key_id",
        "payment_razorpay_key_secret"
      ]);

    if (error) throw error;

    const settingsMap: Record<string, string> = (data ?? []).reduce<Record<string, string>>((acc, row) => {
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

    return {
      codEnabled: settingsMap["payment_cod_enabled"] === "true",
      razorpayEnabled: settingsMap["payment_razorpay_enabled"] === "true",
      razorpayKeyId: settingsMap["payment_razorpay_key_id"] || "",
      razorpayKeySecret: settingsMap["payment_razorpay_key_secret"] || ""
    };
  } catch (err) {
    console.error("Error loading payment configuration:", err);
    return {
      codEnabled: true,
      razorpayEnabled: Boolean(process.env.RAZORPAY_KEY_ID),
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
      razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || ""
    };
  }
}

async function createRazorpayOrder(
  amountPaise: number, 
  receipt: string, 
  notes: Record<string, string>, 
  keyId: string, 
  keySecret: string
): Promise<RazorpayOrderResponse> {
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured.");
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

export default async function handleCreateOrder(req: NextRequest) {
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
    const couponCode = normalizeCouponCode(String(body?.couponCode || ""));

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

    const config = await getPaymentConfig();
    if (!config.razorpayEnabled) {
      return NextResponse.json({ error: "Razorpay payment is disabled." }, { status: 400 });
    }

    const subtotal = items.reduce((sum, item) => sum + toSafeNumber(item.price) * toSafeNumber(item.meters), 0);
    if (subtotal <= 0) {
      return NextResponse.json({ error: "Invalid cart total." }, { status: 400 });
    }

    // Coupon verification & application
    let coupon: Coupon | null = null;
    let discountAmount = 0;

    if (couponCode) {
      const { data: couponData, error: couponError } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .ilike("code", couponCode)
        .limit(1)
        .maybeSingle();

      if (couponError) throw couponError;
      if (couponData) {
        coupon = couponData as Coupon;

        const { count: completedOrderCount } = await supabaseAdmin
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userData.user.id)
          .in("status", ["delivered", "completed"]);

        const [assignmentRes, redemptionRes] = await Promise.all([
          supabaseAdmin
            .from("coupon_user_assignments")
            .select("id", { count: "exact", head: true })
            .eq("coupon_id", coupon.id)
            .eq("user_id", userData.user.id),
          supabaseAdmin
            .from("coupon_redemptions")
            .select("user_id")
            .eq("coupon_id", coupon.id),
        ]);

        const redemptionRows = (redemptionRes.data ?? []) as { user_id: string | null }[];
        const userRedemptions = redemptionRows.filter((row) => row.user_id === userData.user.id).length;

        const eligibility = evaluateCouponEligibility({
          coupon,
          subtotal,
          userId: userData.user.id,
          userCompletedOrders: completedOrderCount ?? 0,
          isAssignedUser: (assignmentRes.count ?? 0) > 0,
          userRedemptions,
          globalRedemptions: redemptionRows.length,
        });

        if (!eligibility.isEligible) {
          return NextResponse.json({ error: eligibility.reason || "Coupon is not valid for this order." }, { status: 400 });
        }

        discountAmount = calculateCouponDiscount(coupon, subtotal);
      }
    }

    const shippingConfig = await getShippingRatesConfig();
    const details = calculateCheckoutDetails(subtotal, discountAmount, formData.state, "razorpay", shippingConfig);
    const totalAmount = details.totalAmount;
    const totalAmountPaise = Math.round(totalAmount * 100);

    const orderNumber = generateOrderNumber();
    const razorpayOrder = await createRazorpayOrder(
      totalAmountPaise, 
      orderNumber, 
      {
        source: "shree_hari_storefront",
        user_id: userData.user.id,
        city: formData.city,
      },
      config.razorpayKeyId,
      config.razorpayKeySecret
    );

    const orderNotes = [
      formData.notes || "",
      coupon ? `Coupon ${coupon.code} applied (discount ₹${discountAmount.toFixed(2)})` : "",
      details.taxAmount > 0 ? `Tax (${shippingConfig.taxMode === "add_extra" ? "" : "Included "}${shippingConfig.taxRate}%): INR ${details.taxAmount}` : "",
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
        discount_amount: discountAmount,
        shipping_amount: details.shippingFee,
        total_amount: totalAmount,
        coupon_id: coupon?.id ?? null,
        coupon_code: coupon?.code ?? null,
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

    // Atomic Coupon Reservation if order created successfully
    if (coupon && discountAmount > 0) {
      const { data: redemptionResult, error: redemptionRpcError } = await supabaseAdmin
        .rpc("redeem_coupon_atomic", {
          p_coupon_id: coupon.id,
          p_user_id: userData.user.id,
          p_order_id: orderData.id,
          p_discount_amount: discountAmount,
        });

      if (redemptionRpcError) {
        await supabaseAdmin.from("orders").delete().eq("id", orderData.id);
        throw new Error("Failed to reserve coupon redemption");
      }

      const row = Array.isArray(redemptionResult)
        ? redemptionResult[0] as { success?: boolean; error_message?: string }
        : null;

      if (!row?.success) {
        await supabaseAdmin.from("orders").delete().eq("id", orderData.id);
        return NextResponse.json(
          { error: row?.error_message || "Coupon usage limit has been reached." },
          { status: 409 },
        );
      }
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
      keyId: config.razorpayKeyId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to start payment.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
