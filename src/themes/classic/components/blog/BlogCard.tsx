import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
    post: {
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        image: string;
        category: string;
        date: string;
        readTime: string;
    };
}

export default function BlogCard({ post }: BlogCardProps) {
    return (
        <Link href={`/blogs/${post.slug}`} className="group flex flex-col h-full card-premium">
            <div className="aspect-[16/9] relative overflow-hidden bg-background-secondary">
                <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-foreground text-xs font-medium px-3 py-1 tracking-wider uppercase">
                    {post.category}
                </div>
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center text-xs text-text-secondary mb-3">
                    <span>{new Date(post.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    <span>{post.readTime}</span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl text-foreground mb-3 group-hover:text-accent transition-colors line-clamp-2">
                    {post.title}
                </h3>
                <p className="text-text-secondary text-sm md:text-base leading-relaxed line-clamp-3 mb-6 flex-grow">
                    {post.excerpt}
                </p>
                <span className="inline-flex items-center gap-2 text-accent text-sm font-medium group-hover:gap-3 transition-all mt-auto">
                    Read Article
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </span>
            </div>
        </Link>
    );
}
