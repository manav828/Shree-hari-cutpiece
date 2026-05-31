"use client";

import Link from "next/link";
import Image from "next/image";
import Navbar from "@/themes/luxury/components/layout/Navbar";
import Footer from "@/themes/luxury/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogRenderer from "@/components/blog/BlogRenderer";
import ShareButtons from "@/components/blog/ShareButtons";
import ProductCard from "@/components/shop/ProductCard";
import { BlogDetailPageProps } from "@/types/blog";
import { ArrowLeft, ArrowRight, Calendar, Clock, Tag } from "lucide-react";

export default function LuxuryBlogDetailPage({
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
        <div className="bg-[#050505] text-[#F5F5F7] min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black">
            <Navbar />
            <CartSidebar />
            
            <main className="pt-24 pb-20">
                <Container>
                    {/* Elegant Back Navigation */}
                    <div className="w-full mb-8">
                        <Link href={blogBasePath} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 hover:text-[#D4AF37] transition-colors">
                            <ArrowLeft className="w-3 h-3" />
                            Back to Journal
                        </Link>
                    </div>

                    <article className="w-full">
                        {/* Header */}
                        {post.show_header !== false && (
                            <header className="text-center mb-12">
                                {post.category?.name && (
                                    <span className="inline-block px-4 py-1 border border-[#D4AF37]/30 text-[#D4AF37] text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
                                        {post.category.name}
                                    </span>
                                )}
                                <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-8 max-w-3xl mx-auto">
                                    {post.title}
                                </h1>
                                <div className="flex items-center justify-center flex-wrap gap-6 text-[10px] tracking-widest uppercase text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-none border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center font-serif text-xs">
                                            {(post.author_name || "S").charAt(0)}
                                        </span>
                                        <span>{post.author_name || "Editorial Team"}</span>
                                    </div>
                                    {post.published_at && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 text-[#D4AF37]" />
                                            <span>{new Date(post.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                        </div>
                                    )}
                                    {readTime && (
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 text-[#D4AF37]" />
                                            <span>{readTime}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Luxury Outlined Tags */}
                                {tags.length > 0 && (
                                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                                        {tags.map((tag) => (
                                            <span
                                                key={tag.id}
                                                className="inline-block px-3 py-1 border border-white/10 hover:border-[#D4AF37]/40 text-gray-400 hover:text-[#D4AF37] text-[9px] font-medium tracking-widest uppercase transition-colors"
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
                                                className="border border-white/5 hover:border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-gray-400 hover:text-white"
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
                            <div className="aspect-[16/9] sm:aspect-[2/1] relative overflow-hidden bg-[#0f0f0f] mb-16 border border-white/5">
                                {post.cover_media?.public_url ? (
                                    <Image
                                        src={post.cover_media.public_url}
                                        alt={post.cover_media.alt_text || post.title}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 960px"
                                        className="object-cover opacity-90"
                                        priority
                                    />
                                ) : (
                                    <div className="h-full w-full bg-gradient-to-br from-neutral-900 to-neutral-950" />
                                )}
                            </div>
                        )}

                        {/* Article Body */}
                        <div className="prose prose-invert prose-lg max-w-full prose-p:text-gray-300 prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-white prose-a:text-[#D4AF37] hover:prose-a:text-white transition-colors">
                            {post.excerpt && (
                                <p className="text-xl md:text-2xl text-[#F5F5F7]/95 font-serif italic mb-12 leading-relaxed border-l-2 border-[#D4AF37] pl-6">
                                    {post.excerpt}
                                </p>
                            )}
                            {post.show_share_buttons !== false && (
                                <div className="mb-12 border-b border-white/5 pb-8">
                                    <ShareButtons title={post.title} url={shareUrl} />
                                </div>
                            )}
                            
                            {/* Renderer */}
                            {post.editor_mode === "full_code" ? (
                                <div className="space-y-6 blog-custom-content">
                                    {post.full_page_css && <style dangerouslySetInnerHTML={{ __html: post.full_page_css }} />}
                                    {post.full_page_html && <div dangerouslySetInnerHTML={{ __html: post.full_page_html }} />}
                                    {post.full_page_js && <script dangerouslySetInnerHTML={{ __html: post.full_page_js }} />}
                                </div>
                            ) : (
                                <BlogRenderer layout={post.builder_layout} />
                            )}

                            {/* Explore block */}
                            <div className="mt-16 border border-white/5 bg-[#0f0f0f] px-8 py-8">
                                <p className="text-[9px] tracking-[0.3em] uppercase text-gray-500">Continue Reading</p>
                                <h3 className="mt-2 font-serif text-2xl text-white">Curate Your Next Look</h3>
                                <div className="mt-6 flex flex-wrap gap-4">
                                    <Link
                                        href={blogBasePath}
                                        className="inline-flex items-center border border-white/10 hover:border-[#D4AF37] bg-black text-[#F5F5F7] hover:text-[#D4AF37] px-5 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300"
                                    >
                                        Journal Archive
                                    </Link>
                                    <Link
                                        href="/shop"
                                        className="inline-flex items-center border border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black bg-transparent text-[#D4AF37] px-5 py-3 text-[10px] font-bold tracking-widest uppercase transition-all duration-300"
                                    >
                                        Browse Fabrics
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>
                </Container>

                {/* Related Products Section */}
                {post.show_related_products !== false && relatedProducts.length > 0 && (
                    <section className="mt-28 border-t border-white/5 pt-16 bg-[#0a0a0a]">
                        <Container>
                            <h2 className="font-serif text-3xl text-white mb-10 text-center tracking-wide">
                                {post.related_products_title || "Shop This Story"}
                            </h2>
                            <div
                                className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-6 max-w-6xl mx-auto"
                                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                            >
                                {relatedProducts.map((product) => (
                                    <div key={product.id} className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start bg-[#0f0f0f] border border-white/5 p-2">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </Container>
                    </section>
                )}

                {/* More Articles Section */}
                {relatedPosts.length > 0 && (
                    <section className="mt-28 border-t border-white/5 pt-20 bg-[#080808]">
                        <Container>
                            <h2 className="font-serif text-3xl text-white mb-12 text-center tracking-wide">
                                More from our Journal
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {relatedPosts.map((relatedPost) => {
                                    const relatedCover = relatedPost.cover_media?.public_url || "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=800";
                                    return (
                                        <article key={relatedPost.id} className="group bg-[#0f0f0f] border border-white/5 hover:border-white/10 flex flex-col h-full transition-all duration-300">
                                            <Link href={`/blogs/${relatedPost.slug}`} className="relative aspect-[16/10] overflow-hidden bg-black block">
                                                <Image
                                                    src={relatedCover}
                                                    alt={relatedPost.cover_media?.alt_text || relatedPost.title}
                                                    fill
                                                    sizes="300px"
                                                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-103 transition-all duration-500 mix-blend-luminosity hover:mix-blend-normal"
                                                />
                                            </Link>
                                            <div className="p-6 flex flex-col flex-grow">
                                                <span className="text-[#D4AF37] text-[8px] tracking-[0.25em] uppercase font-bold block mb-2">
                                                    {relatedPost.category?.name || "Journal"}
                                                </span>
                                                <h3 className="font-serif text-lg text-white group-hover:text-[#D4AF37] transition-colors leading-snug mb-3 flex-grow">
                                                    <Link href={`/blogs/${relatedPost.slug}`}>
                                                        {relatedPost.title}
                                                    </Link>
                                                </h3>
                                                <Link href={`/blogs/${relatedPost.slug}`} className="text-[9px] uppercase tracking-widest font-bold text-gray-400 group-hover:text-white transition-colors flex items-center gap-2">
                                                    Read Entry <ArrowRight className="w-3 h-3" />
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
