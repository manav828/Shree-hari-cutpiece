import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

function getAuthToken(req: NextRequest): string | null {
    const auth = req.headers.get("authorization") || "";
    if (!auth.toLowerCase().startsWith("bearer ")) return null;
    return auth.slice(7).trim() || null;
}

export async function getAuthenticatedUserId(req: NextRequest): Promise<{ userId: string | null; error: string | null }> {
    const token = getAuthToken(req);
    if (!token) {
        return { userId: null, error: "Unauthorized request." };
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
        return { userId: null, error: "Invalid or expired session." };
    }

    return { userId: data.user.id, error: null };
}
