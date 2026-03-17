import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

type AddressPayload = {
    full_name?: string;
    phone?: string;
    address_line1?: string;
    address_line2?: string | null;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
    is_default_shipping?: boolean;
    is_default_billing?: boolean;
};

function cleanString(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

function normalizeAddressPayload(body: unknown): AddressPayload {
    const input = (body ?? {}) as Record<string, unknown>;
    return {
        full_name: cleanString(input.full_name),
        phone: cleanString(input.phone),
        address_line1: cleanString(input.address_line1),
        address_line2: typeof input.address_line2 === "string" ? input.address_line2.trim() : null,
        city: cleanString(input.city),
        state: cleanString(input.state),
        pincode: cleanString(input.pincode),
        country: cleanString(input.country) || "India",
        is_default_shipping: Boolean(input.is_default_shipping),
        is_default_billing: Boolean(input.is_default_billing),
    };
}

async function clearDefaultsForUser(userId: string, shipping: boolean, billing: boolean) {
    const updates: Record<string, boolean> = {};
    if (shipping) updates.is_default_shipping = false;
    if (billing) updates.is_default_billing = false;
    if (Object.keys(updates).length === 0) return;

    const { error } = await supabaseAdmin
        .from("user_addresses")
        .update(updates)
        .eq("user_id", userId)
        .eq("is_deleted", false);

    if (error) throw error;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const customerId = params.id;
        const body = await req.json();
        const payload = normalizeAddressPayload(body);

        if (!payload.full_name || !payload.phone || !payload.address_line1 || !payload.city || !payload.state || !payload.pincode) {
            return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
        }

        await clearDefaultsForUser(customerId, Boolean(payload.is_default_shipping), Boolean(payload.is_default_billing));

        const { data, error } = await supabaseAdmin
            .from("user_addresses")
            .insert({
                user_id: customerId,
                full_name: payload.full_name,
                phone: payload.phone,
                address_line1: payload.address_line1,
                address_line2: payload.address_line2 || null,
                city: payload.city,
                state: payload.state,
                pincode: payload.pincode,
                country: payload.country || "India",
                is_default_shipping: Boolean(payload.is_default_shipping),
                is_default_billing: Boolean(payload.is_default_billing),
            })
            .select("id")
            .single();

        if (error) throw error;

        await supabaseAdmin.from("customer_interaction_logs").insert({
            user_id: customerId,
            event_type: "note_added",
            note: "Admin added a customer address",
            event_data: { address_id: data.id, source: "admin_addresses_post" },
        });

        return NextResponse.json({ success: true, id: data.id });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to add address";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const customerId = params.id;
        const body = (await req.json()) as Record<string, unknown>;
        const addressId = cleanString(body.address_id);

        if (!addressId) {
            return NextResponse.json({ error: "address_id is required" }, { status: 400 });
        }

        const normalized = normalizeAddressPayload(body);
        const updates: Record<string, unknown> = {};

        if (normalized.full_name) updates.full_name = normalized.full_name;
        if (normalized.phone) updates.phone = normalized.phone;
        if (normalized.address_line1) updates.address_line1 = normalized.address_line1;
        if (normalized.address_line2 !== undefined) updates.address_line2 = normalized.address_line2 || null;
        if (normalized.city) updates.city = normalized.city;
        if (normalized.state) updates.state = normalized.state;
        if (normalized.pincode) updates.pincode = normalized.pincode;
        if (normalized.country) updates.country = normalized.country;

        if (typeof body.is_default_shipping === "boolean") {
            updates.is_default_shipping = body.is_default_shipping;
        }
        if (typeof body.is_default_billing === "boolean") {
            updates.is_default_billing = body.is_default_billing;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        await clearDefaultsForUser(
            customerId,
            Boolean(updates.is_default_shipping),
            Boolean(updates.is_default_billing),
        );

        const { error } = await supabaseAdmin
            .from("user_addresses")
            .update(updates)
            .eq("id", addressId)
            .eq("user_id", customerId)
            .eq("is_deleted", false);

        if (error) throw error;

        await supabaseAdmin.from("customer_interaction_logs").insert({
            user_id: customerId,
            event_type: "note_added",
            note: "Admin updated a customer address",
            event_data: { address_id: addressId, source: "admin_addresses_patch" },
        });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update address";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const customerId = params.id;
        const body = (await req.json()) as Record<string, unknown>;
        const addressId = cleanString(body.address_id);

        if (!addressId) {
            return NextResponse.json({ error: "address_id is required" }, { status: 400 });
        }

        const { error } = await supabaseAdmin
            .from("user_addresses")
            .update({
                is_deleted: true,
                is_default_shipping: false,
                is_default_billing: false,
            })
            .eq("id", addressId)
            .eq("user_id", customerId)
            .eq("is_deleted", false);

        if (error) throw error;

        await supabaseAdmin.from("customer_interaction_logs").insert({
            user_id: customerId,
            event_type: "note_added",
            note: "Admin deleted a customer address",
            event_data: { address_id: addressId, source: "admin_addresses_delete" },
        });

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete address";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
