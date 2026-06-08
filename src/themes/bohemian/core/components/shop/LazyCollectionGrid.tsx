"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type LazyCategoryCard = {
  id: string;
  name: string;
  slug: string;
  image: string;
  alt: string;
  countLabel: string;
};

type LazyCollectionGridProps = {
  cards: LazyCategoryCard[];
  titleClassName: string;
};

const BATCH_SIZE = 5;

export default function LazyCollectionGrid({ cards, titleClassName }: LazyCollectionGridProps) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(BATCH_SIZE, cards.length));
  const loadMoreAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(BATCH_SIZE, cards.length));
  }, [cards.length]);

  const hasMore = visibleCount < cards.length;
  const visibleCards = useMemo(() => cards.slice(0, visibleCount), [cards, visibleCount]);

  useEffect(() => {
    if (!hasMore || !loadMoreAnchorRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((current) => Math.min(current + BATCH_SIZE, cards.length));
        }
      },
      {
        rootMargin: "220px 0px",
      },
    );

    observer.observe(loadMoreAnchorRef.current);
    return () => observer.disconnect();
  }, [cards.length, hasMore]);

  if (cards.length === 0) {
    return <p className="rounded-xl bg-[#f6f3ee] px-6 py-10 text-sm text-[#56423d]">No categories available yet.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {visibleCards.map((card) => (
          <Link key={`more-${card.id}`} href={`/shop?category=${card.slug}`} className="group block">
            <div className="mb-4 aspect-square overflow-hidden rounded-xl bg-[#f0ede8]">
              <Image
                src={card.image}
                alt={card.alt}
                width={520}
                height={520}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <h4 className={`${titleClassName} text-[24px] italic text-[#1c1c19]`}>{card.name}</h4>
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#89726c]">{card.countLabel}</p>
          </Link>
        ))}
      </div>

      {hasMore ? (
        <div ref={loadMoreAnchorRef} className="flex justify-center pt-8">
          <span className="rounded-full border border-[#ddc0ba] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#9f3f29]">
            Scroll to load more collections
          </span>
        </div>
      ) : null}
    </>
  );
}