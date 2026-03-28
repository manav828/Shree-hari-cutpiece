import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { getSiteUrl } from "@/lib/siteUrl";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl();

    const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("slug, language, updated_at, published_at")
        .eq("status", "published");

    const blogEntries = (error ? [] : (data ?? [])).map((post: { slug: string; language: string; updated_at: string | null; published_at: string | null }) => {
        const path = post.language === "hi" ? `/hi/blogs/${post.slug}` : `/blogs/${post.slug}`;
        return {
            url: `${baseUrl}${path}`,
            lastModified: post.updated_at || post.published_at || new Date().toISOString(),
        };
    });

    return [
        {
            url: baseUrl,
            lastModified: new Date().toISOString(),
        },
        {
            url: `${baseUrl}/blogs`,
            lastModified: new Date().toISOString(),
        },
        {
            url: `${baseUrl}/hi/blogs`,
            lastModified: new Date().toISOString(),
        },
        ...blogEntries,
    ];
}
