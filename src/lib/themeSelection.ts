import type { ThemeName } from "@/themes/registry";

export const STOREFRONT_THEME_COOKIE = "storefront_theme";

const SUPPORTED_THEMES: ThemeName[] = ["classic", "luxury", "bohemian"];

export function parseThemeValue(value: unknown): ThemeName | null {
    if (typeof value !== "string") return null;

    const normalized = value.replace(/"/g, "").trim().toLowerCase();
    return SUPPORTED_THEMES.includes(normalized as ThemeName) ? (normalized as ThemeName) : null;
}

export function getDefaultTheme(): ThemeName {
    return parseThemeValue(process.env.NEXT_PUBLIC_DEFAULT_THEME) ?? "classic";
}