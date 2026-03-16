import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            page: 1,
            perPage: 200,
        });

        if (error) throw error;

        const users = (data?.users ?? []).map((user) => ({
            id: user.id,
            email: user.email ?? "",
            name: (user.user_metadata?.full_name as string | undefined) ?? "",
        }));

        return NextResponse.json({ users });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to fetch users";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
