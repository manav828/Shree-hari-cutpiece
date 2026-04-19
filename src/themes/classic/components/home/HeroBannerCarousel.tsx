"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CmsBanner } from "@/lib/cms";

type Props = {
  banners: CmsBanner[];
  layoutMode?: "contained" | "full_width";
};

export default function HeroBannerCarousel({ banners, layoutMode = "contained" }: Props) {
  const slides = useMemo(
    () => banners.filter((banner) => banner.image_url?.trim()),
    [banners],
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideCount = slides.length;

  useEffect(() => {
    if (slideCount <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideCount);
    }, 4500);

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

  const goPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + slideCount) % slideCount);
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slideCount);
  };

  return (
    <section className="pt-3 lg:pt-5 pb-8 lg:pb-12 bg-background border-b border-border/50">
      <div className={layoutMode === "full_width" ? "w-full" : "container-premium"}>
        <div className={`relative w-full overflow-hidden ${layoutMode === "full_width" ? "rounded-none" : "rounded-2xl lg:rounded-3xl"}`}>
          <div
            className="flex transition-transform duration-700 ease-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {slides.map((banner, idx) => (
              <Link
                key={banner.id}
                href={banner.link_url || "/shop"}
                className={`relative w-full min-w-full block ${layoutMode === "full_width"
                  ? "h-[260px] sm:h-[360px] md:h-[470px] lg:h-[620px]"
                  : "h-[240px] sm:h-[320px] md:h-[420px] lg:h-[520px]"
                  }`}
              >
                <Image
                  src={banner.image_url}
                  alt={banner.title || "Hero banner"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority={idx === 0}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/12 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7 lg:p-10 text-white">
                  <h2 className="font-serif text-2xl sm:text-3xl lg:text-5xl leading-tight mb-2">{banner.title}</h2>
                  {banner.content_text ? (
                    <p className="text-sm sm:text-base lg:text-lg text-white/95 max-w-3xl">{banner.content_text}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>

          {slides.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center"
                aria-label="Previous banner"
              >
                <span aria-hidden="true">&#8249;</span>
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/35 hover:bg-black/55 text-white flex items-center justify-center"
                aria-label="Next banner"
              >
                <span aria-hidden="true">&#8250;</span>
              </button>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex ? "w-8 bg-white" : "w-4 bg-white/50"
                    }`}
                    aria-label={`Go to banner ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
