import "server-only";
import { unstable_cache } from "next/cache";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import type { ThemeName } from "@/themes/registry";
import { getDefaultTheme, parseThemeValue, STOREFRONT_THEME_COOKIE } from "@/lib/themeSelection";
import { CACHE_TAGS, CACHE_TTL_SECONDS, getCacheEnabled } from "@/lib/cache";

const DEFAULT_THEME: ThemeName = getDefaultTheme();

async function fetchActiveTheme(): Promise<ThemeName> {
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

const fetchActiveThemeCached = unstable_cache(
    fetchActiveTheme,
    ["active_theme"],
    { revalidate: CACHE_TTL_SECONDS, tags: [CACHE_TAGS.siteConfig] },
);

export async function getActiveTheme(): Promise<ThemeName> {
    // Cookie always wins — used for theme preview/switching
    const cookieTheme = parseThemeValue(cookies().get(STOREFRONT_THEME_COOKIE)?.value);
    if (cookieTheme) {
        return cookieTheme;
    }

    const cacheEnabled = await getCacheEnabled();
    return cacheEnabled ? fetchActiveThemeCached() : fetchActiveTheme();
}

