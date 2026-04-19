type PublicContentCandidate = {
    title?: string | null;
    slug?: string | null;
    excerpt?: string | null;
    seo_meta_title?: string | null;
    seo_meta_description?: string | null;
};

const excludedPostPattern = /\b(test|demo|sample|dummy|lorem)\b/i;

export function isPublicContentPost(post: PublicContentCandidate): boolean {
    const title = post.title || "";
    const slug = post.slug || "";
    const excerpt = post.excerpt || "";
    const metaTitle = post.seo_meta_title || "";
    const metaDescription = post.seo_meta_description || "";
    return !excludedPostPattern.test(`${title} ${slug} ${excerpt} ${metaTitle} ${metaDescription}`);
}

export function filterPublicContentPosts<T extends PublicContentCandidate>(posts: T[]): T[] {
    return posts.filter(isPublicContentPost);
}
