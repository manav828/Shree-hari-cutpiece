import "server-only";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import type { ThemeName } from "@/themes/registry";
import { getDefaultTheme, parseThemeValue, STOREFRONT_THEME_COOKIE } from "@/lib/themeSelection";

const DEFAULT_THEME: ThemeName = getDefaultTheme();

export async function getActiveTheme(): Promise<ThemeName> {
    const cookieTheme = parseThemeValue(cookies().get(STOREFRONT_THEME_COOKIE)?.value);
    if (cookieTheme) {
        return cookieTheme;
    }

    try {
        const { data, error } = await supabaseAdmin
            .from("site_settings")
            .select("value")
            .eq("key", "active_theme")
            .single();

        if (error && error.code !== "PGRST116") {
            throw error;
        }

        const theme = parseThemeValue((data as { value?: unknown } | null)?.value);
        return theme ?? DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}
