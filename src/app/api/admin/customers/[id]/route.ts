import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import type {
    AdminCustomerDetails,
    AdminCustomerListItem,
    CustomerAddress,
    CustomerInteraction,
    CustomerOrderSummary,
    CustomerAccountStatus,
} from "@/types/customers";

type JsonMap = Record<string, unknown>;

function toNumber(value: unknown) {
    return Number(value ?? 0);
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const customerId = params.id;

        const [summaryRes, profileRes, ordersRes, addressesRes, interactionsRes, customersWithRepeatRes] = await Promise.all([
            supabaseAdmin
                .from("admin_customer_summary")
                .select("*")
                .eq("id", customerId)
                .single(),
            supabaseAdmin
                .from("user_profiles")
                .select("internal_notes, newsletter_opt_in, marketing_opt_in, sms_opt_in, preferred_language")
                .eq("id", customerId)
                .maybeSingle(),
            supabaseAdmin
                .from("orders")
                .select("id, order_number, created_at, status, payment_status, subtotal, shipping_amount, total_amount, discount_amount, coupon_code")
                .eq("user_id", customerId)
                .order("created_at", { ascending: false })
                .limit(100),
            supabaseAdmin
                .from("user_addresses")
                .select("id, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default_shipping, is_default_billing, created_at")
                .eq("user_id", customerId)
                .eq("is_deleted", false)
                .order("created_at", { ascending: false }),
            supabaseAdmin
                .from("customer_interaction_logs")
                .select("id, event_type, note, created_at, created_by")
                .eq("user_id", customerId)
                .order("created_at", { ascending: false })
                .limit(20),
            supabaseAdmin
                .from("admin_customer_summary")
                .select("id")
                .gt("total_orders", 1),
        ]);

        if (summaryRes.error) throw summaryRes.error;
        if (!summaryRes.data) {
            return NextResponse.json({ error: "Customer not found" }, { status: 404 });
        }
        if (profileRes.error) throw profileRes.error;
        if (ordersRes.error) throw ordersRes.error;
        if (addressesRes.error) throw addressesRes.error;
        if (interactionsRes.error) throw interactionsRes.error;
        if (customersWithRepeatRes.error) throw customersWithRepeatRes.error;

        const orderIds = (ordersRes.data ?? []).map((row) => row.id);

        let orderItemsByOrderId: Record<string, { item_lines: number; units_count: number }> = {};
        let shippingAddressByOrderId: Record<string, { shipping_city: string | null; shipping_state: string | null; shipping_pincode: string | null }> = {};

        if (orderIds.length > 0) {
            const [orderItemsRes, shippingAddressesRes] = await Promise.all([
                supabaseAdmin
                    .from("order_items")
                    .select("order_id, quantity")
                    .in("order_id", orderIds),
                supabaseAdmin
                    .from("order_addresses")
                    .select("order_id, city, state, pincode, type")
                    .in("order_id", orderIds)
                    .eq("type", "shipping"),
            ]);

            if (orderItemsRes.error) throw orderItemsRes.error;
            if (shippingAddressesRes.error) throw shippingAddressesRes.error;

            orderItemsByOrderId = (orderItemsRes.data ?? []).reduce((acc, row) => {
                const existing = acc[row.order_id] ?? { item_lines: 0, units_count: 0 };
                existing.item_lines += 1;
                existing.units_count += Number(row.quantity ?? 0);
                acc[row.order_id] = existing;
                return acc;
            }, {} as Record<string, { item_lines: number; units_count: number }>);

            shippingAddressByOrderId = (shippingAddressesRes.data ?? []).reduce((acc, row) => {
                if (!acc[row.order_id]) {
                    acc[row.order_id] = {
                        shipping_city: row.city ?? null,
                        shipping_state: row.state ?? null,
                        shipping_pincode: row.pincode ?? null,
                    };
                }
                return acc;
            }, {} as Record<string, { shipping_city: string | null; shipping_state: string | null; shipping_pincode: string | null }>);
        }

        const summary = summaryRes.data as JsonMap;

        const customer: AdminCustomerListItem = {
            id: String(summary.id),
            email: (summary.email as string | null) ?? null,
            full_name: (summary.full_name as string | null) ?? null,
            phone: (summary.phone as string | null) ?? null,
            created_at: String(summary.created_at),
            last_sign_in_at: (summary.last_sign_in_at as string | null) ?? null,
            account_status: (summary.account_status as CustomerAccountStatus | null) ?? "active",
            total_orders: toNumber(summary.total_orders),
            lifetime_value: toNumber(summary.lifetime_value),
            last_order_date: (summary.last_order_date as string | null) ?? null,
        };

        const orders: CustomerOrderSummary[] = (ordersRes.data ?? []).map((row) => ({
            id: row.id,
            order_number: row.order_number,
            created_at: row.created_at,
            status: row.status,
            payment_status: row.payment_status,
            subtotal: toNumber(row.subtotal),
            shipping_amount: toNumber(row.shipping_amount),
            total_amount: toNumber(row.total_amount),
            discount_amount: toNumber(row.discount_amount),
            coupon_code: row.coupon_code,
            item_lines: orderItemsByOrderId[row.id]?.item_lines ?? 0,
            units_count: orderItemsByOrderId[row.id]?.units_count ?? 0,
            shipping_city: shippingAddressByOrderId[row.id]?.shipping_city ?? null,
            shipping_state: shippingAddressByOrderId[row.id]?.shipping_state ?? null,
            shipping_pincode: shippingAddressByOrderId[row.id]?.shipping_pincode ?? null,
        }));

        const addresses: CustomerAddress[] = (addressesRes.data ?? []).map((row) => ({
            id: row.id,
            full_name: row.full_name,
            phone: row.phone,
            address_line1: row.address_line1,
            address_line2: row.address_line2,
            city: row.city,
            state: row.state,
            pincode: row.pincode,
            country: row.country,
            is_default_shipping: Boolean(row.is_default_shipping),
            is_default_billing: Boolean(row.is_default_billing),
            created_at: row.created_at,
        }));

        const interactions: CustomerInteraction[] = (interactionsRes.data ?? []).map((row) => ({
            id: row.id,
            event_type: row.event_type,
            note: row.note,
            created_at: row.created_at,
            created_by: row.created_by,
        }));

        const totalSpent = customer.lifetime_value;
        const avgOrderValue = customer.total_orders > 0
            ? Number((totalSpent / customer.total_orders).toFixed(2))
            : 0;
        const repeatCustomersCount = customersWithRepeatRes.data?.length ?? 0;
        const repeatPurchaseRate = customer.total_orders > 1 && repeatCustomersCount > 0
            ? Number(((1 / repeatCustomersCount) * 100).toFixed(2))
            : 0;

        const details: AdminCustomerDetails = {
            customer,
            total_spent: totalSpent,
            avg_order_value: avgOrderValue,
            repeat_purchase_rate: repeatPurchaseRate,
            orders,
            addresses,
            interactions,
            internal_notes: profileRes.data?.internal_notes ?? null,
            preferences: {
                newsletter_opt_in: Boolean(profileRes.data?.newsletter_opt_in ?? true),
                marketing_opt_in: Boolean(profileRes.data?.marketing_opt_in ?? true),
                sms_opt_in: Boolean(profileRes.data?.sms_opt_in ?? false),
                preferred_language: String(profileRes.data?.preferred_language ?? "en"),
            },
        };

        return NextResponse.json(details);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch customer details";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const customerId = params.id;
        const body = await req.json();

        const updates: JsonMap = {};

        if (typeof body.full_name === "string") updates.full_name = body.full_name.trim();
        if (typeof body.phone === "string") updates.phone = body.phone.trim();
        if (typeof body.internal_notes === "string") updates.internal_notes = body.internal_notes;
        if (typeof body.account_status === "string") {
            const allowed = ["active", "suspended", "blocked"];
            if (!allowed.includes(body.account_status)) {
                return NextResponse.json({ error: "Invalid account status" }, { status: 400 });
            }
            updates.account_status = body.account_status;
        }
        if (typeof body.newsletter_opt_in === "boolean") updates.newsletter_opt_in = body.newsletter_opt_in;
        if (typeof body.marketing_opt_in === "boolean") updates.marketing_opt_in = body.marketing_opt_in;
        if (typeof body.sms_opt_in === "boolean") updates.sms_opt_in = body.sms_opt_in;
        if (typeof body.preferred_language === "string") updates.preferred_language = body.preferred_language.trim() || "en";

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const payload = {
            id: customerId,
            ...updates,
            updated_at: new Date().toISOString(),
        };

        const { error } = await supabaseAdmin
            .from("user_profiles")
            .upsert(payload, { onConflict: "id" });

        if (error) throw error;

        if (typeof updates.account_status === "string") {
            await supabaseAdmin
                .from("customer_interaction_logs")
                .insert({
                    user_id: customerId,
                    event_type: "status_changed",
                    note: `Account status changed to ${updates.account_status}`,
                });
        }

        if (typeof updates.internal_notes === "string") {
            await supabaseAdmin
                .from("customer_interaction_logs")
                .insert({
                    user_id: customerId,
                    event_type: "note_added",
                    note: updates.internal_notes,
                });
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update customer";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
