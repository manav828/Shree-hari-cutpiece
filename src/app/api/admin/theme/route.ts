import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { getDefaultTheme, parseThemeValue, STOREFRONT_THEME_COOKIE } from "@/lib/themeSelection";

type ThemeApiResponse = {
    theme: string;
    persisted: boolean;
    warning?: string;
};

function jsonWithTheme(payload: ThemeApiResponse, status = 200) {
    const response = NextResponse.json(payload, { status });

    response.cookies.set({
        name: STOREFRONT_THEME_COOKIE,
        value: payload.theme,
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    });

    return response;
}

export async function GET(req: NextRequest) {
    const defaultTheme = getDefaultTheme();
    const cookieTheme = parseThemeValue(req.cookies.get(STOREFRONT_THEME_COOKIE)?.value);

    try {
        const { data, error } = await supabaseAdmin
            .from("site_settings")
            .select("value")
            .eq("key", "active_theme")
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        const dbTheme = parseThemeValue((data as { value?: unknown } | null)?.value);

        if (dbTheme) {
            return jsonWithTheme({
                theme: dbTheme,
                persisted: true,
            });
        }
    } catch {
        // Non-fatal: we can still serve cookie/default fallback.
    }

    if (cookieTheme) {
        return jsonWithTheme({
            theme: cookieTheme,
            persisted: false,
            warning: "Theme database is unreachable. Using browser fallback.",
        });
    }

    return jsonWithTheme({
        theme: defaultTheme,
        persisted: false,
        warning: "Theme database is unreachable. Using default theme.",
    });
}

export async function PUT(req: NextRequest) {
    const payload = await req.json().catch(() => null) as { theme?: unknown } | null;
    const requestedTheme = parseThemeValue(payload?.theme);

    if (!requestedTheme) {
        return NextResponse.json({ error: "Invalid theme value." }, { status: 400 });
    }

    try {
        const { error } = await supabaseAdmin
            .from("site_settings")
            .upsert({ key: "active_theme", value: requestedTheme }, { onConflict: "key" });

        if (error) throw error;

        return jsonWithTheme({
            theme: requestedTheme,
            persisted: true,
        });
    } catch {
        return jsonWithTheme({
            theme: requestedTheme,
            persisted: false,
            warning: "Theme saved in browser fallback mode because database update failed.",
        });
    }
}