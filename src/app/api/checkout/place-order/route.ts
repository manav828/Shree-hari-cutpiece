import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { calculateCouponDiscount, evaluateCouponEligibility, normalizeCouponCode } from "@/lib/coupons";
import type { Coupon } from "@/types/coupons";

type CheckoutItem = {
    id: string;
    name: string;
    image: string;
    price: number;
    meters: number;
};

type CheckoutFormData = {
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
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

        const user = userData.user;
        const body = await req.json();

        const formData = (body?.formData || {}) as CheckoutFormData;
        const items = (body?.items || []) as CheckoutItem[];
        const couponCode = normalizeCouponCode(String(body?.couponCode || ""));

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
        }

        if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.pincode) {
            return NextResponse.json({ error: "Please fill all required address fields." }, { status: 400 });
        }

        const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.meters || 0), 0);
        if (subtotal <= 0) {
            return NextResponse.json({ error: "Invalid cart total." }, { status: 400 });
        }

        const shippingAmount = subtotal >= 999 ? 0 : 99;
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
            if (!couponData) {
                return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
            }

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

        const discountedSubtotal = Math.max(subtotal - discountAmount, 0);
        const totalAmount = discountedSubtotal + shippingAmount;

        const order_number = generateOrderNumber();
        const orderNotes = [
            formData.notes || "",
            coupon ? `Coupon ${coupon.code} applied (discount ₹${discountAmount.toFixed(2)})` : "",
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
                shipping_amount: shippingAmount,
                total_amount: totalAmount,
                coupon_id: coupon?.id ?? null,
                coupon_code: coupon?.code ?? null,
                notes: orderNotes,
                delivery_address: `${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`,
                contact_phone: formData.phone,
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
                full_name: formData.name,
                phone: formData.phone,
                address_line1: formData.address,
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
            product_name: item.name,
            image_url: item.image,
            selling_mode: "meter",
            quantity_or_meters: item.meters,
            price_per_unit: item.price,
            total_price: item.price * item.meters,
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
                note: "Order placed by customer via website",
            });

        if (statusHistoryError) {
            throw new Error("Failed to save order status history");
        }

        return NextResponse.json({
            success: true,
            orderId: orderData.id,
            orderNumber: orderData.order_number,
        });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to place order";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
