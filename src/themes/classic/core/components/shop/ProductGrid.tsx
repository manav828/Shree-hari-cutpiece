/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { supabase } from "@/lib/supabase";
import { applyPlpFiltersAndSort, isAllCategory, type PlpSortBy } from "@/lib/plpFilterEngine";
import { trackFilterUse } from "@/lib/tracking";

interface ProductGridProps {
  initialCategory?: string;
}

type PriceBand = "all" | "under-500" | "500-999" | "1000-1999" | "2000-plus";

type RuleSet = {
  label: string;
  keywords: string[];
};

type GridProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  unit: string;
  selling_mode: "meter" | "piece";
  variantId: string | null;
  category: string;
  categorySlug: string;
  image: string;
  featured: boolean;
  requiresOptions: boolean;
  fabricType: string;
  occasionTag: string;
  patternTag: string;
  colorFamilies: string[];
  priceBand: Exclude<PriceBand, "all">;
};

const occasionRules: RuleSet[] = [
  { label: "Festive", keywords: ["festive", "wedding", "bridal", "party", "occasion", "ceremony"] },
  { label: "Office", keywords: ["office", "formal", "workwear", "corporate"] },
  { label: "Daily", keywords: ["daily", "everyday", "casual", "regular", "comfort"] },
];

const patternRules: RuleSet[] = [
  { label: "Floral", keywords: ["floral", "flower", "botanical"] },
  { label: "Printed", keywords: ["print", "printed", "block print", "digital"] },
  { label: "Embroidered", keywords: ["embroider", "zari", "brocade", "jacquard", "woven"] },
  { label: "Textured", keywords: ["texture", "textured", "crinkle", "pleat"] },
];

const priceBandOptions: Array<{ value: Exclude<PriceBand, "all">; label: string }> = [
  { value: "under-500", label: "Under Rs 500 / m" },
  { value: "500-999", label: "Rs 500 - 999 / m" },
  { value: "1000-1999", label: "Rs 1000 - 1999 / m" },
  { value: "2000-plus", label: "Rs 2000+ / m" },
];

function normalizeText(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase();
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function detectKeywordLabel(inputText: string, ruleSet: RuleSet[], fallback: string): string {
  const text = normalizeText(inputText);
  const matched = ruleSet.find((entry) => entry.keywords.some((keyword) => text.includes(keyword)));
  return matched?.label || fallback;
}

function detectFabricType(rawFabric: string | null | undefined, productName: string, categoryName: string): string {
  const text = normalizeText(`${rawFabric || ""} ${productName} ${categoryName}`);
  if (text.includes("silk")) return "Silk";
  if (text.includes("cotton")) return "Cotton";
  if (text.includes("georgette")) return "Georgette";
  if (text.includes("chiffon")) return "Chiffon";
  if (text.includes("linen")) return "Linen";
  if (text.includes("rayon")) return "Rayon";
  if (text.includes("satin")) return "Satin";
  if (text.includes("organza")) return "Organza";
  return rawFabric ? String(rawFabric).trim() : "Other";
}

function detectColorFamily(colorName: string | null | undefined, colorHex: string | null | undefined): string {
  const name = normalizeText(colorName);
  if (!name && !colorHex) return "Mixed";

  if (name.includes("red") || name.includes("maroon") || name.includes("burgundy") || name.includes("wine")) return "Red";
  if (name.includes("pink") || name.includes("rose") || name.includes("fuchsia") || name.includes("magenta")) return "Pink";
  if (name.includes("orange") || name.includes("peach") || name.includes("rust")) return "Orange";
  if (name.includes("yellow") || name.includes("mustard") || name.includes("gold")) return "Yellow";
  if (name.includes("green") || name.includes("olive") || name.includes("mint") || name.includes("emerald")) return "Green";
  if (name.includes("blue") || name.includes("navy") || name.includes("teal") || name.includes("cyan")) return "Blue";
  if (name.includes("purple") || name.includes("violet") || name.includes("lavender")) return "Purple";
  if (name.includes("brown") || name.includes("beige") || name.includes("tan") || name.includes("camel")) return "Brown / Beige";
  if (name.includes("white") || name.includes("ivory") || name.includes("cream") || name.includes("off white")) return "White / Off-white";
  if (name.includes("black") || name.includes("charcoal") || name.includes("grey") || name.includes("gray") || name.includes("silver")) return "Black / Grey";

  const hex = normalizeText(colorHex).replace("#", "");
  if (/^[0-9a-f]{6}$/.test(hex)) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    if (r > 210 && g > 210 && b > 210) return "White / Off-white";
    if (r < 70 && g < 70 && b < 70) return "Black / Grey";
    if (r >= g && r >= b) return r - Math.max(g, b) > 40 ? "Red" : "Orange";
    if (g >= r && g >= b) return "Green";
    if (b >= r && b >= g) return "Blue";
  }

  return "Mixed";
}

