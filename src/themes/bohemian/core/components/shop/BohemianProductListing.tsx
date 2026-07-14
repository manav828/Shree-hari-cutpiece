"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart, Search, SlidersHorizontal, X } from "lucide-react";
import {
  BOHEMIAN_LISTING_HERO_BY_VARIANT,
  type BohemianListingCategoryOption,
  type BohemianListingProduct,
  type BohemianListingVariant,
} from "@/themes/bohemian/components/shop/bohemianListingData";
import { bohemianBodyFont, bohemianHeadingFont } from "@/themes/bohemian/components/layout/premiumFonts";
import { useCart } from "@/context/CartContext";

type BohemianProductListingProps = {
  selectedCategorySlug: string;
  selectedCategoryName: string;
  categories: BohemianListingCategoryOption[];
  products: BohemianListingProduct[];
  variant: BohemianListingVariant;
};

type SortOption = "curated" | "price-low" | "price-high" | "name";

const BATCH_SIZE = 6;

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function sortProducts(products: BohemianListingProduct[], sortBy: SortOption): BohemianListingProduct[] {
  switch (sortBy) {
    case "price-low":
      return [...products].sort((a, b) => a.price - b.price);
    case "price-high":
      return [...products].sort((a, b) => b.price - a.price);
    case "name":
      return [...products].sort((a, b) => a.name.localeCompare(b.name));
    case "curated":
    default:
      return [...products].sort((a, b) => {
        const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
        if (featuredDelta !== 0) {
          return featuredDelta;
        }
        return a.name.localeCompare(b.name);
      });
  }
}

type CategoryMultiSelectProps = {
  categories: BohemianListingCategoryOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  buttonLabel: string;
};

