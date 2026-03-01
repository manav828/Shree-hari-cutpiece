"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice: number;
    unit: string;
    category: string;
    image: string;
    images?: string[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      meters: 1,
    });
  };

  // Use product images array or create one from single image
  const images = product.images && product.images.length > 1
    ? product.images
    : [product.image, product.image, product.image]; // Duplicate for scroll effect

  useEffect(() => {
    if (isHovered && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setCurrentImageIndex(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, images.length]);

  return (
    <Link href={`/shop/${product.slug}`} className="group">
      <div
        className="card-premium"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with Auto-scroll */}
        <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${index === currentImageIndex ? "opacity-100" : "opacity-0"
                }`}
            >
              <Image
                src={img}
                alt={`${product.name} - View ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 ease-premium group-hover:scale-105"
              />
            </div>
          ))}

          {/* Image Indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${index === currentImageIndex
                    ? "bg-white w-4"
                    : "bg-white/50"
                    }`}
                />
              ))}
            </div>
          )}

          {/* Quick View Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500 flex items-center justify-center">
            <span className="bg-white px-6 py-3 text-sm opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
              View Details
            </span>
          </div>

          {/* Sale Badge */}
          {product.originalPrice > product.price && (
            <div className="absolute top-4 left-4 bg-accent text-white text-xs px-3 py-1 tracking-wider z-10">
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
          <div className="flex items-center justify-between mt-3">
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

            <button
              onClick={handleAddToCart}
              className="w-8 h-8 rounded-full border border-border flex items-center justify-center text-foreground hover:bg-foreground hover:text-white transition-colors duration-300"
              aria-label="Add to cart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
