"use server";

import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { revalidatePath } from "next/cache";
import { triggerOrderNotification } from "@/lib/notifications";

export async function updateOrderStatus(orderId: string, newStatus: string, note?: string) {
    try {
        // Update the main order status
        const { error: updateError } = await supabaseAdmin
            .from("orders")
            .update({ status: newStatus })
            .eq("id", orderId);

        if (updateError) throw updateError;

        // Insert into history
        const { error: historyError } = await supabaseAdmin
            .from("order_status_history")
            .insert({
                order_id: orderId,
                to_status: newStatus,
                note: note || `Status updated to ${newStatus} by admin`,
            });

        if (historyError) throw historyError;

        // Trigger shipping or delivery notifications in background
        if (newStatus.toLowerCase() === "shipped") {
            triggerOrderNotification(orderId, "shipped").catch(err => {
                console.error("[updateOrderStatus] Shipped notification error:", err);
            });
        } else if (newStatus.toLowerCase() === "delivered") {
            triggerOrderNotification(orderId, "delivered").catch(err => {
                console.error("[updateOrderStatus] Delivered notification error:", err);
            });
        }

        revalidatePath(`/admin/orders/${orderId}`);
        revalidatePath(`/admin/orders`);
        return { success: true };
    } catch (e: any) {
        console.error("Error updating order status:", e);
        return { success: false, error: e.message };
    }
}

export async function updateOrderTracking(orderId: string, trackingUrl: string) {
    try {
        const { error } = await supabaseAdmin
            .from("orders")
            .update({ tracking_url: trackingUrl || null })
            .eq("id", orderId);

        if (error) throw error;

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateOrderNotes(orderId: string, notes: string) {
    try {
        const { error } = await supabaseAdmin
            .from("orders")
            .update({ notes: notes || null })
            .eq("id", orderId);

        if (error) throw error;

        revalidatePath(`/admin/orders/${orderId}`);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
