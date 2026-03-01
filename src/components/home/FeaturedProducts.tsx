"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { formatPrice } from "@/lib/utils";
import productsData from "@/data/products.json";

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const featuredProducts = productsData.filter((p) => p.featured);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth; // Scroll by visible batch width
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="section-padding bg-background-secondary">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
              Handpicked For You
            </p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
              Best Sellers
            </h2>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${canScrollLeft
                  ? "border-foreground text-foreground hover:bg-foreground hover:text-white"
                  : "border-border text-border cursor-not-allowed"
                }`}
              aria-label="Scroll left"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-12 h-12 border flex items-center justify-center transition-all duration-300 ${canScrollRight
                  ? "border-foreground text-foreground hover:bg-foreground hover:text-white"
                  : "border-border text-border cursor-not-allowed"
                }`}
              aria-label="Scroll right"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products Scroll Container */}
        <div className="relative">
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.slug}`}
                className="group flex-shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
              >
                <div className="card-premium">
                  {/* Image */}
                  <div className="aspect-[4/5] relative overflow-hidden bg-background">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
                    />
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
                      <span className="bg-white px-6 py-3 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                        View Details
                      </span>
                    </div>
                    {/* Sale Badge */}
                    {product.originalPrice > product.price && (
                      <div className="absolute top-4 left-4 bg-accent text-white text-xs px-3 py-1 tracking-wider">
                        SALE
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-text-secondary text-xs tracking-widest uppercase mb-2">
                      {product.category}
                    </p>
                    <h3 className="font-serif text-lg text-foreground mb-3 group-hover:text-accent transition-colors duration-300 line-clamp-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-foreground font-medium">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-text-secondary line-through text-sm">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                      <span className="text-text-secondary text-sm">
                        / {product.unit}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* View All Card */}
            <Link
              href="/shop"
              className="flex-shrink-0 w-full sm:w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start aspect-[4/5] border-2 border-dashed border-border flex flex-col items-center justify-center gap-4 hover:border-accent hover:bg-accent-light transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all duration-300">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
              <span className="font-serif text-xl text-foreground group-hover:text-accent transition-colors">
                View All
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
