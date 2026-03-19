import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";

export type SiteConfigMap = Record<string, string>;

export type CmsCategory = {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string;
    sort_order: number;
    is_active: boolean;
};

export type CmsBannerPlacement = "announcement_bar" | "homepage_hero" | "shop_top" | "popup";

export type CmsBanner = {
    id: string;
    title: string;
    content_text: string;
    image_url: string;
    link_url: string;
    placement: CmsBannerPlacement;
    bg_color: string;
    text_color: string;
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    priority: number;
};

const loadSiteConfigMapCached = unstable_cache(
    async (): Promise<SiteConfigMap> => {
        const { data, error } = await supabaseAdmin
            .from("site_config")
            .select("key, value");

        if (error || !data) {
            return {};
        }

        return data.reduce<SiteConfigMap>((acc, row) => {
            acc[row.key] = row.value ?? "";
            return acc;
        }, {});
    },
    ["site_config_map"],
    { revalidate: 30 },
);

export async function getSiteConfigMap(): Promise<SiteConfigMap> {
    return loadSiteConfigMapCached();
}

const loadActiveCategoriesCached = unstable_cache(
    async (): Promise<CmsCategory[]> => {
        const { data, error } = await supabaseAdmin
            .from("categories")
            .select("id, name, slug, description, image, sort_order, is_active")
            .is("deleted_at", null)
            .eq("is_active", true)
            .order("sort_order", { ascending: true });

        if (error || !data) {
            return [];
        }

        return data.map((row) => ({
            id: row.id,
            name: row.name,
            slug: row.slug,
            description: row.description ?? "",
            image: row.image ?? "",
            sort_order: row.sort_order ?? 0,
            is_active: row.is_active ?? true,
        }));
    },
    ["cms_categories_active"],
    { revalidate: 30 },
);

export async function getActiveCmsCategories(): Promise<CmsCategory[]> {
    return loadActiveCategoriesCached();
}

function getTodayInIstDateString(): string {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    return formatter.format(new Date());
}

function isBannerActiveToday(banner: CmsBanner, todayIst: string): boolean {
    if (!banner.is_active) return false;
    if (banner.start_date && banner.start_date > todayIst) return false;
    if (banner.end_date && banner.end_date < todayIst) return false;
    return true;
}

const loadCmsBannersCached = unstable_cache(
    async (): Promise<CmsBanner[]> => {
        const { data, error } = await supabaseAdmin
            .from("banners")
            .select("id, title, content_text, image_url, link_url, placement, bg_color, text_color, is_active, start_date, end_date, priority")
            .is("deleted_at", null)
            .order("priority", { ascending: false })
            .order("created_at", { ascending: false });

        if (error || !data) {
            return [];
        }

        return data.map((row) => ({
            id: row.id,
            title: row.title,
            content_text: row.content_text ?? "",
            image_url: row.image_url ?? "",
            link_url: row.link_url ?? "",
            placement: row.placement as CmsBannerPlacement,
            bg_color: row.bg_color ?? "#000000",
            text_color: row.text_color ?? "#FFFFFF",
            is_active: row.is_active ?? true,
            start_date: row.start_date ?? null,
            end_date: row.end_date ?? null,
            priority: row.priority ?? 0,
        }));
    },
    ["cms_banners_all"],
    { revalidate: 30 },
);

export async function getActiveCmsBannersByPlacement(placement: CmsBannerPlacement): Promise<CmsBanner[]> {
    const all = await loadCmsBannersCached();
    const todayIst = getTodayInIstDateString();

    const active = all.filter((banner) => banner.placement === placement && isBannerActiveToday(banner, todayIst));

    // Fallback for hero slider UX: if only one active slide is available,
    // show all uploaded hero banners to keep carousel behavior useful.
    if (placement === "homepage_hero" && active.length <= 1) {
        return all.filter((banner) => banner.placement === placement && Boolean(banner.image_url?.trim()));
    }

    return active;
}
