import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function POST(req: NextRequest) {
    try {
        const { userId, email, phone, cartItems } = await req.json();

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            // If the cart is empty, we should delete any pending abandoned carts for this user
            if (userId) {
                await supabaseAdmin
                    .from("abandoned_carts")
                    .delete()
                    .eq("user_id", userId)
                    .eq("status", "abandoned");
            } else if (email) {
                await supabaseAdmin
                    .from("abandoned_carts")
                    .delete()
                    .eq("email", email)
                    .eq("status", "abandoned");
            }
            return NextResponse.json({ success: true, message: "Cart cleared" });
        }

        // Try to find an existing abandoned cart record
        let existingRecord = null;

        if (userId) {
            const { data } = await supabaseAdmin
                .from("abandoned_carts")
                .select("id")
                .eq("user_id", userId)
                .eq("status", "abandoned")
                .maybeSingle();
            existingRecord = data;
        } else if (email) {
            const { data } = await supabaseAdmin
                .from("abandoned_carts")
                .select("id")
                .eq("email", email)
                .eq("status", "abandoned")
                .maybeSingle();
            existingRecord = data;
        } else if (phone) {
            const { data } = await supabaseAdmin
                .from("abandoned_carts")
                .select("id")
                .eq("phone", phone)
                .eq("status", "abandoned")
                .maybeSingle();
            existingRecord = data;
        }

        const recordData = {
            user_id: userId || null,
            email: email || null,
            phone: phone || null,
            cart_data: cartItems,
            last_seen: new Date().toISOString(),
            status: "abandoned"
        };

        if (existingRecord) {
            // Update existing
            const { error: updateError } = await supabaseAdmin
                .from("abandoned_carts")
                .update(recordData)
                .eq("id", existingRecord.id);

            if (updateError) throw updateError;
        } else {
            // Insert new
            const { error: insertError } = await supabaseAdmin
                .from("abandoned_carts")
                .insert(recordData);

            if (insertError) throw insertError;
        }

        return NextResponse.json({ success: true });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to sync cart";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
