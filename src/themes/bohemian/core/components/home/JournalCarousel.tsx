"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";

const newsreader = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

type CarouselPost = {
  title: string;
  excerpt: string;
  image: string;
  slug: string;
};

export default function JournalCarousel({ posts }: { posts: CarouselPost[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (containerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Run once on load
      checkScroll();
      // Handle window resizing
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [posts]);

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const { clientWidth } = containerRef.current;
      const scrollAmount = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      containerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full space-y-8">
      {/* Scroll Controls (only show if posts count > 3) */}
      {posts.length > 3 && (
        <div className="absolute right-0 -top-20 z-10 flex gap-2">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#89726c]/30 text-[#1c1c19] hover:bg-[#f0ede8] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            aria-label="Scroll left"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-[#89726c]/30 text-[#1c1c19] hover:bg-[#f0ede8] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            aria-label="Scroll right"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Scrollable container */}
      <div
        ref={containerRef}
        className="flex gap-8 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory pb-4 w-full"
        style={{ scrollbarWidth: "none" }}
      >
        {posts.map((blog, idx) => (
          <div
            key={`${blog.title}-${idx}`}
            className="w-[290px] sm:w-[350px] shrink-0 snap-start flex flex-col"
          >
            <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#f0ede8]">
              {blog.slug !== "#" ? (
                <Link href={blog.slug} className="block h-full w-full">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    sizes="(max-width: 640px) 290px, 350px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
              ) : (
                <Image
                  src={blog.image}
                  alt={blog.title}
                  fill
                  sizes="(max-width: 640px) 290px, 350px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
            </div>
            <h3 className={`${newsreader.className} mt-5 mb-3 text-2xl italic text-[#1c1c19]`}>
              {blog.slug !== "#" ? (
                <Link href={blog.slug} className="hover:text-[#9f3f29] transition-colors">
                  {blog.title}
                </Link>
              ) : (
                blog.title
              )}
            </h3>
            <p className="text-sm leading-relaxed text-[#56423d] opacity-90 font-light line-clamp-3">
              {blog.excerpt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
