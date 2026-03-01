"use client";

import { useState, useMemo } from "react";
import ProductCard from "./ProductCard";
import productsData from "@/data/products.json";
import categoriesData from "@/data/categories.json";

interface ProductGridProps {
  initialCategory?: string;
}

export default function ProductGrid({ initialCategory }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [sortBy, setSortBy] = useState("featured");

  const filteredProducts = useMemo(() => {
    let products = [...productsData];

    // Filter by category
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        products.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        products.sort((a, b) => b.price - a.price);
        break;
      case "name":
        products.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Featured first
        products.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    return products;
  }, [selectedCategory, sortBy]);

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
          {categoriesData.map((category) => (
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
