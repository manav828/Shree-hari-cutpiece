"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/themes/classic/components/layout/Navbar";
import Footer from "@/themes/classic/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogCard from "@/components/blog/BlogCard";
import BlogRenderer from "@/components/blog/BlogRenderer";
import ShareButtons from "@/components/blog/ShareButtons";
import ProductCard from "@/components/shop/ProductCard";
import { BlogDetailPageProps } from "@/types/blog";

export default function ClassicBlogDetailPage({
    post,
    relatedPosts,
    relatedProducts,
    tags,
    readTime,
    shareUrl,
    variants,
    languageLabels,
    blogBasePath,
}: BlogDetailPageProps) {
    const activeVariants = variants.filter((variant) => variant.language !== post.language);

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-6 lg:pt-12 pb-0 bg-background min-h-screen">
                <Container>
                    {/* Breadcrumb */}
                    <nav className="mb-6">
                        <ol className="flex items-center gap-2 text-sm text-text-secondary">
                            <li>
                                <Link href="/" className="hover:text-accent transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>/</li>
                            <li>
                                <Link href={blogBasePath} className="hover:text-accent transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="text-foreground truncate max-w-[200px] sm:max-w-xs">{post.title}</li>
                        </ol>
                    </nav>

                    <article className="w-full">
                        {/* Header */}
                        {post.show_header !== false && (
                            <header className="text-center mb-8">
                                {post.category?.name && (
                                    <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-xs font-semibold tracking-widest uppercase mb-6 rounded-full">
                                        {post.category.name}
                                    </span>
                                )}
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-8">
                                    {post.title}
                                </h1>
                                <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
                                    <div className="flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-serif">
                                            {(post.author_name || "S").charAt(0)}
                                        </span>
                                        <span>{post.author_name || "Editorial Team"}</span>
                                    </div>
                                    {post.published_at && (
                                        <>
                                            <span>•</span>
                                            <span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                        </>
                                    )}
                                    {readTime && (
                                        <>
                                            <span>•</span>
                                            <span>{readTime}</span>
                                        </>
                                    )}
                                </div>

                                {/* Tags displayed under header info */}
                                {tags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-block px-2.5 py-1 bg-neutral-100 text-neutral-600 text-xs font-medium rounded-full"
                                            >
                                                #{tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {activeVariants.length > 0 && (
                                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                                        {activeVariants.map((variant) => (
                                            <Link
                                                key={variant.language}
                                                href={`${variant.language === "hi" ? "/hi/blogs" : "/blogs"}/${variant.slug}`}
                                                className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:text-foreground"
                                            >
                                                {languageLabels[variant.language] || variant.language}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </header>
                        )}

                        {/* Featured Image */}
                        {post.show_cover !== false && (
                            <div className="aspect-[16/9] sm:aspect-[2/1] relative overflow-hidden bg-background-secondary mb-16 rounded-lg">
                                {post.cover_media?.public_url ? (
                                    <Image
                                        src={post.cover_media.public_url}
                                        alt={post.cover_media.alt_text || post.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 960px"
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-neutral-100 to-neutral-200" />
                                )}
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-full prose-p:text-text-secondary prose-headings:font-serif prose-headings:text-foreground">
                            {post.excerpt && (
                                <p className="text-xl md:text-2xl text-foreground/80 font-serif italic mb-10 leading-relaxed border-l-4 border-accent pl-6">
                                    {post.excerpt}
                                </p>
                            )}
                            {post.show_share_buttons !== false && (
                                <div className="mb-10">
                                    <ShareButtons title={post.title} url={shareUrl} />
                                </div>
                            )}
                            {post.editor_mode === "full_code" ? (
                                <div className="space-y-6 blog-custom-content">
                                    {post.full_page_css && <style dangerouslySetInnerHTML={{ __html: post.full_page_css }} />}
                                    {post.full_page_html && <div dangerouslySetInnerHTML={{ __html: post.full_page_html }} />}
                                    {post.full_page_js && <script dangerouslySetInnerHTML={{ __html: post.full_page_js }} />}
                                </div>
                            ) : (
                                <BlogRenderer layout={post.builder_layout} />
                            )}
                            <div className="mt-14 rounded-2xl border border-border bg-background-secondary px-6 py-6">
                                <p className="text-xs tracking-[0.28em] uppercase text-text-secondary">Continue Exploring</p>
                                <h3 className="mt-2 font-serif text-2xl text-foreground">Keep Building Your Fabric Plan</h3>
                                <div className="mt-5 flex flex-wrap gap-3">
                                    <Link
                                        href={blogBasePath}
                                        className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                                    >
                                        All Journal Articles
                                    </Link>
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                                    >
                                        Browse Fabric Collection
                                    </Link>
                                    {post.category?.name && (
                                        <Link
                                            href={`${blogBasePath}?category=${encodeURIComponent(post.category.name)}`}
                                            className="inline-flex items-center rounded-full border border-border bg-white px-4 py-2 text-sm text-foreground hover:border-accent hover:text-accent transition-colors"
                                        >
                                            More in {post.category.name}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </article>
                </Container>

                {post.show_related_products !== false && relatedProducts.length > 0 && (
                    <section className="mt-24 border-t border-border pt-12 bg-background-secondary">
                        <Container>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6 text-center">
                                {post.related_products_title || "Shop This Story"}
                            </h2>
                            <div
                                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-6"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {relatedProducts.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* More Articles Section */}
                {relatedPosts.length > 0 && (
                    <section className="mt-32 border-t border-border pt-20 bg-background-secondary">
                        <Container>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-10 text-center">
                                More from our Journal
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {relatedPosts.map((relatedPost) => (
                                    <BlogCard
                                        key={relatedPost.id}
                                        post={{
                                            id: relatedPost.id,
                                            title: relatedPost.title,
                                            slug: relatedPost.slug,
                                            excerpt: relatedPost.excerpt,
                                            imageUrl: relatedPost.cover_media?.public_url ?? null,
                                            imageAlt: relatedPost.cover_media?.alt_text ?? relatedPost.title,
                                            category: relatedPost.category?.name ?? null,
                                            publishedAt: relatedPost.published_at,
                                        }}
                                    />
                                ))}
                            </div>
                        </Container>
                    </section>
                )}
            </main>
            <Footer />
        </>
    );
}
