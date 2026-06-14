"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import type { CmsBanner } from "@/lib/cms";

type Props = {
  banners: CmsBanner[];
  siteConfig: Record<string, string>;
  headingClassName: string;
  bodyClassName: string;
  containerClassName: string;
};

export default function BohemianHeroCarousel({
  banners,
  siteConfig,
  headingClassName,
  bodyClassName,
  containerClassName,
}: Props) {
  const slides = useMemo(
    () => banners.filter((banner) => banner.image_url?.trim()),
    [banners]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const slideCount = slides.length;

  useEffect(() => {
    if (slideCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount);
    }, 5000);

    return () => clearInterval(interval);
  }, [slideCount]);

  useEffect(() => {
    if (slideCount === 0) {
      if (currentIndex !== 0) {
        setCurrentIndex(0);
      }
      return;
    }

    if (currentIndex >= slideCount) {
      setCurrentIndex(0);
    }
  }, [currentIndex, slideCount]);

  if (slideCount === 0) return null;

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  };

  const defaultHeroBadge = siteConfig.bohemian_hero_badge?.trim() || "TERRA & LOOM PRESENTS";
  const defaultHeroHeadline = (siteConfig.bohemian_hero_headline?.trim() || "Embrace the Warmth.").replace(/\\n/g, "\n");
  const defaultHeroDescription = siteConfig.bohemian_hero_description?.trim()
    || "Curating the finest bohemian treasures - from hand-tufted textiles to sun-baked ceramics - to transform your space into a sanctuary of natural beauty.";
  const defaultHeroCtaLabel = siteConfig.bohemian_hero_cta1_label?.trim() || "Explore Collection";
  const defaultHeroCtaUrl = siteConfig.bohemian_hero_cta1_url?.trim() || "/shop";

  return (
    <section className="w-full overflow-hidden relative">
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((banner, idx) => {
          const bannerImage = banner.image_url?.trim() || siteConfig.bohemian_hero_desktop_image?.trim() || "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=2400&q=80";
          const bannerHeadline = (banner.title?.trim() || defaultHeroHeadline).replace(/\\n/g, "\n");
          const bannerDescription = banner.content_text?.trim() || defaultHeroDescription;
          const bannerCtaUrl = banner.link_url?.trim() || defaultHeroCtaUrl;
          const bannerCtaLabel = banner.button_text?.trim() || defaultHeroCtaLabel;
 
          return (
            <div
              key={banner.id}
              className="relative h-[calc(100vh-72px)] min-h-[560px] w-full min-w-full md:h-[calc(100vh-82px)] shrink-0"
            >
              <Image
                src={bannerImage}
                alt={bannerHeadline}
                fill
                priority={idx === 0}
                sizes="100vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#fcf9f4]/90 via-[#fcf9f4]/55 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent" />
 
              <div className={`relative z-10 flex h-full items-center ${containerClassName}`}>
                <div className="max-w-[560px] px-6 md:px-0">
                  <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.38em] text-[#6f6156]">
                    {defaultHeroBadge}
                  </p>
 
                  <h1 className={`${headingClassName} mb-6 whitespace-pre-line text-[62px] leading-[0.95] text-[#9f3f29] md:text-[82px]`}>
                    {bannerHeadline}
                  </h1>
 
                  <p className="mb-10 max-w-[520px] text-base leading-relaxed text-[#4f4741] md:text-[18px]">
                    {bannerDescription}
                  </p>
 
                  <Link
                    href={bannerCtaUrl}
                    className="inline-flex items-center gap-3 rounded-lg bg-[#9f3f29] px-8 py-4 text-sm font-bold text-white shadow-sm transition-all hover:opacity-90"
                  >
                    {bannerCtaLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md text-[#9f3f29] flex items-center justify-center transition-all shadow-sm"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-white/40 hover:bg-white/70 backdrop-blur-md text-[#9f3f29] flex items-center justify-center transition-all shadow-sm"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex ? "w-8 bg-[#9f3f29]" : "w-2.5 bg-[#9f3f29]/30 hover:bg-[#9f3f29]/50"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
