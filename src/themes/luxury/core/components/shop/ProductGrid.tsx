/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import ProductCard from "./ProductCard";
import { supabase } from "@/lib/supabase";

interface ProductGridProps {
  initialCategory?: string;
}

export default function ProductGrid({ initialCategory }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadError("");
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .order("sort_order", { ascending: true });

        if (catError) throw catError;
        if (catData) setCategories(catData);

        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .select(`
            id, name, slug, sell_mode, is_featured,
            categories ( name, slug ),
            product_variants ( id, price, original_price, is_default, variant_images ( image_url, is_primary ) ),
            product_option_groups ( required )
          `)
          .eq("is_active", true);

        if (prodError) throw prodError;

        if (prodData) {
          const formatted = prodData.map((p: any) => {
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
              selling_mode: p.sell_mode === "meter" ? "meter" : "piece",
              variantId: defaultVariant?.id || null,
              category: Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name || "",
              categorySlug: Array.isArray(p.categories) ? p.categories[0]?.slug : p.categories?.slug || "",
              image: primaryImage,
              featured: p.is_featured,
              requiresOptions: Array.isArray(p.product_option_groups)
                ? p.product_option_groups.some((g: { required: boolean }) => g.required)
                : false,
            };
          });
          setProducts(formatted);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load products";
        setLoadError(message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let prods = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      prods = prods.filter((p) => p.categorySlug === selectedCategory || p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        prods.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        prods.sort((a, b) => b.price - a.price);
        break;
      case "name":
        prods.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured first
        prods.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return prods;
  }, [products, selectedCategory, sortBy]);

  if (loading) {
    return (
      <div>
        {/* Skeleton Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-20 h-9 rounded shimmer-bg" />
            ))}
          </div>
          <div className="w-36 h-9 rounded shimmer-bg" />
        </div>

        {/* Skeleton Results Count */}
        <div className="w-40 h-4 mb-8 rounded shimmer-bg" />

        {/* Skeleton Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <div className="aspect-[3/4] w-full rounded shimmer-bg" />
              <div className="w-3/4 h-5 rounded shimmer-bg" />
              <div className="w-1/2 h-4 rounded shimmer-bg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 text-sm transition-all duration-300 ${selectedCategory === "all"
              ? "bg-foreground text-white"
              : "bg-background-secondary text-foreground hover:bg-border"
              }`}
          >
            All
          </button>
          {categories.map((category: any) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.slug)}
              className={`px-4 py-2 text-sm transition-all duration-300 ${selectedCategory === category.slug
                ? "bg-foreground text-white"
                : "bg-background-secondary text-foreground hover:bg-border"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-background-secondary text-foreground text-sm border-none outline-none cursor-pointer"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name">Name</option>
        </select>
      </div>

      {/* Results Count */}
      {loadError && (
        <p className="text-red-600 text-sm mb-4">{loadError}</p>
      )}
      <p className="text-text-secondary text-sm mb-8">
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
      </p>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-text-secondary text-lg">
            No products found in this category.
          </p>
        </div>
      )}
    </div>
  );
}
