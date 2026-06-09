"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import BlogRenderer from "@/components/blog/BlogRenderer";
import ShareButtons from "@/components/blog/ShareButtons";
import ProductCard from "@/themes/bohemian/core/components/shop/ProductCard";
import { BlogDetailPageProps } from "@/types/blog";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";

const manrope = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Cormorant_Garamond({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["400", "500", "600", "700"],
});

export default function BohemianBlogDetailPage({
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
        <div className={`${manrope.className} min-h-screen bg-[#fcf9f4] text-[#1c1c19] selection:bg-[#ffdad2] selection:text-[#3d0600]`}>
            <CartSidebar />
            <Navbar />

            <main className="pt-10 pb-20">
                <Container>
                    {/* Back Button */}
                    <div className="w-full mb-6">
                        <Link href={blogBasePath} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#56423d] hover:text-[#9f3f29] transition-colors">
                            <ArrowLeft className="w-3.5 h-3.5" />
                            Back to Diary
                        </Link>
                    </div>

                    <article className="w-full">
                        {/* Header */}
                        {post.show_header !== false && (
                            <header className="text-center mb-10 border-b border-[#ddc0ba]/40 pb-10">
                                {post.category?.name && (
                                    <span className="inline-block px-4 py-1.5 bg-[#ffdad2]/55 text-[#3d0600] text-xs font-bold tracking-[0.15em] uppercase mb-5 rounded-full">
                                        {post.category.name}
                                    </span>
                                )}
                                <h1 className={`${newsreader.className} text-4xl md:text-5xl lg:text-6xl text-[#1c1c19] leading-tight mb-6 font-semibold`}>
                                    {post.title}
                                </h1>
                                <div className="flex items-center justify-center flex-wrap gap-5 text-xs text-[#56423d] font-medium">
                                    <div className="flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-full bg-[#9f3f29] text-white flex items-center justify-center font-serif text-sm">
                                            {(post.author_name || "S").charAt(0)}
                                        </span>
                                        <span>{post.author_name || "Editorial Team"}</span>
                                    </div>
                                    {post.published_at && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4 text-[#9f3f29]" />
                                            <span>{new Date(post.published_at).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" })}</span>
                                        </div>
                                    )}
                                    {readTime && (
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-[#9f3f29]" />
                                            <span>{readTime}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Earthy Tag Chips */}
                                {tags.length > 0 && (
                                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-block px-3 py-1 bg-[#f0ede8] hover:bg-[#e6e2da] text-[#5f5954] text-xs font-semibold rounded-full transition-colors"
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
                                                className="rounded-full border border-[#ddc0ba] px-3 py-1 text-xs text-[#56423d] hover:border-[#9f3f29] hover:text-[#9f3f29]"
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
                            <div className="aspect-[16/9] sm:aspect-[2/1] relative overflow-hidden bg-[#f5f2eb] mb-12 rounded-2xl">
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
                                    <div className="h-full w-full bg-[#f0ede8]" />
                                )}
                            </div>
                        )}

                        {/* Excerpt and Body */}
                        <div className="prose prose-lg max-w-full prose-p:text-[#56423d] prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-[#1c1c19] prose-a:text-[#9f3f29] hover:prose-a:underline">
                            {post.excerpt && (
                                <p className={`${newsreader.className} text-2xl text-[#1c1c19]/90 italic mb-10 leading-relaxed border-l-4 border-[#9f3f29] pl-6`}>
                                    {post.excerpt}
                                </p>
                            )}
                            {post.show_share_buttons !== false && (
                                <div className="mb-10 border-b border-[#f5f2eb] pb-6">
                                    <ShareButtons title={post.title} url={shareUrl} />
                                </div>
                            )}

                            {/* Render Custom layout or raw code */}
                            {post.editor_mode === "full_code" ? (
                                <div className="space-y-6 blog-custom-content">
                                    {post.full_page_css && <style dangerouslySetInnerHTML={{ __html: post.full_page_css }} />}
                                    {post.full_page_html && <div dangerouslySetInnerHTML={{ __html: post.full_page_html }} />}
                                    {post.full_page_js && <script dangerouslySetInnerHTML={{ __html: post.full_page_js }} />}
                                </div>
                            ) : (
                                <BlogRenderer layout={post.builder_layout} />
                            )}

                            {/* Bohemian organic info block */}
                            <div className="mt-16 rounded-2xl border border-[#ddc0ba] bg-white p-6 sm:p-8 shadow-xs">
                                <p className="text-xs uppercase tracking-wider text-[#89726c]">Explore Loom Crafts</p>
                                <h3 className={`${newsreader.className} mt-1.5 text-3xl font-semibold text-[#1c1c19]`}>Intentional Style Selections</h3>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <Link
                                        href={blogBasePath}
                                        className="inline-flex items-center rounded-xl border border-[#ddc0ba] bg-white px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#56423d] hover:border-[#9f3f29] hover:text-[#9f3f29] transition-colors"
                                    >
                                        Journal Home
                                    </Link>
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center rounded-xl bg-[#9f3f29] text-white px-5 py-3 text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-[0_8px_20px_rgba(159,63,41,0.15)]"
                                    >
                                        Shop Fabric Drops
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>
                </Container>

                {/* Related Products Section */}
                {post.show_related_products !== false && relatedProducts.length > 0 && (
                    <section className="mt-24 border-t border-[#ddc0ba]/40 pt-20 bg-[#fcf9f4]">
                        <Container>
                            <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between max-w-6xl mx-auto">
                                <h2 className={`${newsreader.className} text-4xl text-[#1c1c19] font-semibold`}>
                                    {post.related_products_title || "Shop This Story"}
                                </h2>
                                <Link href="/shop" className="text-sm font-semibold text-[#9f3f29] transition-opacity hover:opacity-70">
                                    Browse Living Collection
                                </Link>
                            </div>
                            <div
                                className="flex gap-7 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory max-w-6xl mx-auto"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {relatedProducts.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-[265px] snap-start">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* More Articles Section */}
                {relatedPosts.length > 0 && (
                    <section className="mt-20 border-t border-[#e6e2da] pt-16 bg-[#f5f2eb]">
                        <Container>
                            <h2 className={`${newsreader.className} text-4xl text-[#1c1c19] mb-10 text-center font-semibold`}>
                                More from our Journal
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {relatedPosts.map((relatedPost) => {
                                    const relatedCover = relatedPost.cover_media?.public_url || "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800";
                                    return (
                                        <article key={relatedPost.id} className="group bg-white border border-[#e6e2da] hover:border-[#9f3f29]/30 rounded-2xl overflow-hidden flex flex-col h-full transition-all duration-300">
                                            <Link href={`/blogs/${relatedPost.slug}`} className="relative aspect-[1.5/1] overflow-hidden block">
                                                <Image
                                                    src={relatedCover}
                                                    alt={relatedPost.cover_media?.alt_text || relatedPost.title}
                                                    fill
                                                    sizes="300px"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-103"
                                                />
                                            </Link>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <span className="text-[#9f3f29] text-[10px] tracking-widest uppercase font-semibold block mb-2 flex items-center gap-1">
                                                    <Tag className="w-3 h-3" />
                                                    {relatedPost.category?.name || "Journal"}
                                                </span>
                                                <h3 className={`${newsreader.className} text-2xl text-[#1c1c19] group-hover:text-[#9f3f29] transition-colors leading-snug mb-3 flex-grow font-semibold`}>
                                                    <Link href={`/blogs/${relatedPost.slug}`}>
                                                        {relatedPost.title}
                                                    </Link>
                                                </h3>
                                                <Link href={`/blogs/${relatedPost.slug}`} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#9f3f29] hover:underline">
                                                    Read Entry <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </Container>
                    </section>
                )}
            </main>

            <Footer />
        </div>
    );
}