function CategoryMultiSelect({ categories, selectedValues, onChange, buttonLabel }: CategoryMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalizedSelected = useMemo(
    () => selectedValues.map((value) => normalizeText(value)).filter(Boolean),
    [selectedValues],
  );

  const selectedSet = useMemo(() => new Set(normalizedSelected), [normalizedSelected]);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!containerRef.current) {
        return;
      }

      if (!containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) => category.name.toLowerCase().includes(normalizedSearch));
  }, [categories, searchTerm]);

  const selectedSummary = useMemo(() => {
    if (normalizedSelected.length === 0) {
      return "All categories";
    }

    if (normalizedSelected.length === 1) {
      const onlySelected = categories.find(
        (category) => normalizeText(category.slug) === normalizedSelected[0],
      );
      return onlySelected?.name || "1 selected";
    }

    return `${normalizedSelected.length} selected`;
  }, [categories, normalizedSelected]);

  function toggleCategory(slug: string) {
    const normalizedSlug = normalizeText(slug);
    const nextSet = new Set(normalizedSelected);

    if (nextSet.has(normalizedSlug)) {
      nextSet.delete(normalizedSlug);
    } else {
      nextSet.add(normalizedSlug);
    }

    const orderedValues = categories
      .map((category) => normalizeText(category.slug))
      .filter((categorySlug) => nextSet.has(categorySlug));

    onChange(orderedValues);
  }

  return (
    <div ref={containerRef} className="relative min-w-[220px]">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-center justify-between rounded-lg bg-[#f6f3ee] px-4 py-3 text-left text-sm font-semibold text-[#56423d] outline-none ring-[#9f3f29] transition hover:bg-[#f0ede8] focus:ring-1"
        aria-expanded={isOpen}
      >
        <span>
          {buttonLabel}: <span className="font-medium text-[#1c1c19]">{selectedSummary}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-[#89726c] transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-20 w-full rounded-xl border border-[#ddc0ba] bg-white p-3 shadow-[0_14px_28px_rgba(28,28,25,0.12)]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search categories"
              className="w-full rounded-lg bg-[#f6f3ee] py-2.5 pl-10 pr-3 text-sm text-[#1c1c19] outline-none ring-[#9f3f29] transition focus:ring-1"
            />
          </label>

          <div className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1">
            {filteredCategories.map((category) => {
              const normalizedSlug = normalizeText(category.slug);
              const checked = selectedSet.has(normalizedSlug);

              return (
                <label
                  key={`category-select-${category.id}`}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm text-[#4f4741] transition-colors hover:bg-[#f6f3ee]"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(category.slug)}
                    className="h-4 w-4 rounded border-[#ddc0ba] text-[#9f3f29] focus:ring-[#9f3f29]"
                  />
                  <span>{category.name}</span>
                </label>
              );
            })}

            {filteredCategories.length === 0 ? (
              <p className="px-2 py-3 text-xs text-[#89726c]">No category match found.</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function BohemianProductListing({
  selectedCategorySlug,
  selectedCategoryName,
  categories,
  products,
  variant,
}: BohemianProductListingProps) {
  const { addToCart } = useCart();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("curated");
  const [materialFilter, setMaterialFilter] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([normalizeText(selectedCategorySlug)]);
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [isMaterialOpen, setIsMaterialOpen] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const lazyLoadAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isFilterOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilterOpen]);

  const hero = BOHEMIAN_LISTING_HERO_BY_VARIANT[variant];

  const priceFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      }),
    [],
  );

  function handleQuickAdd(product: BohemianListingProduct) {
    addToCart({
      id: product.id,
      product_id: product.id,
      variant_id: undefined,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: product.image,
      meters: 1,
      selling_mode: "piece",
      analytics_source: "bohemian_listing_quick_add",
    });
  }

  const materialOptions = useMemo(() => {
    const uniqueMaterials = new Set<string>();
    products.forEach((product) => {
      const normalized = product.material.trim();
      if (normalized) {
        uniqueMaterials.add(normalized);
      }
    });

    return ["all", ...Array.from(uniqueMaterials)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalizeText(searchTerm);
    const normalizedMaterial = normalizeText(materialFilter);
    const selectedCategorySet = new Set(selectedCategories.map((value) => normalizeText(value)).filter(Boolean));

    const filtered = products.filter((product) => {
      if (selectedCategorySet.size > 0) {
        const productCategorySlug = normalizeText(product.categorySlug);
        const productCategoryName = normalizeText(product.categoryName);

        if (!selectedCategorySet.has(productCategorySlug) && !selectedCategorySet.has(productCategoryName)) {
          return false;
        }
      }

      if (normalizedMaterial !== "all" && normalizeText(product.material) !== normalizedMaterial) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchableText = [product.name, product.subtitle, product.material, product.categoryName]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });

    return sortProducts(filtered, sortBy);
  }, [materialFilter, products, searchTerm, selectedCategories, sortBy]);

  useEffect(() => {
    setSelectedCategories([normalizeText(selectedCategorySlug)]);
  }, [selectedCategorySlug]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchTerm, sortBy, materialFilter, selectedCategorySlug, selectedCategories]);

  const hasMoreProducts = visibleCount < filteredProducts.length;

  useEffect(() => {
    if (!hasMoreProducts || !lazyLoadAnchorRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((current) => Math.min(current + BATCH_SIZE, filteredProducts.length));
        }
      },
      {
        rootMargin: "260px 0px",
      },
    );

    observer.observe(lazyLoadAnchorRef.current);
    return () => observer.disconnect();
  }, [filteredProducts.length, hasMoreProducts]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const activeCategoryName = selectedCategoryName.trim() || "Collection";

  if (variant === "loom") {
    return (
      <main className={`${bohemianBodyFont.className} bg-[#fcf9f4] pb-20 text-[#1c1c19]`}>
        <section className="relative h-[38vh] min-h-[250px] max-h-[420px] w-full overflow-hidden">
          <Image src={hero.image} alt={hero.title} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="relative mx-auto flex h-full w-full max-w-[1320px] flex-col justify-end px-6 pb-8 text-white lg:px-8">
            <h1 className={`${bohemianHeadingFont.className} max-w-2xl text-4xl leading-[0.95] md:text-5xl`}>{hero.title}</h1>
            <p className="mt-5 max-w-2xl text-base italic text-white/90 md:text-[22px] md:leading-8">{hero.description}</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1180px] px-6 pt-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 text-sm text-[#6f645d]">
            <p>
              Viewing: <span className="font-semibold text-[#1c1c19]">{activeCategoryName}</span>
            </p>
            <Link href="/shop" className="font-semibold text-[#9f3f29] transition-colors hover:text-[#802915]">
              Back to all categories
            </Link>
          </div>
        </section>

        <section className="relative z-10 mx-auto mt-6 w-full max-w-[1180px] px-6 lg:px-8">
          <div className="rounded-xl bg-white p-3 shadow-[0_18px_32px_rgba(28,28,25,0.08)]">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1.3fr_auto_auto_auto]">
              <label className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder={`Search in ${activeCategoryName}...`}
                  className="w-full rounded-lg bg-[#f6f3ee] py-3 pl-11 pr-4 text-sm text-[#1c1c19] outline-none ring-[#9f3f29] transition focus:ring-1"
                />
              </label>

              <CategoryMultiSelect
                categories={categories}
                selectedValues={selectedCategories}
                onChange={setSelectedCategories}
                buttonLabel="Categories"
              />

              <div className="relative">
                <select
                  value={materialFilter}
                  onChange={(event) => setMaterialFilter(event.target.value)}
                  className="h-full w-full min-w-[140px] appearance-none rounded-lg bg-[#f6f3ee] px-4 py-3 text-sm font-medium text-[#56423d] outline-none ring-[#9f3f29] transition focus:ring-1"
                >
                  {materialOptions.map((option) => (
                    <option key={`loom-material-${option}`} value={option}>
                      {option === "all" ? "Material" : option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="h-full w-full min-w-[140px] appearance-none rounded-lg bg-[#f6f3ee] px-4 py-3 text-sm font-medium text-[#56423d] outline-none ring-[#9f3f29] transition focus:ring-1"
                >
                  <option value="curated">Sort By</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price Low to High</option>
                  <option value="price-high">Price High to Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1180px] px-6 pb-4 pt-16 lg:px-8">
          <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {visibleProducts.map((product) => (
              <article key={product.id} className="group">
                <Link href={`/shop/${product.slug}`} className="block">
                  <div className="relative mb-6 aspect-[4/5] overflow-hidden rounded-xl bg-[#f0ede8]">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-[#9f3f29] backdrop-blur-sm"
                      aria-hidden
                    >
                      <Heart className="h-4 w-4" />
                    </span>
                  </div>
                </Link>

                <div className="flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <Link href={`/shop/${product.slug}`} className={`${bohemianHeadingFont.className} text-[28px] sm:text-[34px] leading-[1.05] text-[#1c1c19] transition-colors hover:text-[#9f3f29] flex-1`}>
                      {product.name}
                    </Link>
                    <p className={`${bohemianHeadingFont.className} text-xl sm:text-2xl text-[#9f3f29] whitespace-nowrap pt-1`}>
                      {priceFormatter.format(product.price)}
                    </p>
                  </div>
                  <p className="text-sm text-[#6f645d] line-clamp-2">{product.subtitle}</p>
                  <div className="mt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a6f68] transition-colors hover:text-[#9f3f29] whitespace-nowrap"
                    >
                      + Quick Add
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="rounded-xl bg-[#f6f3ee] px-6 py-10 text-center text-sm text-[#56423d]">
              No products found in {activeCategoryName}. Try changing filters.
            </p>
          )}

          <div className="mt-16 flex flex-col items-center gap-5">
            <p className="text-sm text-[#6f645d]">Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products</p>
            {hasMoreProducts ? <p className="text-xs uppercase tracking-[0.16em] text-[#89726c]">Scroll down to load more</p> : null}
            <div ref={lazyLoadAnchorRef} className="h-2 w-full" aria-hidden />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={`${bohemianBodyFont.className} bg-[#fcf9f4] pb-24 text-[#1c1c19]`}>
      <section className="relative h-[38vh] min-h-[250px] max-h-[420px] w-full overflow-hidden">
        <Image src={hero.image} alt={hero.title} fill sizes="100vw" className="object-cover" priority />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative mx-auto flex h-full w-full max-w-[1320px] flex-col items-center justify-center px-6 text-center text-white lg:px-8">
          <h1 className={`${bohemianHeadingFont.className} max-w-3xl text-4xl italic leading-[0.95] md:text-5xl`}>{hero.title}</h1>
          <p className="mt-5 max-w-2xl text-lg text-white/90">{hero.description}</p>
        </div>
      </section>

      {/* Mobile filter sticky bar */}
      <div className="md:hidden sticky top-[57px] z-30 bg-[#fcf9f4]/95 backdrop-blur-sm border-b border-[#ebe3da] flex items-center gap-3 px-4 py-3">
        <button
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-2 rounded-full bg-[#f0ede8] px-4 py-2.5 text-sm font-semibold text-[#56423d] hover:bg-[#e7dfd6] transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {(materialFilter !== "all" || selectedCategories.filter(Boolean).length > 0) && (
            <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#9f3f29] text-[10px] font-bold text-white">
              {[materialFilter !== "all" ? 1 : 0, selectedCategories.filter(Boolean).length].reduce((a, b) => a + b, 0)}
            </span>
          )}
        </button>
        <div className="relative flex-1">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full appearance-none rounded-full bg-[#f0ede8] py-2.5 pl-4 pr-8 text-sm font-medium text-[#56423d] outline-none"
          >
            <option value="curated">Curated</option>
            <option value="name">Name</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
        </div>
      </div>

      <section className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-12 px-6 py-14 md:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden md:block">
          <div className="md:sticky md:top-24">
            <div>
              <div className="border-t border-[#ebe3da] pt-6">
                <p className={`${bohemianHeadingFont.className} text-xl`}>Category</p>
                <div className="mt-4">
                  <CategoryMultiSelect
                    categories={categories}
                    selectedValues={selectedCategories}
                    onChange={setSelectedCategories}
                    buttonLabel="Select"
                  />
                </div>
                <Link href="/shop" className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#9f3f29]">
                  View all categories
                </Link>
              </div>

              <div className="mt-8 border-t border-[#ebe3da] pt-6">
                <button
                  type="button"
                  onClick={() => setIsMaterialOpen((current) => !current)}
                  className="flex w-full items-center justify-between"
                >
                  <span className={`${bohemianHeadingFont.className} text-xl`}>Material</span>
                  <ChevronDown className={`h-4 w-4 text-[#89726c] transition-transform ${isMaterialOpen ? "rotate-180" : ""}`} />
                </button>
                {isMaterialOpen ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {materialOptions.map((option) => (
                      <button
                        key={`archive-material-${option}`}
                        type="button"
                        onClick={() => setMaterialFilter(option)}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                          normalizeText(option) === normalizeText(materialFilter)
                            ? "bg-[#9f3f29] text-white"
                            : "bg-[#f0ede8] text-[#5f5954] hover:bg-[#e7dfd6]"
                        }`}
                      >
                        {option === "all" ? "All" : option}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="mt-8 border-t border-[#ebe3da] pt-6">
                <p className={`${bohemianHeadingFont.className} text-xl`}>Price Range</p>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  defaultValue={50000}
                  className="mt-4 w-full accent-[#9f3f29]"
                  aria-label="Price range"
                />
                <div className="mt-2 flex justify-between text-xs text-[#7a6f68]">
                  <span>INR 0</span>
                  <span>INR 50,000+</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <div className="flex flex-col gap-4 border-b border-[#ebe3da] pb-6 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <label className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Find something specific..."
                  className="w-full rounded-full bg-[#f6f3ee] py-2.5 pl-10 pr-4 text-sm text-[#1c1c19] outline-none ring-[#9f3f29] transition focus:ring-1 sm:w-72"
                />
              </label>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                  className="appearance-none rounded-full bg-[#f6f3ee] py-2.5 pl-4 pr-9 text-sm font-medium text-[#56423d] outline-none ring-[#9f3f29] transition focus:ring-1"
                >
                  <option value="curated">Curated Selection</option>
                  <option value="name">Name</option>
                  <option value="price-low">Price Low to High</option>
                  <option value="price-high">Price High to Low</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
              </div>
            </div>
          </div>

          {visibleProducts.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {visibleProducts.map((product) => (
                <article key={product.id} className="group">
                  <Link href={`/shop/${product.slug}`} className="block">
                    <div className="mb-6 aspect-[4/5] overflow-hidden rounded-xl bg-[#f0ede8]">
                      <Image
                        src={product.image}
                        alt={product.name}
                        width={560}
                        height={700}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#89726c]">{product.material}</p>
                  <Link href={`/shop/${product.slug}`} className={`${bohemianHeadingFont.className} mt-1 block text-[34px] leading-[1.06] text-[#1c1c19] transition-colors hover:text-[#9f3f29]`}>
                    {product.name}
                  </Link>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm text-[#6f645d]">{priceFormatter.format(product.price)}</p>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(product)}
                      className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7a6f68] transition-colors hover:text-[#9f3f29] whitespace-nowrap"
                    >
                      + Quick Add
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-10 rounded-xl bg-[#f6f3ee] px-6 py-10 text-center text-sm text-[#56423d]">
              No products found in {activeCategoryName}. Try changing filters.
            </p>
          )}

          <div className="mt-16 flex flex-col items-center gap-5">
            <p className="text-sm text-[#6f645d]">Showing {Math.min(visibleCount, filteredProducts.length)} of {filteredProducts.length} products</p>
            {hasMoreProducts ? <p className="text-xs uppercase tracking-[0.16em] text-[#89726c]">Scroll down to load more</p> : null}
            <div ref={lazyLoadAnchorRef} className="h-2 w-full" aria-hidden />
          </div>
        </section>
      </section>

      {/* Mobile filter drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-[340px] bg-[#fcf9f4] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#ebe3da] px-5 py-4">
              <h2 className={`${bohemianHeadingFont.className} text-xl`}>Filters</h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="rounded-full p-2 hover:bg-[#f0ede8]"
                aria-label="Close filters"
              >
                <X className="h-5 w-5 text-[#56423d]" />
              </button>
            </div>
            <div className="px-5 py-6 space-y-6">
              {/* Category */}
              <div className="border-t border-[#ebe3da] pt-6">
                <p className={`${bohemianHeadingFont.className} text-xl mb-4`}>Category</p>
                <CategoryMultiSelect
                  categories={categories}
                  selectedValues={selectedCategories}
                  onChange={setSelectedCategories}
                  buttonLabel="Select"
                />
                <Link href="/shop" className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#9f3f29]">
                  View all categories
                </Link>
              </div>
              {/* Material */}
              <div className="border-t border-[#ebe3da] pt-6">
                <p className={`${bohemianHeadingFont.className} text-xl mb-4`}>Material</p>
                <div className="flex flex-wrap gap-2">
                  {materialOptions.map((option) => (
                    <button
                      key={`mobile-material-${option}`}
                      type="button"
                      onClick={() => setMaterialFilter(option)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.1em] transition-colors ${
                        normalizeText(option) === normalizeText(materialFilter)
                          ? "bg-[#9f3f29] text-white"
                          : "bg-[#f0ede8] text-[#5f5954] hover:bg-[#e7dfd6]"
                      }`}
                    >
                      {option === "all" ? "All" : option}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price Range */}
              <div className="border-t border-[#ebe3da] pt-6">
                <p className={`${bohemianHeadingFont.className} text-xl mb-4`}>Price Range</p>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  defaultValue={50000}
                  className="w-full accent-[#9f3f29]"
                  aria-label="Price range"
                />
                <div className="mt-2 flex justify-between text-xs text-[#7a6f68]">
                  <span>INR 0</span>
                  <span>INR 50,000+</span>
                </div>
              </div>
              {/* Apply button */}
              <button
                onClick={() => setIsFilterOpen(false)}
                className="w-full rounded-full bg-[#9f3f29] py-3 text-sm font-bold text-white"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
