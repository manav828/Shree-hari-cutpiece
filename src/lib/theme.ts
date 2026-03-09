import { supabase } from "./supabase";
import type { ThemeName } from "@/themes/registry";

const DEFAULT_THEME: ThemeName = "classic";

export async function getActiveTheme(): Promise<ThemeName> {
    try {
        const { data, error } = await supabase
            .from("site_settings")
            .select("value")
            .eq("key", "active_theme")
            .single();

        if (error || !data) return DEFAULT_THEME;

        const theme = data.value as string;

        // Validate against known themes
        if (theme === "classic" || theme === "luxury") {
            return theme as ThemeName;
        }

        return DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}