function getPriceBand(price: number): Exclude<PriceBand, "all"> {
  if (price < 500) return "under-500";
  if (price < 1000) return "500-999";
  if (price < 2000) return "1000-1999";
  return "2000-plus";
}

function matchesPriceBand(price: number, band: PriceBand): boolean {
  if (band === "all") return true;
  if (band === "under-500") return price < 500;
  if (band === "500-999") return price >= 500 && price < 1000;
  if (band === "1000-1999") return price >= 1000 && price < 2000;
  return price >= 2000;
}

export default function ProductGrid({ initialCategory }: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "all");
  const [sortBy, setSortBy] = useState<PlpSortBy>("featured");
  const [selectedFabricType, setSelectedFabricType] = useState("all");
  const [selectedOccasion, setSelectedOccasion] = useState("all");
  const [selectedPattern, setSelectedPattern] = useState("all");
  const [selectedColorFamily, setSelectedColorFamily] = useState("all");
  const [selectedPriceBand, setSelectedPriceBand] = useState<PriceBand>("all");
  const [products, setProducts] = useState<GridProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const hasTrackedFilterChangeRef = useRef(false);

  useEffect(() => {
    setSelectedCategory(initialCategory || "all");
  }, [initialCategory]);

  useEffect(() => {
    if (!isMobileFiltersOpen) return undefined;

    const closeOnEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileFiltersOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEsc);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", closeOnEsc);
    };
  }, [isMobileFiltersOpen]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoadError("");
        const { data: catData, error: catError } = await supabase
          .from("categories")
          .select("id, name, slug")
          .eq("is_active", true)
          .is("deleted_at", null)
          .order("sort_order", { ascending: true });

        if (catError) throw catError;
        if (catData) setCategories(catData);

        const { data: prodData, error: prodError } = await supabase
          .from("products")
          .select(`
            id, name, slug, sell_mode, is_featured, fabric, short_description,
            categories ( name, slug ),
            product_variants ( id, color_name, color_hex, price, original_price, is_default, variant_images ( image_url, is_primary ) ),
            product_option_groups ( required )
          `)
          .eq("is_active", true);

        if (prodError) throw prodError;

        if (prodData) {
          const formatted = prodData.map((p: any) => {
            const variants = Array.isArray(p.product_variants) ? p.product_variants : [];
            const defaultVariant = variants.find((variant: any) => variant.is_default) || variants[0];
            const variantImages = Array.isArray(defaultVariant?.variant_images) ? defaultVariant.variant_images : [];
            const primaryImage = variantImages.find((img: any) => img.is_primary)?.image_url
              || variantImages[0]?.image_url
              || "";

            const categoryName = Array.isArray(p.categories) ? p.categories[0]?.name : p.categories?.name || "";
            const categorySlug = Array.isArray(p.categories) ? p.categories[0]?.slug : p.categories?.slug || "";
            const fabricType = detectFabricType(p.fabric, p.name, categoryName);
            const searchableText = `${p.name} ${categoryName} ${p.fabric || ""} ${p.short_description || ""}`;
            const occasionTag = detectKeywordLabel(searchableText, occasionRules, "Daily");
            const patternTag = detectKeywordLabel(searchableText, patternRules, "Solid");

            const variantColorFamilies = uniqueSorted(
              variants.map((variant: any) => detectColorFamily(variant?.color_name, variant?.color_hex))
            );

            const price = defaultVariant?.price || 0;

            return {
              id: p.id,
              name: p.name,
              slug: p.slug,
              price,
              originalPrice: defaultVariant?.original_price || price,
              unit: p.sell_mode === "meter" ? "meter" : "pc",
              selling_mode: p.sell_mode === "meter" ? "meter" : "piece",
              variantId: defaultVariant?.id || null,
              category: categoryName,
              categorySlug,
              image: primaryImage,
              featured: Boolean(p.is_featured),
              requiresOptions: Array.isArray(p.product_option_groups)
                ? p.product_option_groups.some((group: { required: boolean }) => group.required)
                : false,
              fabricType,
              occasionTag,
              patternTag,
              colorFamilies: variantColorFamilies.length > 0 ? variantColorFamilies : ["Mixed"],
              priceBand: getPriceBand(price),
            } satisfies GridProduct;
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

  const categorySortedProducts = useMemo(() => {
    return applyPlpFiltersAndSort(products, selectedCategory, sortBy);
  }, [products, selectedCategory, sortBy]);

  const filteredProducts = useMemo(() => {
    return categorySortedProducts.filter((product) => {
      const fabricMatch = selectedFabricType === "all"
        || normalizeText(product.fabricType) === normalizeText(selectedFabricType);
      const occasionMatch = selectedOccasion === "all"
        || normalizeText(product.occasionTag) === normalizeText(selectedOccasion);
      const patternMatch = selectedPattern === "all"
        || normalizeText(product.patternTag) === normalizeText(selectedPattern);
      const colorMatch = selectedColorFamily === "all"
        || product.colorFamilies.some((family) => normalizeText(family) === normalizeText(selectedColorFamily));
      const priceMatch = matchesPriceBand(product.price, selectedPriceBand);

      return fabricMatch && occasionMatch && patternMatch && colorMatch && priceMatch;
    });
  }, [categorySortedProducts, selectedFabricType, selectedOccasion, selectedPattern, selectedColorFamily, selectedPriceBand]);

  const fabricOptions = useMemo(() => uniqueSorted(products.map((product) => product.fabricType)), [products]);
  const occasionOptions = useMemo(() => uniqueSorted(products.map((product) => product.occasionTag)), [products]);
  const patternOptions = useMemo(() => uniqueSorted(products.map((product) => product.patternTag)), [products]);
  const colorFamilyOptions = useMemo(
    () => uniqueSorted(products.flatMap((product) => product.colorFamilies)),
    [products]
  );

  const hasActiveCategory = !isAllCategory(selectedCategory);
  const hasAdvancedFilters = selectedFabricType !== "all"
    || selectedOccasion !== "all"
    || selectedPattern !== "all"
    || selectedColorFamily !== "all"
    || selectedPriceBand !== "all";
  const activeFilterCount = [
    hasActiveCategory,
    selectedFabricType !== "all",
    selectedOccasion !== "all",
    selectedPattern !== "all",
    selectedColorFamily !== "all",
    selectedPriceBand !== "all",
  ].filter(Boolean).length;

  useEffect(() => {
    if (!hasTrackedFilterChangeRef.current) {
      hasTrackedFilterChangeRef.current = true;
      return;
    }

    trackFilterUse({
      category: selectedCategory,
      sortBy,
      fabricType: selectedFabricType,
      occasion: selectedOccasion,
      pattern: selectedPattern,
      colorFamily: selectedColorFamily,
      priceBand: selectedPriceBand,
      activeFilterCount,
      resultCount: filteredProducts.length,
    });
  }, [
    selectedCategory,
    sortBy,
    selectedFabricType,
    selectedOccasion,
    selectedPattern,
    selectedColorFamily,
    selectedPriceBand,
    activeFilterCount,
    filteredProducts.length,
  ]);

  const activeCategoryName = hasActiveCategory
    ? categories.find((category: any) => category.slug === selectedCategory)?.name || selectedCategory
    : "All Fabrics";

  const clearFilters = () => {
    setSelectedCategory("all");
    setSortBy("featured");
    setSelectedFabricType("all");
    setSelectedOccasion("all");
    setSelectedPattern("all");
    setSelectedColorFamily("all");
    setSelectedPriceBand("all");
  };

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
      {loadError && (
        <p className="text-red-600 text-sm mb-4">{loadError}</p>
      )}

      <div className="sticky top-[66px] sm:top-[88px] z-20 mb-8 bg-white border border-border/70 shadow-[0_6px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
          <div>
            <p className="text-xs tracking-[0.18em] uppercase text-text-secondary">Collection View</p>
            <p className="text-sm text-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} in {activeCategoryName}
              {hasAdvancedFilters ? ` with ${activeFilterCount} active filters` : ""}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="sm:hidden inline-flex items-center gap-1 border border-border px-3 py-2 text-xs tracking-wide uppercase text-foreground"
              aria-haspopup="dialog"
              aria-expanded={isMobileFiltersOpen}
              aria-controls="plp-mobile-filters"
            >
              Filters
            </button>

            {(hasActiveCategory || hasAdvancedFilters) && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 border border-border px-3 py-2 text-xs tracking-wide uppercase text-text-secondary hover:text-foreground"
              >
                Clear
              </button>
            )}

            <label htmlFor="plp-sort" className="sr-only">Sort products</label>
            <select
              id="plp-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as PlpSortBy)}
              className="px-3 sm:px-4 py-2 bg-background-secondary text-foreground text-sm border border-border outline-none cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="hidden sm:flex items-center flex-wrap gap-2 border-t border-border/70 px-5 py-4 bg-[#faf7f4]">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            aria-pressed={selectedCategory === "all"}
            className={`px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors ${selectedCategory === "all"
              ? "bg-foreground text-white"
              : "bg-white text-foreground border border-border hover:border-foreground"
              }`}
          >
            All Fabrics
          </button>
          {categories.map((category: any) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.slug)}
              aria-pressed={selectedCategory === category.slug}
              className={`px-4 py-2 text-xs tracking-[0.12em] uppercase transition-colors ${selectedCategory === category.slug
                ? "bg-foreground text-white"
                : "bg-white text-foreground border border-border hover:border-foreground"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-5 gap-3 border-t border-border/60 px-5 py-4 bg-white">
          <div>
            <label htmlFor="filter-fabric" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Fabric Type</label>
            <select
              id="filter-fabric"
              value={selectedFabricType}
              onChange={(event) => setSelectedFabricType(event.target.value)}
              className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All Fabric Types</option>
              {fabricOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-occasion" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Occasion</label>
            <select
              id="filter-occasion"
              value={selectedOccasion}
              onChange={(event) => setSelectedOccasion(event.target.value)}
              className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All Occasions</option>
              {occasionOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-color" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Color Family</label>
            <select
              id="filter-color"
              value={selectedColorFamily}
              onChange={(event) => setSelectedColorFamily(event.target.value)}
              className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All Colors</option>
              {colorFamilyOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-price" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Price / Meter</label>
            <select
              id="filter-price"
              value={selectedPriceBand}
              onChange={(event) => setSelectedPriceBand(event.target.value as PriceBand)}
              className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All Price Ranges</option>
              {priceBandOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-pattern" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Pattern</label>
            <select
              id="filter-pattern"
              value={selectedPattern}
              onChange={(event) => setSelectedPattern(event.target.value)}
              className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All Patterns</option>
              {patternOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setIsMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/45"
          />
          <div
            id="plp-mobile-filters"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-x-0 bottom-0 bg-white border-t border-border max-h-[82vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 id="mobile-filter-title" className="font-serif text-2xl text-foreground">Filter Collection</h3>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-sm text-text-secondary hover:text-foreground"
              >
                Done
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label htmlFor="mobile-fabric" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Fabric Type</label>
                <select
                  id="mobile-fabric"
                  value={selectedFabricType}
                  onChange={(event) => setSelectedFabricType(event.target.value)}
                  className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">All Fabric Types</option>
                  {fabricOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mobile-occasion" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Occasion</label>
                <select
                  id="mobile-occasion"
                  value={selectedOccasion}
                  onChange={(event) => setSelectedOccasion(event.target.value)}
                  className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">All Occasions</option>
                  {occasionOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mobile-color" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Color Family</label>
                <select
                  id="mobile-color"
                  value={selectedColorFamily}
                  onChange={(event) => setSelectedColorFamily(event.target.value)}
                  className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">All Colors</option>
                  {colorFamilyOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mobile-price" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Price / Meter</label>
                <select
                  id="mobile-price"
                  value={selectedPriceBand}
                  onChange={(event) => setSelectedPriceBand(event.target.value as PriceBand)}
                  className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">All Price Ranges</option>
                  {priceBandOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="mobile-pattern" className="block text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Pattern</label>
                <select
                  id="mobile-pattern"
                  value={selectedPattern}
                  onChange={(event) => setSelectedPattern(event.target.value)}
                  className="w-full border border-border bg-white px-3 py-2 text-sm text-foreground"
                >
                  <option value="all">All Patterns</option>
                  {patternOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <p className="text-[10px] tracking-[0.16em] uppercase text-text-secondary pt-2">Category</p>
              <button
                type="button"
                onClick={() => setSelectedCategory("all")}
                aria-pressed={selectedCategory === "all"}
                className={`w-full text-left px-4 py-3 text-sm border transition-colors ${selectedCategory === "all"
                  ? "bg-foreground text-white border-foreground"
                  : "bg-white border-border text-foreground"
                  }`}
              >
                All Fabrics
              </button>

              {categories.map((category: any) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.slug)}
                  aria-pressed={selectedCategory === category.slug}
                  className={`w-full text-left px-4 py-3 text-sm border transition-colors ${selectedCategory === category.slug
                    ? "bg-foreground text-white border-foreground"
                    : "bg-white border-border text-foreground"
                    }`}
                >
                  {category.name}
                </button>
              ))}

              <button
                type="button"
                onClick={clearFilters}
                className="w-full px-4 py-3 text-sm border border-border text-text-secondary"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-background-secondary border border-border/70">
          <p className="font-serif text-3xl text-foreground mb-3">No matching fabrics found</p>
          <p className="text-text-secondary text-base mb-7">
            Try another category or clear filters to view the full collection.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center justify-center border border-foreground px-6 py-3 text-xs tracking-[0.18em] uppercase text-foreground hover:bg-foreground hover:text-white transition-colors"
            >
              Show All Fabrics
            </button>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center border border-border px-6 py-3 text-xs tracking-[0.18em] uppercase text-text-secondary hover:text-foreground transition-colors"
            >
              Get Buying Help
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
