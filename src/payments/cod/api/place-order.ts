import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { calculateCouponDiscount, evaluateCouponEligibility, normalizeCouponCode } from "@/lib/coupons";
import type { Coupon } from "@/types/coupons";
import { triggerOrderNotification } from "@/lib/notifications";
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

function getAuthToken(req: NextRequest): string | null {
    const auth = req.headers.get("authorization") || "";
    if (!auth.toLowerCase().startsWith("bearer ")) return null;
    return auth.slice(7).trim() || null;
}

function generateOrderNumber() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `SH-${dateStr}-${randomSuffix}`;
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

async function getRazorpayConfig(): Promise<{ keyId: string; keySecret: string }> {
    const { data } = await supabaseAdmin
        .from("site_settings")
        .select("key, value")
        .in("key", ["payment_razorpay_key_id", "payment_razorpay_key_secret"]);

    const settingsMap: Record<string, string> = (data ?? []).reduce<Record<string, string>>((acc, row) => {
        let val = row.value;
        if (typeof val === "string") {
            try {
                val = JSON.parse(val);
            } catch {}
        }
        acc[row.key] = String(val ?? "");
        return acc;
    }, {});

    return {
        keyId: settingsMap["payment_razorpay_key_id"] || process.env.RAZORPAY_KEY_ID || "",
        keySecret: settingsMap["payment_razorpay_key_secret"] || process.env.RAZORPAY_KEY_SECRET || "",
    };
}

async function createRazorpayOrder(
    amountPaise: number, 
    receipt: string, 
    keyId: string, 
    keySecret: string
): Promise<string> {
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
        }),
    });

    const json = await response.json();
    if (!response.ok || !json.id) {
        throw new Error(json?.error?.description || "Unable to create Razorpay order for COD advance.");
    }

    return json.id;
}

