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

type AddressInput = {
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

function sanitize(input: unknown) {
    return typeof input === "string" ? input.trim() : "";
}

function normalize(body: unknown): AddressInput {
    const data = (body ?? {}) as Record<string, unknown>;
    return {
        full_name: sanitize(data.full_name),
        phone: sanitize(data.phone),
        address_line1: sanitize(data.address_line1),
        address_line2: typeof data.address_line2 === "string" ? data.address_line2.trim() : null,
        city: sanitize(data.city),
        state: sanitize(data.state),
        pincode: sanitize(data.pincode),
        country: sanitize(data.country) || "India",
        is_default_shipping: Boolean(data.is_default_shipping),
        is_default_billing: Boolean(data.is_default_billing),
    };
}

async function clearExistingDefaults(userId: string, shipping: boolean, billing: boolean) {
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

export async function GET(req: NextRequest) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const { data, error: addressesError } = await supabaseAdmin
            .from("user_addresses")
            .select("id, full_name, phone, address_line1, address_line2, city, state, pincode, country, is_default_shipping, is_default_billing, created_at, updated_at")
            .eq("user_id", userId)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false });

        if (addressesError) throw addressesError;

        return NextResponse.json({ addresses: data ?? [] });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch addresses";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, error } = await getAuthenticatedUserId(req);
        if (!userId) {
            return NextResponse.json({ error }, { status: 401 });
        }

        const payload = normalize(await req.json());

        if (!payload.full_name || !payload.phone || !payload.address_line1 || !payload.city || !payload.state || !payload.pincode) {
            return NextResponse.json({ error: "Missing required address fields" }, { status: 400 });
        }

        const nameErr = validateName(payload.full_name);
        if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });

        const phoneErr = validatePhone(payload.phone);
        if (phoneErr) return NextResponse.json({ error: phoneErr }, { status: 400 });

        const addrErr = validateAddressLine(payload.address_line1, "Address line 1");
        if (addrErr) return NextResponse.json({ error: addrErr }, { status: 400 });

        if (payload.address_line2) {
            const addr2Err = validateAddressLine(payload.address_line2, "Address line 2", false);
            if (addr2Err) return NextResponse.json({ error: addr2Err }, { status: 400 });
        }

        const cityErr = validateCity(payload.city);
        if (cityErr) return NextResponse.json({ error: cityErr }, { status: 400 });

        const stateErr = validateState(payload.state);
        if (stateErr) return NextResponse.json({ error: stateErr }, { status: 400 });

        const pinErr = validatePincode(payload.pincode);
        if (pinErr) return NextResponse.json({ error: pinErr }, { status: 400 });

        await clearExistingDefaults(userId, Boolean(payload.is_default_shipping), Boolean(payload.is_default_billing));

        const { data, error: insertError } = await supabaseAdmin
            .from("user_addresses")
            .insert({
                user_id: userId,
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

        if (insertError) throw insertError;

        return NextResponse.json({ success: true, id: data.id });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to create address";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
