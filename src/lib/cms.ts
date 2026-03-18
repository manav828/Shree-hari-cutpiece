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
