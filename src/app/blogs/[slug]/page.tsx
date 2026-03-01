import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import BlogCard from "@/components/blog/BlogCard";
import blogsData from "@/data/blogs.json";

interface BlogDetailPageProps {
    params: { slug: string };
}

export function generateStaticParams() {
    return blogsData.map((post) => ({
        slug: post.slug,
    }));
}

export function generateMetadata({ params }: BlogDetailPageProps): Metadata {
    const post = blogsData.find((p) => p.slug === params.slug);
    if (!post) {
        return { title: "Post Not Found" };
    }
    return {
        title: `${post.title} | Shree Hari Blog`,
        description: post.excerpt,
    };
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
    const post = blogsData.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    const relatedPosts = blogsData
        .filter((p) => p.id !== post.id)
        .slice(0, 3);

    // Convert simple markdown-like newlines to paragraphs for basic rendering
    const formattedContent = post.content.split("\n\n").map((paragraph, idx) => {
        if (paragraph.startsWith("### ")) {
            return (
                <h3 key={idx} className="font-serif text-2xl md:text-3xl text-foreground mt-12 mb-6">
                    {paragraph.replace("### ", "")}
                </h3>
            );
        }
        return (
            <p key={idx} className="text-text-secondary text-lg leading-relaxed mb-6">
                {paragraph}
            </p>
        );
    });

    return (
        <>
            <Navbar />
            <CartSidebar />
            <main className="pt-32 pb-20 bg-background min-h-screen">
                <Container>
                    {/* Breadcrumb */}
                    <nav className="mb-10">
                        <ol className="flex items-center gap-2 text-sm text-text-secondary">
                            <li>
                                <Link href="/" className="hover:text-accent transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>/</li>
                            <li>
                                <Link href="/blogs" className="hover:text-accent transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>/</li>
                            <li className="text-foreground truncate max-w-[200px] sm:max-w-xs">{post.title}</li>
                        </ol>
                    </nav>

                    <article className="max-w-4xl mx-auto">
                        {/* Header */}
                        <header className="text-center mb-12">
                            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-xs font-semibold tracking-widest uppercase mb-6 rounded-full">
                                {post.category}
                            </span>
                            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-8">
                                {post.title}
                            </h1>
                            <div className="flex items-center justify-center gap-6 text-sm text-text-secondary">
                                <div className="flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-serif">
                                        {post.author.charAt(0)}
                                    </span>
                                    <span>{post.author}</span>
                                </div>
                                <span>•</span>
                                <span>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                <span>•</span>
                                <span>{post.readTime}</span>
                            </div>
                        </header>

                        {/* Featured Image */}
                        <div className="aspect-[16/9] sm:aspect-[2/1] relative overflow-hidden bg-background-secondary mb-16 rounded-lg">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Content */}
                        <div className="prose prose-lg max-w-3xl mx-auto prose-p:text-text-secondary prose-headings:font-serif prose-headings:text-foreground">
                            <p className="text-xl md:text-2xl text-foreground/80 font-serif italic mb-10 leading-relaxed border-l-4 border-accent pl-6">
                                {post.excerpt}
                            </p>
                            {formattedContent}
                        </div>
                    </article>
                </Container>

                {/* More Articles Section */}
                {relatedPosts.length > 0 && (
                    <section className="mt-32 border-t border-border pt-20 bg-background-secondary">
                        <Container>
                            <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-10 text-center">
                                More from our Journal
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                                {relatedPosts.map((relatedPost) => (
                                    <BlogCard key={relatedPost.id} post={relatedPost} />
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
