import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUserId } from "@/lib/apiAuth";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { 
    validateName, 
    validatePhone, 
    validatePincode, 
    validateAddressLine, 
    validateCity, 
    validateState 
} from "@/lib/validation";

type AddressPatch = {
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

function clean(value: unknown) {
    return typeof value === "string" ? value.trim() : "";
}

async function clearDefaults(userId: string, shipping: boolean, billing: boolean) {
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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) return NextResponse.json({ error }, { status: 401 });

        const addressId = params.id;
        const body = (await req.json()) as Record<string, unknown>;

        const updates: AddressPatch = {};
        if (typeof body.full_name === "string") updates.full_name = clean(body.full_name);
        if (typeof body.phone === "string") updates.phone = clean(body.phone);
        if (typeof body.address_line1 === "string") updates.address_line1 = clean(body.address_line1);
        if (typeof body.address_line2 === "string" || body.address_line2 === null) updates.address_line2 = typeof body.address_line2 === "string" ? body.address_line2.trim() : null;
        if (typeof body.city === "string") updates.city = clean(body.city);
        if (typeof body.state === "string") updates.state = clean(body.state);
        if (typeof body.pincode === "string") updates.pincode = clean(body.pincode);
        if (typeof body.country === "string") updates.country = clean(body.country);
        if (typeof body.is_default_shipping === "boolean") updates.is_default_shipping = body.is_default_shipping;
        if (typeof body.is_default_billing === "boolean") updates.is_default_billing = body.is_default_billing;

        if (updates.full_name !== undefined) {
            const nameErr = validateName(updates.full_name);
            if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
        }
        if (updates.phone !== undefined) {
            const phoneErr = validatePhone(updates.phone);
            if (phoneErr) return NextResponse.json({ error: phoneErr }, { status: 400 });
        }
        if (updates.address_line1 !== undefined) {
            const addr1Err = validateAddressLine(updates.address_line1, "Address line 1");
            if (addr1Err) return NextResponse.json({ error: addr1Err }, { status: 400 });
        }
        if (updates.address_line2 !== undefined && updates.address_line2 !== null) {
            const addr2Err = validateAddressLine(updates.address_line2, "Address line 2", false);
            if (addr2Err) return NextResponse.json({ error: addr2Err }, { status: 400 });
        }
        if (updates.city !== undefined) {
            const cityErr = validateCity(updates.city);
            if (cityErr) return NextResponse.json({ error: cityErr }, { status: 400 });
        }
        if (updates.state !== undefined) {
            const stateErr = validateState(updates.state);
            if (stateErr) return NextResponse.json({ error: stateErr }, { status: 400 });
        }
        if (updates.pincode !== undefined) {
            const pinErr = validatePincode(updates.pincode);
            if (pinErr) return NextResponse.json({ error: pinErr }, { status: 400 });
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        await clearDefaults(userId, Boolean(updates.is_default_shipping), Boolean(updates.is_default_billing));

        const { error: updateError } = await supabaseAdmin
            .from("user_addresses")
            .update(updates)
            .eq("id", addressId)
            .eq("user_id", userId)
            .eq("is_deleted", false);

        if (updateError) throw updateError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to update address";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) return NextResponse.json({ error }, { status: 401 });

        const addressId = params.id;

        const { error: deleteError } = await supabaseAdmin
            .from("user_addresses")
            .update({
                is_deleted: true,
                is_default_shipping: false,
                is_default_billing: false,
            })
            .eq("id", addressId)
            .eq("user_id", userId)
            .eq("is_deleted", false);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete address";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
