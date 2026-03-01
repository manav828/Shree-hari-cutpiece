"use client";

import { useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import productsData from "@/data/products.json";

// Sample reviews data
const reviewsData = [
  {
    id: 1,
    name: "Priya Sharma",
    rating: 5,
    date: "2 weeks ago",
    comment: "Excellent fabric quality! The texture is exactly as shown in the pictures. Made a beautiful kurti from it.",
    verified: true,
  },
  {
    id: 2,
    name: "Anjali Patel",
    rating: 4,
    date: "1 month ago",
    comment: "Good quality fabric. Delivered on time. Will order again.",
    verified: true,
  },
  {
    id: 3,
    name: "Meera Gupta",
    rating: 5,
    date: "1 month ago",
    comment: "Love the color and quality. Perfect for my daughter's dress. Thank you Shree Hari!",
    verified: true,
  },
];

interface ProductDetailClientProps {
  slug: string;
}

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const product = productsData.find((p) => p.slug === slug);
  const { addToCart } = useCart();
  const [meters, setMeters] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [activeMedia, setActiveMedia] = useState(0);

  if (!product) {
    notFound();
  }

  const relatedProducts = productsData
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      meters: meters,
    });
  };

  const averageRating = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;

  // Build media array combining main image, extra images and video if available
  const media = [
    { type: "image", url: product.image },
    ...((product as any).images?.filter((img: string) => img !== product.image).map((img: string) => ({ type: "image", url: img })) || []),
    ...((product as any).video ? [{ type: "video", url: (product as any).video }] : []),
  ];

  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="pt-32 pb-20">
        <Container>
          {/* Breadcrumb */}
          <nav className="mb-10">
            <ol className="flex items-center gap-2 text-sm text-text-secondary">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  Home
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/shop" className="hover:text-accent transition-colors">
                  Shop
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>

          {/* Product Details */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Image Gallery */}
            <div>
              <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary rounded-lg">
                {media[activeMedia]?.type === "video" ? (
                  <video
                    src={media[activeMedia].url}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    src={media[activeMedia]?.url || product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                {product.originalPrice > product.price && (
                  <div className="absolute top-4 left-4 bg-accent text-white text-sm px-4 py-2">
                    {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {media.length > 1 && (
                <div
                  className="flex gap-4 mt-4 overflow-x-auto scrollbar-hide pb-2"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {media.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveMedia(idx)}
                      className={`relative w-24 h-32 flex-shrink-0 border-2 overflow-hidden transition-all ${activeMedia === idx ? "border-accent" : "border-transparent hover:border-border"
                        }`}
                    >
                      {item.type === "video" ? (
                        <>
                          <video src={item.url} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        </>
                      ) : (
                        <Image src={item.url} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:py-4">
              <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">
                {product.category}
              </p>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= averageRating ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-text-secondary text-sm">
                  ({reviewsData.length} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-medium text-foreground">
                  {formatPrice(product.price)}
                </span>
                {product.originalPrice > product.price && (
                  <span className="text-xl text-text-secondary line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
                <span className="text-text-secondary">/ {product.unit}</span>
              </div>

              {/* Short Description */}
              <p className="text-text-secondary text-lg leading-relaxed mb-8">
                {product.description}
              </p>

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-3">
                  Select Quantity (in meters)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button
                      onClick={() => setMeters(Math.max(1, meters - 1))}
                      className="px-4 py-3 hover:bg-background-secondary transition-colors text-lg"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={meters}
                      onChange={(e) => setMeters(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-20 text-center py-3 border-x border-border focus:outline-none text-lg"
                      min="1"
                    />
                    <button
                      onClick={() => setMeters(meters + 1)}
                      className="px-4 py-3 hover:bg-background-secondary transition-colors text-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-text-secondary">
                    Total: <strong className="text-foreground">{formatPrice(product.price * meters)}</strong>
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                className="w-full btn-primary justify-center gap-3 mb-4 text-lg py-5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to Cart
              </button>

              <p className="text-text-secondary text-sm text-center mb-8">
                Free delivery on orders above ₹999
              </p>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 py-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Quality Assured
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Easy Returns
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="mt-20 border-t border-border pt-12">
            {/* Tab Headers */}
            <div className="flex gap-8 border-b border-border mb-8">
              {[
                { id: "description", label: "Description" },
                { id: "details", label: "Fabric Details" },
                { id: "reviews", label: `Reviews (${reviewsData.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                      ? "text-accent"
                      : "text-text-secondary hover:text-foreground"
                    }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="max-w-3xl">
              {activeTab === "description" && (
                <div className="prose prose-lg">
                  <p className="text-text-secondary leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-text-secondary leading-relaxed mt-4">
                    This premium fabric is perfect for creating beautiful custom outfits.
                    Whether you're designing a kurti, dress, or any other garment, this
                    fabric offers the perfect blend of comfort and elegance. The quality
                    ensures durability while maintaining a soft, luxurious feel against
                    your skin.
                  </p>
                  <p className="text-text-secondary leading-relaxed mt-4">
                    Ideal for both casual wear and special occasions, this fabric drapes
                    beautifully and holds its shape well. Easy to work with for both
                    amateur and professional tailors.
                  </p>
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border">
                    <span className="text-text-secondary">Fabric Type</span>
                    <span className="text-foreground">{product.fabric}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border">
                    <span className="text-text-secondary">Width</span>
                    <span className="text-foreground">{product.width}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border">
                    <span className="text-text-secondary">Care Instructions</span>
                    <span className="text-foreground">{product.care}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border">
                    <span className="text-text-secondary">Sold By</span>
                    <span className="text-foreground">Per Meter</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <span className="text-text-secondary">Category</span>
                    <span className="text-foreground capitalize">{product.category}</span>
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {/* Rating Summary */}
                  <div className="flex items-center gap-6 pb-8 border-b border-border">
                    <div className="text-center">
                      <p className="text-5xl font-serif text-foreground">{averageRating.toFixed(1)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= averageRating ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-text-secondary text-sm mt-1">
                        {reviewsData.length} reviews
                      </p>
                    </div>
                  </div>

                  {/* Reviews List */}
                  {reviewsData.map((review) => (
                    <div key={review.id} className="pb-8 border-b border-border last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center">
                            <span className="font-medium text-accent">
                              {review.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{review.name}</p>
                            <p className="text-text-secondary text-sm">{review.date}</p>
                          </div>
                        </div>
                        {review.verified && (
                          <span className="text-xs text-accent bg-accent-light px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating ? "text-yellow-400" : "text-gray-300"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-text-secondary">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-20 pt-12 border-t border-border">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-10">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct) => (
                  <Link
                    key={relProduct.id}
                    href={`/shop/${relProduct.slug}`}
                    className="group"
                  >
                    <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary mb-4">
                      <Image
                        src={relProduct.image}
                        alt={relProduct.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">
                      {relProduct.name}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {formatPrice(relProduct.price)} / {relProduct.unit}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </Container>
      </main>
      <Footer />
    </>
  );
}
