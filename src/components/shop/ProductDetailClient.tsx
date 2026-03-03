/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

// Sample reviews data
const reviewsData = [
  { id: 1, name: "Priya Sharma", rating: 5, date: "2 weeks ago", comment: "Excellent fabric quality!", verified: true },
  { id: 2, name: "Anjali Patel", rating: 4, date: "1 month ago", comment: "Good quality fabric.", verified: true },
  { id: 3, name: "Meera Gupta", rating: 5, date: "1 month ago", comment: "Love the color and quality.", verified: true },
];

interface ProductDetailClientProps { slug: string; }

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meters, setMeters] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews">("description");
  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(`id, name, slug, description, fabric, width, care_instructions, sell_mode, categories ( id, name, slug ), product_variants ( id, color_name, color_hex, material_label, price, original_price, stock, sku, is_default, variant_images ( image_url, is_primary, media_type ) )`)
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      setProduct(data);
      const defVariant = data.product_variants.find((v: any) => v.is_default) || data.product_variants[0];
      setSelectedVariant(defVariant);

      const cats: any = data.categories;
      const catId = Array.isArray(cats) ? cats[0]?.id : cats?.id;
      if (catId) {
        const { data: related } = await supabase
          .from("products")
          .select(`id, name, slug, sell_mode, categories!inner(id), product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )`)
          .eq("categories.id", catId)
          .neq("id", data.id)
          .limit(4);

        if (related) {
          const formattedRelated = related.map((p: any) => {
            const dv = p.product_variants.find((v: any) => v.is_default) || p.product_variants[0];
            const img = dv?.variant_images?.find((i: any) => i.is_primary)?.image_url || dv?.variant_images?.[0]?.image_url || "";
            return { id: p.id, name: p.name, slug: p.slug, price: dv?.price || 0, unit: p.sell_mode === "meter" ? "meter" : "pc", image: img };
          });
          setRelatedProducts(formattedRelated);
        }
      }
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <><Navbar /><CartSidebar />
        <main className="pt-24 min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            <p className="text-text-secondary text-sm">Loading product details...</p>
          </div>
        </main>
        <Footer /></>
    );
  }

  if (!product) {
    return (
      <><Navbar /><CartSidebar />
        <main className="pt-24 min-h-screen flex items-center justify-center text-center">
          <div>
            <p className="text-text-secondary mb-6 text-lg">Product not found.</p>
            <Link href="/shop" className="btn-primary py-2 px-6">Back to Shop</Link>
          </div>
        </main>
        <Footer /></>
    );
  }

  const handleAddToCart = () => {
    const img = selectedVariant?.variant_images?.find((i: any) => i.is_primary)?.image_url || selectedVariant?.variant_images?.[0]?.image_url || "";
    addToCart({
      id: selectedVariant?.id || product.id,
      name: `${product.name} ${selectedVariant?.color_name ? `(${selectedVariant.color_name})` : ""}`.trim(),
      slug: product.slug,
      price: selectedVariant?.price || 0,
      image: img,
      meters: meters,
    });
  };

  const averageRating = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
  const categoryName = Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name;

  const media = selectedVariant?.variant_images?.map((img: any) => ({
    type: img.media_type || "image",
    url: img.image_url
  })) || [];

  return (
    <>
      <Navbar />
      <CartSidebar />
      <main className="pt-12 lg:pt-24 pb-20">
        <Container>
          <nav className="mb-10">
            <ol className="flex items-center gap-2 text-sm text-text-secondary">
              <li><Link href="/" className="hover:text-accent transition-colors">Home</Link></li>
              <li>/</li>
              <li><Link href="/shop" className="hover:text-accent transition-colors">Shop</Link></li>
              <li>/</li>
              <li className="text-foreground">{product.name}</li>
            </ol>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="flex flex-col gap-4">
              <div className="hidden md:flex flex-row gap-4 h-[500px] lg:h-[600px] w-full">
                {media.length > 1 && (
                  <div className="flex flex-col gap-4 overflow-y-auto scrollbar-hide w-24 flex-shrink-0" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                    {media.map((item: any, idx: number) => (
                      <button key={idx} onClick={() => setActiveMedia(idx)} className={`relative w-full h-32 flex-shrink-0 border-2 overflow-hidden transition-all ${activeMedia === idx ? "border-accent" : "border-transparent hover:border-border"}`}>
                        {item.type === "video" ? (
                          <div className="w-full h-full bg-black/10 flex items-center justify-center">
                            <svg className="w-6 h-6 text-black/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                          </div>
                        ) : (
                          <Image src={item.url} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
                <div className="relative overflow-hidden bg-background-secondary rounded-lg flex-1 group">
                  {media[activeMedia]?.type === "video" ? (
                    <video src={media[activeMedia].url} controls autoPlay loop muted className="w-full h-full object-contain" />
                  ) : (
                    media.length > 0 ? (
                      <Image src={media[activeMedia]?.url} alt={product.name} fill className="object-contain" priority />
                    ) : (
                      <div className="w-full h-full bg-border flex items-center justify-center text-text-secondary text-sm">No Image</div>
                    )
                  )}
                  {selectedVariant?.original_price > selectedVariant?.price && (
                    <div className="absolute top-4 left-4 bg-accent text-white text-sm px-4 py-2 z-10">
                      {Math.round((1 - selectedVariant.price / selectedVariant.original_price) * 100)}% OFF
                    </div>
                  )}
                </div>
              </div>

              <div className="md:hidden flex flex-col gap-4">
                <div className="relative overflow-hidden bg-background-secondary rounded-lg w-full aspect-[3/4]">
                  {media[activeMedia]?.type === "video" ? (
                    <video src={media[activeMedia].url} controls autoPlay loop muted className="absolute inset-0 w-full h-full object-contain" />
                  ) : (
                    media.length > 0 && <Image src={media[activeMedia]?.url} alt={product.name} fill className="absolute inset-0 object-contain" priority />
                  )}
                  {selectedVariant?.original_price > selectedVariant?.price && (
                    <div className="absolute top-4 left-4 bg-accent text-white text-xs px-3 py-1.5 font-medium tracking-wide z-10">
                      {Math.round((1 - selectedVariant.price / selectedVariant.original_price) * 100)}% OFF
                    </div>
                  )}
                </div>
                {media.length > 1 && (
                  <div className="flex flex-row gap-2 overflow-x-auto scrollbar-hide w-full snap-x">
                    {media.map((item: any, idx: number) => (
                      <button key={idx} onClick={() => setActiveMedia(idx)} className={`relative w-20 h-24 flex-shrink-0 snap-start border-2 overflow-hidden transition-all ${activeMedia === idx ? "border-accent" : "border-transparent hover:border-border"}`}>
                        {item.type === "video" ? (
                          <div className="w-full h-full bg-black/10 flex items-center justify-center"><svg className="w-4 h-4 text-black/50" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg></div>
                        ) : (
                          <Image src={item.url} alt="thumbnail" fill className="object-cover" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="lg:py-4">
              <p className="text-accent text-sm tracking-[0.3em] uppercase mb-4">{categoryName}</p>
              <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-4">{product.name}</h1>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className={`w-4 h-4 ${star <= averageRating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-text-secondary text-sm">({reviewsData.length} reviews)</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-medium text-foreground">{formatPrice(selectedVariant?.price || 0)}</span>
                {selectedVariant?.original_price > selectedVariant?.price && (
                  <span className="text-xl text-text-secondary line-through">{formatPrice(selectedVariant.original_price)}</span>
                )}
                <span className="text-text-secondary">/ {product.sell_mode === "meter" ? "meter" : "pc"}</span>
              </div>

              {/* Variant Selector */}
              {product.product_variants?.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">Color: <span className="font-normal text-text-secondary">{selectedVariant?.color_name}</span></p>
                  <div className="flex flex-wrap gap-3">
                    {product.product_variants.map((variant: any) => (
                      <button
                        key={variant.id}
                        onClick={() => { setSelectedVariant(variant); setActiveMedia(0); }}
                        className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedVariant?.id === variant.id ? "border-accent scale-110" : "border-transparent border-gray-200"}`}
                        title={variant.color_name}
                      >
                        <span className="w-8 h-8 rounded-full border border-black/10" style={{ backgroundColor: variant.color_hex || "#cccccc" }} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-text-secondary text-lg leading-relaxed mb-8">{product.description}</p>

              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-3">Select {product.sell_mode === "meter" ? "Quantity (in meters)" : "Quantity"}</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button onClick={() => setMeters(Math.max(1, meters - 1))} className="px-4 py-3 hover:bg-background-secondary transition-colors text-lg">-</button>
                    <input type="number" value={meters} onChange={(e) => setMeters(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center py-3 border-x border-border focus:outline-none text-lg" min="1" />
                    <button onClick={() => setMeters(meters + 1)} className="px-4 py-3 hover:bg-background-secondary transition-colors text-lg">+</button>
                  </div>
                  <span className="text-text-secondary">Total: <strong className="text-foreground">{formatPrice((selectedVariant?.price || 0) * meters)}</strong></span>
                </div>
              </div>

              <button onClick={handleAddToCart} className="w-full btn-primary justify-center gap-3 mb-4 text-lg py-5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                Add to Cart
              </button>

              <p className="text-text-secondary text-sm text-center mb-8">Free delivery on orders above ₹999</p>

              <div className="flex items-center justify-center gap-6 py-6 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-text-secondary"><svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>Quality Assured</div>
                <div className="flex items-center gap-2 text-sm text-text-secondary"><svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>Easy Returns</div>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-border pt-12">
            <div className="flex gap-8 border-b border-border mb-8">
              {[{ id: "description", label: "Description" }, { id: "details", label: "Fabric Details" }, { id: "reviews", label: `Reviews (${reviewsData.length})` }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? "text-accent" : "text-text-secondary hover:text-foreground"}`}>
                  {tab.label}
                  {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                </button>
              ))}
            </div>

            <div className="max-w-3xl">
              {activeTab === "description" && (
                <div className="prose prose-lg">
                  <p className="text-text-secondary leading-relaxed">{product.description}</p>
                </div>
              )}
              {activeTab === "details" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border"><span className="text-text-secondary">Fabric Type</span><span className="text-foreground">{product.fabric || "N/A"}</span></div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border"><span className="text-text-secondary">Width</span><span className="text-foreground">{product.width || "N/A"}</span></div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border"><span className="text-text-secondary">Care Instructions</span><span className="text-foreground">{product.care_instructions || "N/A"}</span></div>
                  <div className="grid grid-cols-2 gap-4 py-4 border-b border-border"><span className="text-text-secondary">Sold By</span><span className="text-foreground capitalize">Per {product.sell_mode === "meter" ? "Meter" : "Piece"}</span></div>
                  <div className="grid grid-cols-2 gap-4 py-4"><span className="text-text-secondary">Category</span><span className="text-foreground capitalize">{categoryName}</span></div>
                </div>
              )}
              {activeTab === "reviews" && (
                <div className="space-y-8">
                  <div className="flex items-center gap-6 pb-8 border-b border-border">
                    <div className="text-center">
                      <p className="text-5xl font-serif text-foreground">{averageRating.toFixed(1)}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} className={`w-4 h-4 ${star <= averageRating ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-text-secondary text-sm mt-1">{reviewsData.length} reviews</p>
                    </div>
                  </div>
                  {reviewsData.map((review) => (
                    <div key={review.id} className="pb-8 border-b border-border last:border-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent-light flex items-center justify-center"><span className="font-medium text-accent">{review.name.charAt(0)}</span></div>
                          <div><p className="font-medium text-foreground">{review.name}</p><p className="text-text-secondary text-sm">{review.date}</p></div>
                        </div>
                        {review.verified && <span className="text-xs text-accent bg-accent-light px-2 py-1 rounded">Verified Purchase</span>}
                      </div>
                      <p className="text-text-secondary">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-20 pt-12 border-t border-border">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-10">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct) => (
                  <Link key={relProduct.id} href={`/shop/${relProduct.slug}`} className="group">
                    <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary mb-4">
                      {relProduct.image ? (
                        <Image src={relProduct.image} alt={relProduct.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-border flex items-center justify-center" />
                      )}
                    </div>
                    <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">{relProduct.name}</h3>
                    <p className="text-text-secondary text-sm">{formatPrice(relProduct.price)} / {relProduct.unit}</p>
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
