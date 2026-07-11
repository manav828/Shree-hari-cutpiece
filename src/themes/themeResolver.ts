import "server-only";
import { getActiveTheme } from "@/lib/theme";

/**
 * Server-side theme page resolver.
 * Uses conditional `await import()` so that Next.js only bundles & serves
 * the JS/CSS for the *active* theme – not all three.
 */

export type ThemePageName = "HomePage" | "ShopPage" | "ProductPage" | "BlogPage" | "BlogDetailPage" | "AboutPage";

export async function getThemePage(pageName: ThemePageName) {
    const activeTheme = await getActiveTheme();

    switch (activeTheme) {
        case "luxury":
            switch (pageName) {
                case "HomePage":       return (await import("@/themes/luxury/pages/HomePage")).default;
                case "ShopPage":       return (await import("@/themes/luxury/pages/ShopPage")).default;
                case "ProductPage":    return (await import("@/themes/luxury/pages/ProductPage")).default;
                case "BlogPage":       return (await import("@/themes/luxury/pages/BlogPage")).default;
                case "BlogDetailPage": return (await import("@/themes/luxury/pages/BlogDetailPage")).default;
                case "AboutPage":      return (await import("@/themes/luxury/pages/AboutPage")).default;
            }
            break;
        case "bohemian":
            switch (pageName) {
                case "HomePage":       return (await import("@/themes/bohemian/pages/HomePage")).default;
                case "ShopPage":       return (await import("@/themes/bohemian/pages/ShopPage")).default;
                case "ProductPage":    return (await import("@/themes/bohemian/pages/ProductPage")).default;
                case "BlogPage":       return (await import("@/themes/bohemian/pages/BlogPage")).default;
                case "BlogDetailPage": return (await import("@/themes/bohemian/pages/BlogDetailPage")).default;
                case "AboutPage":      return (await import("@/themes/bohemian/pages/AboutPage")).default;
            }
            break;
        default: // "classic" or fallback
            switch (pageName) {
                case "HomePage":       return (await import("@/themes/classic/pages/HomePage")).default;
                case "ShopPage":       return (await import("@/themes/classic/pages/ShopPage")).default;
                case "ProductPage":    return (await import("@/themes/classic/pages/ProductPage")).default;
                case "BlogPage":       return (await import("@/themes/classic/pages/BlogPage")).default;
                case "BlogDetailPage": return (await import("@/themes/classic/pages/BlogDetailPage")).default;
                case "AboutPage":      return (await import("@/themes/classic/pages/AboutPage")).default;
            }
    }

    // Absolute fallback to classic
    switch (pageName) {
        case "HomePage":       return (await import("@/themes/classic/pages/HomePage")).default;
        case "ShopPage":       return (await import("@/themes/classic/pages/ShopPage")).default;
        case "ProductPage":    return (await import("@/themes/classic/pages/ProductPage")).default;
        case "BlogPage":       return (await import("@/themes/classic/pages/BlogPage")).default;
        case "BlogDetailPage": return (await import("@/themes/classic/pages/BlogDetailPage")).default;
        case "AboutPage":      return (await import("@/themes/classic/pages/AboutPage")).default;
    }
}
