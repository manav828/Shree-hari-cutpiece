import { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { getSiteUrl } from "@/lib/siteUrl";
import { filterPublicContentPosts } from "@/lib/blogPublicContent";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = getSiteUrl();
    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("title, slug, excerpt, seo_meta_title, seo_meta_description, language, updated_at, published_at")
        .eq("status", "published");

    const publicPosts = filterPublicContentPosts(error ? [] : (data ?? []));
    const blogEntries = publicPosts.map((post: {
        slug: string;
        language: string;
        updated_at: string | null;
        published_at: string | null;
    }) => {
        const path = post.language === "hi" ? `/hi/blogs/${post.slug}` : `/blogs/${post.slug}`;
        return {
            url: `${baseUrl}${path}`,
            lastModified: post.updated_at || post.published_at || now,
        };
    });

    const staticRoutes = [
        "/",
        "/shop",
        "/about",
        "/contact",
        "/blogs",
        "/hi/blogs",
        "/shipping-policy",
        "/returns-policy",
        "/privacy-policy",
        "/terms-of-service",
    ];

    return [
        ...staticRoutes.map((path) => ({
            url: `${baseUrl}${path}`,
            lastModified: now,
        })),
        ...blogEntries,
    ];
}
