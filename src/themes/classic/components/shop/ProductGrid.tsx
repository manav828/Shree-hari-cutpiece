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

  useEffect(() => {
    async function fetchData() {
      // Fetch categories
      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("sort_order", { ascending: true });

      if (catData) setCategories(catData);

      // Fetch active products
      const { data: prodData } = await supabase
        .from("products")
        .select(`
          id, name, slug, sell_mode, is_featured,
          categories ( name, slug ),
          product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )
        `)
        .eq("is_active", true);

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
            category: Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name || "",
            categorySlug: Array.isArray(p.categories) ? p.categories[0]?.slug : p.categories?.slug || "",
            image: primaryImage,
            featured: p.is_featured
          };
        });
        setProducts(formatted);
      }
      setLoading(false);
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <svg className="w-8 h-8 animate-spin text-accent" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-text-secondary text-sm">Loading products...</p>
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
