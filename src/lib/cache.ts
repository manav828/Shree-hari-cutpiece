import "server-only";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

// ─── Cache Tag Registry ─────────────────────────────────────────────────────
// All tags used across the app. Add new ones here when new cacheable data is added.
export const CACHE_TAGS = {
  products: "products",
  cmsBanners: "cms_banners",
  cmsCategories: "cms_categories",
  siteConfig: "site_config",
  blogPosts: "blog_posts",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const ALL_CACHE_TAGS: CacheTag[] = Object.values(CACHE_TAGS);

// Cache TTL: 1 hour
export const CACHE_TTL_SECONDS = 3600;

// ─── Cache Enabled Check ─────────────────────────────────────────────────────
// Always reads fresh from DB — never cached — so toggling works instantly.
export async function getCacheEnabled(): Promise<boolean> {
  if (process.env.NODE_ENV === "development") {
    return false;
  }
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "storefront_cache_enabled")
      .maybeSingle();

    if (error || !data) {
      // Default: cache is ON if the setting doesn't exist yet
      return true;
    }

    // Value is stored as JSON-encoded string, e.g. '"true"' or '"false"'
    let raw: unknown = data.value;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        // use as-is
      }
    }

    return String(raw) === "true";
  } catch {
    return true; // fail open: cache ON is safer than crashing
  }
}
