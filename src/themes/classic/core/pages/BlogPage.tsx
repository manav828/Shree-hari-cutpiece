"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/themes/classic/components/layout/Navbar";
import Footer from "@/themes/classic/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogCard from "@/components/blog/BlogCard";
import { BlogPageProps } from "@/types/blog";

export default function ClassicBlogPage({
    posts,
    requestedCategory,
    activeCategoryLabel,
}: BlogPageProps) {
    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-0 pb-20 bg-background-secondary min-h-screen">
                <section className="relative h-[290px] sm:h-[340px] lg:h-[400px] overflow-hidden">
                    <Image
                        src="https://images.unsplash.com/photo-1456324504439-367cee3b3c32?w=1800&q=80"
                        alt="Fabric care and styling journal hero visual"
                        fill
                        sizes="100vw"
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1f1815]/85 via-[#1f1815]/60 to-[#1f1815]/20" />
                    <Container className="relative h-full flex items-center">
                        <div className="max-w-2xl text-white">
                            <p className="text-xs sm:text-sm tracking-[0.32em] uppercase mb-4 text-white/80">Our Journal</p>
                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-tight mb-5">Style & Fabric Guides</h1>
                            <p className="text-white/85 text-base sm:text-lg leading-relaxed">
                                Practical buying tips, fabric knowledge, and styling insights for premium outfit planning.
                            </p>
                        </div>
                    </Container>
                </section>

                <section className="-mt-10 relative z-10">
                    <Container>
                        <div className="bg-white border border-border/70 shadow-premium p-6 sm:p-8 lg:p-10">
                            {requestedCategory && (
                                <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-background-secondary px-4 py-3 text-sm">
                                    <p className="text-text-secondary">
                                        Filtered by category: <span className="font-medium text-foreground">{activeCategoryLabel}</span>
                                    </p>
                                    <Link href="/blogs" className="text-accent hover:text-accent/80 transition-colors">
                                        Clear filter
                                    </Link>
                                </div>
                            )}
                            {posts.length === 0 ? (
                                <div className="rounded-lg border border-border bg-white px-6 py-8 text-center text-text-secondary">
                                    {requestedCategory
                                        ? "No published posts found for this category yet."
                                        : "No published posts yet. Check back soon."}
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {posts.map((post) => (
                                        <BlogCard
                                            key={post.id}
                                            post={{
                                                id: post.id,
                                                title: post.title,
                                                slug: post.slug,
                                                excerpt: post.excerpt,
                                                imageUrl: post.cover_media?.public_url ?? null,
                                                imageAlt: post.cover_media?.alt_text ?? post.title,
                                                category: post.category?.name ?? null,
                                                publishedAt: post.published_at,
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Container>
                </section>
            </main>
            <Footer />
        </>
    );
}
