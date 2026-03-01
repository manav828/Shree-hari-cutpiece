"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const offers = [
  {
    id: 1,
    text: "FLAT 20% OFF on Silk Collection",
    code: "SILK20",
    link: "/shop?category=silk",
  },
  {
    id: 2,
    text: "Buy 5 Meters, Get 1 Free",
    code: "EXTRA1",
    link: "/shop",
  },
  {
    id: 3,
    text: "Free Delivery on Orders Above ₹999",
    code: null,
    link: "/shop",
  },
];

export default function OfferBanner() {
  const [currentOffer, setCurrentOffer] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const offer = offers[currentOffer];

  return (
    <div className="bg-accent text-white relative overflow-hidden">
      <div className="container-premium py-3 flex items-center justify-center gap-4 text-sm">
        <Link href={offer.link} className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <span className="animate-pulse">✨</span>
          <span>{offer.text}</span>
          {offer.code && (
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-medium">
              Code: {offer.code}
            </span>
          )}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Close offer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress indicators */}
      <div className="absolute bottom-0 left-0 right-0 flex">
        {offers.map((_, index) => (
          <div 
            key={index}
            className={`h-0.5 flex-1 transition-all duration-300 ${
              index === currentOffer ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
