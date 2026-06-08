import type { ThemeName } from "@/themes/registry";

export function getThemeSync(): ThemeName {
  // Synchronous theme lookup for UI components and client-side rendering.
  // Set NEXT_PUBLIC_ACTIVE_THEME in .env.local to change themes.
  const envTheme = process.env.NEXT_PUBLIC_ACTIVE_THEME;
  if (envTheme === "classic" || envTheme === "bohemian" || envTheme === "luxury") {
    return envTheme as ThemeName;
  }
  return "classic"; // Fallback default theme
}
