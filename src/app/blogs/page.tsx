import { Metadata } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { filterPublicContentPosts } from "@/lib/blogPublicContent";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";
import { getThemePage } from "@/themes/themeResolver";

const blogsTitle = "Blog & Fashion Guides | Shree Hari Cutpiece";
const blogsDescription = "Read our latest articles on fabric care, buying guides, and trending styles for premium cotton, silk, and georgette.";

export const metadata: Metadata = buildPageMetadata({
    title: blogsTitle,
    description: blogsDescription,
    path: "/blogs",
    alternates: {
        en: "/blogs",
        hi: "/hi/blogs",
    },
    keywords: ["fabric guide", "textile care", "dress material blog", "fabric styling tips"],
});

export const dynamic = "force-dynamic";

type BlogListRow = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    cover_media?: { public_url: string | null; alt_text: string | null } | null;
    category?: { name: string | null } | null;
};

type BlogsPageProps = {
    searchParams?: {
        category?: string | string[];
    };
};

function getSingleParam(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] || "";
    return value || "";
}

async function fetchPublishedPosts(language: "en" | "hi" | "other") {
    const languageOptions = Array.from(new Set([language, language.toUpperCase()]));
    const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, cover_media:cover_media_id (public_url, alt_text), category:category_id (name)")
        .eq("status", "published")
        .in("language", languageOptions)
        .order("published_at", { ascending: false });

    if (error) {
        return [] as any as BlogListRow[];
    }

    if ((data ?? []).length > 0) {
        return (data ?? []) as any as BlogListRow[];
    }

    const { data: fallbackData, error: fallbackError } = await supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, cover_media:cover_media_id (public_url, alt_text), category:category_id (name)")
        .eq("status", "published")
        .order("published_at", { ascending: false });

    if (fallbackError) {
        return [] as any as BlogListRow[];
    }

    return (fallbackData ?? []) as any as BlogListRow[];
}

export default async function BlogsPage({ searchParams }: BlogsPageProps) {
    const posts = filterPublicContentPosts(await fetchPublishedPosts("en"));
    const requestedCategory = getSingleParam(searchParams?.category).trim();
    const normalizedCategory = requestedCategory.toLocaleLowerCase("en-US");
    const filteredPosts = normalizedCategory
        ? posts.filter((post) => (post.category?.name || "").trim().toLocaleLowerCase("en-US") === normalizedCategory)
        : posts;
    const activeCategoryLabel = filteredPosts[0]?.category?.name || requestedCategory;
    const ThemeBlogPage = await getThemePage("BlogPage");

    const schemaMarkup = [
        buildWebPageSchema({
            path: "/blogs",
            title: blogsTitle,
            description: blogsDescription,
            type: "CollectionPage",
        }),
        buildBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blogs" },
        ]),
    ];

    return (
        <>
            {schemaMarkup.map((schema, index) => (
                <script
                    key={`blogs-schema-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            <ThemeBlogPage
                posts={filteredPosts}
                requestedCategory={requestedCategory}
                activeCategoryLabel={activeCategoryLabel}
            />
        </>
    );
}