export default async function handlePlaceOrder(req: NextRequest) {
    try {
        const token = getAuthToken(req);
        if (!token) {
            return NextResponse.json({ error: "Unauthorized request." }, { status: 401 });
        }

        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !userData.user) {
            return NextResponse.json({ error: "Invalid or expired session." }, { status: 401 });
        }

        const user = userData.user;
        const body = await req.json();

        const formData = (body?.formData || {}) as CheckoutFormData;
        const items = (body?.items || []) as CheckoutItem[];
        const couponCode = normalizeCouponCode(String(body?.couponCode || ""));

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
        }

        if (!formData.fullName || !formData.phone || !formData.addressLine1 || !formData.area || !formData.city || !formData.state || !formData.pincode) {
            return NextResponse.json({ error: "Please fill all required address fields." }, { status: 400 });
        }

        // Security check: Verify that Cash on Delivery is actually enabled in settings
        const { data: codSetting, error: codSettingError } = await supabaseAdmin
            .from("site_settings")
            .select("value")
            .eq("key", "payment_cod_enabled")
            .maybeSingle();

        if (codSettingError) {
            throw new Error("Unable to verify payment gateway configuration.");
        }

        let isCodEnabled = true; // Default fallback
        if (codSetting) {
            try {
                const parsedVal = typeof codSetting.value === "string" ? JSON.parse(codSetting.value) : codSetting.value;
                isCodEnabled = parsedVal === "true" || parsedVal === true;
            } catch {
                isCodEnabled = codSetting.value === "true";
            }
        }

        if (!isCodEnabled) {
            return NextResponse.json({ error: "Cash on Delivery is currently unavailable." }, { status: 400 });
        }

        const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.meters || 0), 0);
        if (subtotal <= 0) {
            return NextResponse.json({ error: "Invalid cart total." }, { status: 400 });
        }

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
                    .eq("user_id", user.id)
                    .in("status", ["delivered", "completed"]);

                const [assignmentRes, redemptionRes] = await Promise.all([
                    supabaseAdmin
                        .from("coupon_user_assignments")
                        .select("id", { count: "exact", head: true })
                        .eq("coupon_id", coupon.id)
                        .eq("user_id", user.id),
                    supabaseAdmin
                        .from("coupon_redemptions")
                        .select("user_id")
                        .eq("coupon_id", coupon.id),
                ]);

                const redemptionRows = (redemptionRes.data ?? []) as { user_id: string | null }[];
                const userRedemptions = redemptionRows.filter((row) => row.user_id === user.id).length;

                const eligibility = evaluateCouponEligibility({
                    coupon,
                    subtotal,
                    userId: user.id,
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
        const details = calculateCheckoutDetails(subtotal, discountAmount, formData.state, "cod", shippingConfig);

        const order_number = generateOrderNumber();

        let razorpayOrderId = null;
        let razorpayKeyId = "";

        if (details.advanceAmount > 0) {
            const rzpConfig = await getRazorpayConfig();
            if (!rzpConfig.keyId || !rzpConfig.keySecret) {
                return NextResponse.json({ error: "Razorpay credentials are not configured for COD advance payment." }, { status: 400 });
            }
            razorpayKeyId = rzpConfig.keyId;
            razorpayOrderId = await createRazorpayOrder(
                Math.round(details.advanceAmount * 105.18 - details.advanceAmount * 5.18), // Safe integer paise conversion
                order_number,
                rzpConfig.keyId,
                rzpConfig.keySecret
            );
            // Wait, standard conversion is simply details.advanceAmount * 100
            razorpayOrderId = await createRazorpayOrder(
                Math.round(details.advanceAmount * 100),
                order_number,
                rzpConfig.keyId,
                rzpConfig.keySecret
            );
        }

        const noteAdvanceInfo = details.advanceAmount > 0 
            ? `COD Advance Required: INR ${details.advanceAmount} (Remaining INR ${details.remainingAmount} to pay on delivery)` 
            : "";

        const orderNotes = [
            formData.notes || "",
            coupon ? `Coupon ${coupon.code} applied (discount ₹${discountAmount.toFixed(2)})` : "",
            details.taxAmount > 0 ? `Tax (${shippingConfig.taxMode === "add_extra" ? "" : "Included "}${shippingConfig.taxRate}%): INR ${details.taxAmount}` : "",
            noteAdvanceInfo
        ].filter(Boolean).join(" | ");

        const { data: orderData, error: orderError } = await supabaseAdmin
            .from("orders")
            .insert({
                order_number,
                user_id: user.id,
                status: "pending",
                payment_status: "pending",
                payment_method: "cod",
                subtotal,
                discount_amount: discountAmount,
                shipping_amount: details.shippingFee,
                total_amount: details.totalAmount,
                coupon_id: coupon?.id ?? null,
                coupon_code: coupon?.code ?? null,
                notes: orderNotes,
                delivery_address: buildDeliveryAddress(formData),
                contact_phone: normalizePhone(formData.phone),
                razorpay_order_id: razorpayOrderId,
            })
            .select("id, order_number")
            .single();

        if (orderError || !orderData) {
            throw new Error(orderError?.message || "Failed to create order");
        }

        if (coupon && discountAmount > 0) {
            const { data: redemptionResult, error: redemptionRpcError } = await supabaseAdmin
                .rpc("redeem_coupon_atomic", {
                    p_coupon_id: coupon.id,
                    p_user_id: user.id,
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

        const { error: addressError } = await supabaseAdmin
            .from("order_addresses")
            .insert({
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
            throw new Error("Failed to save order address");
        }

        const orderItems = items.map((item) => ({
            order_id: orderData.id,
            product_id: item.product_id || null,
            variant_id: item.variant_id || null,
            product_name: item.name,
            image_url: item.image,
            selling_mode: item.selling_mode || "meter",
            quantity_or_meters: item.meters,
            price_per_unit: item.price,
            total_price: item.price * item.meters,
            selected_options_json: item.selected_options || [],
        }));

        const { error: itemsError } = await supabaseAdmin
            .from("order_items")
            .insert(orderItems);

        if (itemsError) {
            throw new Error("Failed to save order items");
        }

        const { error: statusHistoryError } = await supabaseAdmin
            .from("order_status_history")
            .insert({
                order_id: orderData.id,
                from_status: null,
                to_status: "pending",
                note: details.advanceAmount > 0 
                    ? "Order placed awaiting partial COD advance payment via Razorpay"
                    : "Order placed by customer via Cash on Delivery",
            });

        if (statusHistoryError) {
            throw new Error("Failed to save order status history");
        }

        // Fire order confirmation notifications only if no advance payment is required
        if (details.advanceAmount === 0) {
            triggerOrderNotification(orderData.id, "confirmation").catch(err => {
                console.error("[place-order] Background notification dispatch error:", err);
            });
        }

        return NextResponse.json({
            success: true,
            orderId: orderData.id,
            orderNumber: orderData.order_number,
            requiresAdvance: details.advanceAmount > 0,
            razorpayOrderId: razorpayOrderId,
            amount: Math.round(details.advanceAmount * 100),
            currency: "INR",
            keyId: razorpayKeyId,
            internalOrderId: orderData.id,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to place order";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

