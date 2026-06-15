import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
        }

        // Authenticate with Supabase
        const { data, error } = await supabaseAdmin.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user || !data.session) {
            return NextResponse.json({ error: error?.message || "Invalid credentials." }, { status: 401 });
        }

        // Verify if user is admin in user_profiles
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .select("role")
            .eq("id", data.user.id)
            .maybeSingle();

        if (profileError) {
            return NextResponse.json({ error: "Failed to retrieve profile: " + profileError.message }, { status: 500 });
        }

        if (profile?.role !== "admin") {
            return NextResponse.json({ error: "Access denied. Not an admin." }, { status: 403 });
        }

        // Set secure HTTP-only cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                role: profile.role,
            },
        });

        response.cookies.set("shreehari_admin_session", data.session.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24, // 1 day
        });

        return response;
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Internal server error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}

export async function DELETE() {
    const response = NextResponse.json({ success: true });
    response.cookies.set("shreehari_admin_session", "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });
    return response;
}
