import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { filterPublicContentPosts } from "@/lib/blogPublicContent";

type JournalPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    published_at: string | null;
    category?: { name: string | null } | null;
    cover_media?: { public_url: string | null; alt_text: string | null } | null;
};

async function fetchRecentJournalPosts(): Promise<JournalPost[]> {
    const { data, error } = await supabaseAdmin
        .from("blog_posts")
        .select("id, title, slug, excerpt, published_at, category:category_id (name), cover_media:cover_media_id (public_url, alt_text)")
        .eq("status", "published")
        .in("language", ["en", "EN"])
        .order("published_at", { ascending: false })
        .limit(6);

    if (error || !data) {
        return [];
    }

    return filterPublicContentPosts(data as JournalPost[]).slice(0, 3);
}

function formatDate(date: string | null): string {
    if (!date) return "Recently updated";
    return new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
}

export default async function JournalPreview() {
    const posts = await fetchRecentJournalPosts();

    if (posts.length === 0) {
        return (
            <section className="section-padding bg-[#F5EEE9] border-y border-border/60">
                <Container>
                    <div className="bg-white border border-border/60 shadow-premium p-8 sm:p-10 text-center max-w-3xl mx-auto">
                        <p className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Journal</p>
                        <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-4">Fabric Knowledge, Straight from the Counter</h2>
                        <p className="text-text-secondary leading-relaxed mb-8">
                            Our buying guides and care explainers will be published here shortly. Explore our complete editorial feed in the meantime.
                        </p>
                        <Link
                            href="/blogs"
                            className="inline-flex items-center justify-center border border-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium text-foreground hover:bg-foreground hover:text-white transition-colors"
                        >
                            Explore Journal
                        </Link>
                    </div>
                </Container>
            </section>
        );
    }

    const featured = posts[0];
    const supporting = posts.slice(1);

    return (
        <section className="section-padding bg-[#F5EEE9] border-y border-border/60">
            <Container>
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
                    <div className="max-w-2xl">
                        <p className="text-accent text-xs tracking-[0.3em] uppercase mb-4">Journal</p>
                        <h2 className="font-serif text-4xl sm:text-5xl text-foreground leading-[1.08] mb-4">Fabric Guides for Smarter Buying</h2>
                        <p className="text-text-secondary text-base sm:text-lg leading-relaxed">
                            Learn practical styling, fabric care, and selection tips before placing your next custom order.
                        </p>
                    </div>
                    <Link
                        href="/blogs"
                        className="inline-flex items-center gap-2 text-xs tracking-[0.2em] uppercase font-medium text-foreground border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
                    >
                        View All Articles
                        <span aria-hidden>→</span>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-12 gap-5 lg:gap-7">
                    <article className="lg:col-span-7 bg-white border border-border/60 overflow-hidden shadow-premium group">
                        <Link href={`/blogs/${featured.slug}`} className="block">
                            <div className="relative aspect-[16/10] overflow-hidden bg-background-secondary">
                                {featured.cover_media?.public_url ? (
                                    <Image
                                        src={featured.cover_media.public_url}
                                        alt={featured.cover_media.alt_text || featured.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 58vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-[#e9ddd4]" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
                                <div className="absolute left-5 right-5 bottom-5 text-white">
                                    <p className="text-[10px] tracking-[0.24em] uppercase mb-2 text-white/80">
                                        {featured.category?.name || "Fabric Guide"}
                                    </p>
                                    <h3 className="font-serif text-2xl sm:text-3xl leading-tight">{featured.title}</h3>
                                </div>
                            </div>
                        </Link>
                        <div className="p-6 sm:p-7">
                            <p className="text-text-secondary leading-relaxed line-clamp-3 mb-5">
                                {featured.excerpt || "Practical guidance to help you choose the right fabric for design, drape, and comfort."}
                            </p>
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-text-secondary">{formatDate(featured.published_at)}</span>
                                <Link href={`/blogs/${featured.slug}`} className="text-accent hover:text-accent/80 transition-colors font-medium">
                                    Read Guide
                                </Link>
                            </div>
                        </div>
                    </article>

                    <div className="lg:col-span-5 grid gap-5">
                        {supporting.map((post) => (
                            <article key={post.id} className="bg-white border border-border/60 shadow-premium group">
                                <Link href={`/blogs/${post.slug}`} className="grid sm:grid-cols-[160px,1fr] h-full">
                                    <div className="relative min-h-[160px] bg-background-secondary overflow-hidden">
                                        {post.cover_media?.public_url ? (
                                            <Image
                                                src={post.cover_media.public_url}
                                                alt={post.cover_media.alt_text || post.title}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 180px"
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-[#efe3d9]" />
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col justify-between">
                                        <div>
                                            <p className="text-[10px] tracking-[0.2em] uppercase text-accent mb-2">
                                                {post.category?.name || "Journal"}
                                            </p>
                                            <h3 className="font-serif text-2xl leading-tight text-foreground mb-3 group-hover:text-accent transition-colors">
                                                {post.title}
                                            </h3>
                                            <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                                                {post.excerpt || "Understand drape, care, and fit before you place your next order."}
                                            </p>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                                            <span>{formatDate(post.published_at)}</span>
                                            <span className="text-accent font-medium">Read</span>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    );
}