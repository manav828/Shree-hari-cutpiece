"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/themes/luxury/components/layout/Navbar";
import Footer from "@/themes/luxury/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { BlogPageProps } from "@/types/blog";
import { ArrowRight, Calendar, Tag } from "lucide-react";

export default function LuxuryBlogPage({
    posts,
    requestedCategory,
    activeCategoryLabel,
}: BlogPageProps) {
    return (
        <div className="bg-[#050505] text-[#F5F5F7] min-h-screen font-sans selection:bg-[#D4AF37] selection:text-black">
            <Navbar />
            <CartSidebar />
            
            <main className="pt-20 pb-32">
                {/* Hero Section */}
                <section className="relative py-24 md:py-32 border-b border-white/5 overflow-hidden">
                    <div className="absolute inset-0 w-full h-full z-0 opacity-20">
                        <Image
                            src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1800&q=80"
                            alt="Luxury textile detailing background"
                            fill
                            sizes="100vw"
                            className="object-cover mix-blend-luminosity scale-105"
                            priority
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/70 to-[#050505]/40 z-0"></div>

                    <Container className="relative z-10 text-center max-w-4xl">
                        <span className="text-[#D4AF37] tracking-[0.4em] text-[10px] uppercase font-bold block mb-6">
                            THE HARMONY OF DESIGN & CRAFT
                        </span>
                        <h1 className="font-serif text-5xl md:text-7xl leading-tight text-white mb-6">
                            The Journal
                        </h1>
                        <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-6"></div>
                        <p className="text-gray-400 font-light text-xs md:text-sm max-w-xl mx-auto leading-relaxed tracking-wide">
                            Insights on textile curation, styling geometry, and premium fabric preservation.
                        </p>
                    </Container>
                </section>

                {/* Filter and Content */}
                <section className="mt-16">
                    <Container>
                        {requestedCategory && (
                            <div className="mb-12 max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-[#0f0f0f] px-6 py-4 text-xs tracking-wider uppercase">
                                <p className="text-gray-400">
                                    Archive / <span className="font-bold text-[#D4AF37]">{activeCategoryLabel}</span>
                                </p>
                                <Link href="/blogs" className="text-white hover:text-[#D4AF37] transition-colors border-b border-white hover:border-[#D4AF37] pb-0.5">
                                    Show All Articles
                                </Link>
                            </div>
                        )}

                        {posts.length === 0 ? (
                            <div className="max-w-5xl mx-auto border border-white/5 bg-[#0f0f0f]/30 px-6 py-20 text-center text-gray-500 rounded-sm">
                                {requestedCategory
                                    ? "No entries found in this collection."
                                    : "The journal is currently empty. Check back soon."}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
                                {posts.map((post) => {
                                    const coverUrl = post.cover_media?.public_url || "https://images.unsplash.com/photo-1596464716127-f2a82984de30?q=80&w=800";
                                    return (
                                        <article key={post.id} className="group flex flex-col bg-[#0f0f0f] border border-white/5 hover:border-white/10 transition-all duration-500 rounded-none overflow-hidden h-full">
                                            {/* Cover Image Container */}
                                            <Link href={`/blogs/${post.slug}`} className="relative aspect-[1.618/1] overflow-hidden bg-black block">
                                                <Image
                                                    src={coverUrl}
                                                    alt={post.cover_media?.alt_text || post.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 400px"
                                                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 mix-blend-luminosity hover:mix-blend-normal"
                                                />
                                            </Link>
                                            
                                            {/* Info Block */}
                                            <div className="flex flex-col flex-grow p-6 lg:p-8">
                                                {/* Meta Info */}
                                                <div className="flex items-center gap-4 text-[9px] tracking-widest uppercase text-gray-500 mb-4">
                                                    {post.category?.name && (
                                                        <span className="text-[#D4AF37] font-semibold flex items-center gap-1">
                                                            <Tag className="w-2.5 h-2.5" />
                                                            {post.category.name}
                                                        </span>
                                                    )}
                                                    {post.published_at && (
                                                        <span className="flex items-center gap-1">
                                                            <Calendar className="w-2.5 h-2.5" />
                                                            {new Date(post.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h2 className="font-serif text-xl lg:text-2xl text-white group-hover:text-[#D4AF37] transition-colors leading-tight mb-4 flex-grow">
                                                    <Link href={`/blogs/${post.slug}`}>
                                                        {post.title}
                                                    </Link>
                                                </h2>

                                                {/* Excerpt */}
                                                <p className="text-gray-400 font-light text-xs leading-relaxed mb-6 line-clamp-3">
                                                    {post.excerpt || "No description provided."}
                                                </p>

                                                {/* Link Button */}
                                                <div className="pt-2">
                                                    <Link href={`/blogs/${post.slug}`} className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-[#D4AF37] hover:text-white transition-all group/link">
                                                        Read Entry 
                                                        <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </Container>
                </section>
            </main>

            <Footer />
        </div>
    );
}
