import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "./supabaseAdminClient";

/**
 * Cryptographically verifies the admin session token stored in the cookie
 * and confirms the user has the 'admin' role in the database.
 */
export async function verifyAdminSession(): Promise<boolean> {
    try {
        const cookieStore = cookies();
        const token = cookieStore.get("shreehari_admin_session")?.value;
        if (!token) return false;

        // Verify the JWT access token directly with Supabase
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) return false;

        // Verify that the user role is indeed admin
        const { data: profile } = await supabaseAdmin
            .from("user_profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        return profile?.role === "admin";
    } catch (err) {
        console.error("Error verifying admin session:", err);
        return false;
    }
}
