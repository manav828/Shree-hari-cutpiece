/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "@/components/ui/Container";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface FeaturedProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  unit: string;
  category: string;
  image: string;
}

export default function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      const { data } = await supabase
        .from("products")
        .select(`
          id, name, slug, sell_mode,
          categories ( name ),
          product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )
        `)
        .eq("is_featured", true)
        .eq("is_active", true);

      if (data) {
        const formatted = data.map((p: any) => {
          const defaultVariant = p.product_variants.find((v: any) => v.is_default) || p.product_variants[0];
          const primaryImage = defaultVariant?.variant_images?.find((img: any) => img.is_primary)?.image_url
            || defaultVariant?.variant_images?.[0]?.image_url
            || "";

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: defaultVariant?.price || 0,
            originalPrice: defaultVariant?.original_price || defaultVariant?.price || 0,
            unit: p.sell_mode === "meter" ? "meter" : "pc",
            category: Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name || "",
            image: primaryImage
          };
        });
        setFeaturedProducts(formatted);
      }
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  const mobileProducts = featuredProducts.slice(0, 4);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [featuredProducts]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  const ProductCardView = ({ product }: { product: FeaturedProduct }) => (
    <Link
      href={`/shop/${product.slug}`}
      className="group cursor-pointer block h-full"
    >
      <div className="bg-transparent h-full flex flex-col">
        {/* Image */}
        <div className="aspect-[3/4] relative overflow-hidden bg-background-secondary mb-4 sm:mb-6 border border-border/50">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-[700ms] ease-premium group-hover:scale-[1.03]"
          />
          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[400ms] pointer-events-none flex items-end justify-center pb-8">
            <span className="hidden sm:block bg-white/95 backdrop-blur-sm px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium shadow-premium translate-y-4 group-hover:translate-y-0 transition-transform duration-[400ms] text-foreground">
              Quick View
            </span>
          </div>
          {/* Sale Badge */}
          {product.originalPrice > product.price && (
            <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-white/90 backdrop-blur-sm text-foreground text-[10px] uppercase font-medium px-2 sm:px-4 py-1 sm:py-1.5 tracking-[0.2em]">
              Sale
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-left mt-auto pt-2">
          <p className="text-text-secondary text-[9px] sm:text-[10px] tracking-[0.2em] uppercase mb-1 sm:mb-2">
            {product.category}
          </p>
          <h3 className="font-serif text-sm sm:text-lg text-foreground mb-1 sm:mb-2 group-hover:text-text-secondary transition-colors duration-300 line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-foreground tracking-wide text-sm sm:text-base">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice > product.price && (
              <span className="text-text-secondary line-through text-xs sm:text-sm font-light">
                {formatPrice(product.originalPrice)}
              </span>
            )}
            <span className="text-text-secondary text-xs sm:text-sm font-light w-full sm:w-auto mt-1 sm:mt-0">
              / {product.unit}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <section className="section-padding bg-background-secondary border-t border-border/40">
      <Container>
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-xl text-center md:text-left mx-auto md:mx-0">
            <p className="text-accent text-xs md:text-sm tracking-[0.3em] uppercase mb-4 font-medium flex items-center justify-center md:justify-start gap-3">
              <span className="w-8 sm:w-12 h-px bg-accent"></span>
              Handpicked For You
              <span className="md:hidden w-8 sm:w-12 h-px bg-accent"></span>
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] leading-[1.1] text-foreground md:mb-4">
              Best Sellers
            </h2>
            <p className="text-text-secondary font-light text-sm sm:text-base md:text-lg hidden md:block">
              Explore our most sought-after fabrics, chosen for their exceptional quality and beautiful draping.
            </p>
          </div>

          {/* Desktop Right Side Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/shop"
              className="text-xs tracking-[0.2em] uppercase font-medium border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
            >
              View More
            </Link>
          </div>
        </div>

        {/* ----------------- DESKTOP SLIDER ----------------- */}
        <div className="hidden md:block relative -mx-4 px-4 group">

          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={`absolute left-0 top-[40%] -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur rounded-full border border-border flex items-center justify-center transition-all duration-[400ms] shadow-premium ${canScrollLeft
              ? "text-foreground hover:bg-white opacity-0 group-hover:opacity-100"
              : "opacity-0 pointer-events-none"
              }`}
            aria-label="Scroll left"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" /></svg>
          </button>

          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={`absolute right-0 top-[40%] -translate-y-1/2 z-10 w-12 h-12 bg-white/95 backdrop-blur rounded-full border border-border flex items-center justify-center transition-all duration-[400ms] shadow-premium ${canScrollRight
              ? "text-foreground hover:bg-white opacity-0 group-hover:opacity-100"
              : "opacity-0 pointer-events-none"
              }`}
            aria-label="Scroll right"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5l7 7-7 7" /></svg>
          </button>

          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pt-4 pb-8"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {featuredProducts.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[calc(25%-18px)] snap-start">
                <ProductCardView product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* ----------------- MOBILE 2x2 GRID ----------------- */}
        <div className="md:hidden">
          <div className="grid grid-cols-2 gap-4 pb-6">
            {mobileProducts.map((product) => (
              <div key={product.id}>
                <ProductCardView product={product} />
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-6">
            <Link
              href="/shop"
              className="inline-block border border-border px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium bg-white text-foreground hover:bg-foreground hover:text-white transition-colors duration-300"
            >
              View More
            </Link>
          </div>
        </div>

      </Container>
    </section>
  );
}
