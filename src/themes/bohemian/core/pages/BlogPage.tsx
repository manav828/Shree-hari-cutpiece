"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import { BlogPageProps } from "@/types/blog";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight, Calendar, Tag } from "lucide-react";

const manrope = Plus_Jakarta_Sans({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Cormorant_Garamond({
    subsets: ["latin"],
    style: ["normal", "italic"],
    weight: ["400", "500", "600", "700"],
});

export default function BohemianBlogPage({
    posts,
    requestedCategory,
    activeCategoryLabel,
}: BlogPageProps) {
    return (
        <div className={`${manrope.className} min-h-screen bg-[#fcf9f4] text-[#1c1c19] selection:bg-[#ffdad2] selection:text-[#3d0600]`}>
            <CartSidebar />
            <Navbar />

            <main className="pb-24">
                {/* Hero Section */}
                <section className="bg-[#f5f2eb] border-b border-[#e6e2da] py-20">
                    <Container>
                        <div className="max-w-3xl mx-auto text-center">
                            <span className="text-[#9f3f29] tracking-[0.25em] text-xs font-semibold uppercase block mb-4">
                                The Maker&apos;s Diary
                            </span>
                            <h1 className={`${newsreader.className} text-5xl md:text-7xl text-[#1c1c19] leading-tight mb-6`}>
                                Notes on Fabric &amp; Style
                            </h1>
                            <div className="w-16 h-0.5 bg-[#9f3f29] mx-auto mb-6"></div>
                            <p className="text-[#56423d] text-sm md:text-base leading-relaxed max-w-xl mx-auto">
                                Hand-crafted knowledge from our weaver communities, raw material buying guides, and styling inspiration.
                            </p>
                        </div>
                    </Container>
                </section>

                {/* Filters & Grid */}
                <section className="mt-16">
                    <Container>
                        {requestedCategory && (
                            <div className="mb-10 max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3 border border-[#ddc0ba] bg-[#f6f3ee] px-6 py-4 rounded-xl text-xs tracking-wider uppercase text-[#56423d]">
                                <p>
                                    Category: <span className="font-bold text-[#1c1c19]">{activeCategoryLabel}</span>
                                </p>
                                <Link href="/blogs" className="text-[#9f3f29] hover:underline font-bold transition-all">
                                    Show All Notes
                                </Link>
                            </div>
                        )}

                        {posts.length === 0 ? (
                            <div className="max-w-5xl mx-auto border border-dashed border-[#ddc0ba] px-6 py-20 text-center text-[#89726c] rounded-xl bg-white/50">
                                {requestedCategory
                                    ? "No entries found in this diary category."
                                    : "No diary entries have been published yet."}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 max-w-6xl mx-auto">
                                {posts.map((post) => {
                                    const coverUrl = post.cover_media?.public_url || "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800";
                                    return (
                                        <article key={post.id} className="group flex flex-col bg-white border border-[#e6e2da] hover:border-[#9f3f29]/30 hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden h-full">
                                            {/* Cover image */}
                                            <Link href={`/blogs/${post.slug}`} className="relative aspect-[1.5/1] overflow-hidden block">
                                                <Image
                                                    src={coverUrl}
                                                    alt={post.cover_media?.alt_text || post.title}
                                                    fill
                                                    sizes="(max-width: 768px) 100vw, 400px"
                                                    className="object-cover transition-transform duration-500 group-hover:scale-103"
                                                />
                                            </Link>

                                            {/* Content Area */}
                                            <div className="flex flex-col flex-grow p-6 lg:p-8">
                                                {/* Meta Info */}
                                                <div className="flex items-center gap-4 text-xs font-semibold text-[#89726c] mb-3">
                                                    {post.category?.name && (
                                                        <span className="text-[#9f3f29] flex items-center gap-1.5">
                                                            <Tag className="w-3.5 h-3.5" />
                                                            {post.category.name}
                                                        </span>
                                                    )}
                                                    {post.published_at && (
                                                        <span className="flex items-center gap-1.5">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {new Date(post.published_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Title */}
                                                <h2 className={`${newsreader.className} text-2xl lg:text-3xl text-[#1c1c19] group-hover:text-[#9f3f29] transition-colors leading-tight mb-4 flex-grow font-semibold`}>
                                                    <Link href={`/blogs/${post.slug}`}>
                                                        {post.title}
                                                    </Link>
                                                </h2>

                                                {/* Excerpt */}
                                                <p className="text-[#56423d] text-sm leading-relaxed mb-6 line-clamp-3">
                                                    {post.excerpt || "No description provided."}
                                                </p>

                                                {/* Read More */}
                                                <div className="pt-2">
                                                    <Link href={`/blogs/${post.slug}`} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-[#9f3f29] hover:underline transition-all">
                                                        Read Story
                                                        <ArrowRight className="w-3.5 h-3.5" />
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
