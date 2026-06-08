"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Cormorant_Garamond } from "next/font/google";
import { getThumbnailUrl } from "@/lib/imageOptimization";

const newsreader = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

type CarouselProduct = {
  title: string;
  price: string;
  tag: string | null;
  image: string;
  alt: string;
  slug: string;
};

export default function ProductCarousel({ products }: { products: CarouselProduct[] }) {
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
      checkScroll();
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (el) el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

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
      {/* Scroll Controls (only show if products count > 4) */}
      {products.length > 4 && (
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
        {products.map((item, idx) => (
          <div
            key={`${item.title}-${idx}`}
            className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start flex flex-col"
          >
            <Link href={`/shop/${item.slug}`} className="group block cursor-pointer">
              <article>
                <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-xl bg-[#f0ede8]">
                  <Image
                    src={getThumbnailUrl(item.image)}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 260px, (max-width: 768px) 280px, 300px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.tag ? (
                    <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-tight text-[#1c1c19]">
                      {item.tag}
                    </span>
                  ) : null}
                </div>
                <h4 className={`${newsreader.className} mb-1 text-xl transition-colors group-hover:text-[#9f3f29]`}>
                  {item.title}
                </h4>
                <p className="text-sm font-medium text-[#56423d]">{item.price}</p>
              </article>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
