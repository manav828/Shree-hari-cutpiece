import type { ThemeName } from "@/themes/registry";

export function getThemeSync(): ThemeName {
  // Synchronous theme lookup for UI components and client-side rendering.
  if (typeof window !== "undefined") {
    // Client-side: read cookie
    const match = document.cookie.match(/(?:^|; )storefront_theme=([^;]*)/);
    if (match) {
      const val = match[1].replace(/"/g, "").trim().toLowerCase();
      if (val === "classic" || val === "bohemian" || val === "luxury") {
        return val as ThemeName;
      }
    }
  } else {
    // Server-side (SSR): try to read cookie from next/headers
    try {
      const { cookies } = require("next/headers");
      const cookieVal = cookies().get("storefront_theme")?.value;
      if (cookieVal) {
        const val = cookieVal.replace(/"/g, "").trim().toLowerCase();
        if (val === "classic" || val === "bohemian" || val === "luxury") {
          return val as ThemeName;
        }
      }
    } catch (e) {
      // Ignore and fallback
    }
  }

  // Fallback to env variable or default theme
  const envTheme = process.env.NEXT_PUBLIC_ACTIVE_THEME;
  if (envTheme === "classic" || envTheme === "bohemian" || envTheme === "luxury") {
    return envTheme as ThemeName;
  }
  return "classic"; // Fallback default theme
}
