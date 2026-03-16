"use server";

import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { revalidatePath } from "next/cache";
import type { CustomOrderStatus } from "@/types/orders";

// ─── Fetch all custom statuses ────────────────────────────────────────────────

export async function fetchCustomStatuses(): Promise<CustomOrderStatus[]> {
    const { data, error } = await supabaseAdmin
        .from("order_custom_statuses")
        .select("*")
        .order("sort_order", { ascending: true });

    if (error) {
        console.error("Error fetching custom statuses:", error);
        return [];
    }
    return (data ?? []) as CustomOrderStatus[];
}

// ─── Create a new custom status ───────────────────────────────────────────────

export async function createCustomStatus(label: string, color: string) {
    // Get current max sort_order
    const { data: existing } = await supabaseAdmin
        .from("order_custom_statuses")
        .select("sort_order")
        .order("sort_order", { ascending: false })
        .limit(1);

    const nextOrder = ((existing?.[0]?.sort_order as number) ?? -1) + 1;

    const { error } = await supabaseAdmin
        .from("order_custom_statuses")
        .insert({ label, color, sort_order: nextOrder });

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/settings");
    revalidatePath("/admin/orders");
    return { success: true };
}

// ─── Update an existing custom status ────────────────────────────────────────

export async function updateCustomStatus(id: string, label: string, color: string) {
    const { error } = await supabaseAdmin
        .from("order_custom_statuses")
        .update({ label, color })
        .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/settings");
    revalidatePath("/admin/orders");
    return { success: true };
}

// ─── Delete a custom status ───────────────────────────────────────────────────

export async function deleteCustomStatus(id: string) {
    const { error } = await supabaseAdmin
        .from("order_custom_statuses")
        .delete()
        .eq("id", id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/admin/settings");
    revalidatePath("/admin/orders");
    return { success: true };
}
