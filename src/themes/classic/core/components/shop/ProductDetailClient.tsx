/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { getThumbnailUrl } from "@/lib/imageOptimization";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import { getWhatsAppUrl } from "@/lib/brand";
import { trackViewItem, trackWhatsAppClick } from "@/lib/tracking";
import ProductReviews from "@/components/shop/ProductReviews";



type RelatedProductCard = {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice: number;
  unit: string;
  image: string;
  fabricType: string;
};

function normalizeSpecKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function mapRelatedProducts(products: any[]): RelatedProductCard[] {
  return products.map((product: any) => {
    const variants = Array.isArray(product.product_variants) ? product.product_variants : [];
    const defaultVariant = variants.find((variant: any) => variant.is_default) || variants[0];
    const image = defaultVariant?.variant_images?.find((img: any) => img.is_primary)?.image_url
      || defaultVariant?.variant_images?.[0]?.image_url
      || "";

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: defaultVariant?.price || 0,
      originalPrice: defaultVariant?.original_price || defaultVariant?.price || 0,
      unit: product.sell_mode === "meter" ? "meter" : "pc",
      image,
      fabricType: product.fabric || "Premium Fabric",
    } satisfies RelatedProductCard;
  });
}

function mergeUniqueRelated(base: RelatedProductCard[], incoming: RelatedProductCard[]): RelatedProductCard[] {
  const seenIds = new Set(base.map((item) => item.id));
  const merged = [...base];

  incoming.forEach((item) => {
    if (!seenIds.has(item.id)) {
      seenIds.add(item.id);
      merged.push(item);
    }
  });

  return merged;
}

interface ProductDetailClientProps { slug: string; }

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [meters, setMeters] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews" | "faq">("description");
  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[] | number>>({});
  const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});
  const viewedProductVariantRef = useRef<string | null>(null);
  const [dynamicReviews, setDynamicReviews] = useState<any[]>([]);

  useEffect(() => {
    if (product?.id) {
      fetch(`/api/shop/reviews?product_id=${product.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.reviews) {
            setDynamicReviews(data.reviews);
          }
        })
        .catch((err) => console.error("Error loading reviews summary:", err));
    }
  }, [product?.id]);

  useEffect(() => {
    async function fetchProduct() {
      const { data, error } = await supabase
        .from("products")
        .select(`
          id, name, slug, description, short_description, long_description, description_html, description_css, use_custom_description, related_product_ids,
          highlights, faqs, fabric, width, care_instructions, fabric_details,
          sell_mode,
          categories ( id, name, slug ),
          product_variants ( id, color_name, color_hex, material_label, price, original_price, stock, sku, is_default, variant_images ( image_url, is_primary, media_type ) ),
          product_option_groups ( id, name, input_type, input_data_type, required, min_selections, max_selections, placeholder, help_text, input_min_length, input_max_length, input_min_value, input_max_value, sort_order, is_active, product_option_values ( id, label, value, is_default, sort_order, is_active ) )
        `)
        .eq("slug", slug)
        .single();

      if (error || !data) {
        setLoading(false);
        return;
      }

      const resData = data as any;
      setProduct(resData);
      const groups = Array.isArray(resData.product_option_groups) ? resData.product_option_groups : [];
      const defaults: Record<string, string | string[]> = {};
      groups.forEach((group: any) => {
        if (group?.is_active === false) return;
        const values = Array.isArray(group.product_option_values)
          ? group.product_option_values.filter((v: any) => v.is_active !== false)
          : [];
        if (group.input_type === "multi") {
          const def = values.filter((v: any) => v.is_default).map((v: any) => v.id);
          if (def.length) defaults[group.id] = def;
        } else if (group.input_type === "radio" || group.input_type === "dropdown") {
          const def = values.find((v: any) => v.is_default);
          if (def) defaults[group.id] = def.id;
        }
      });
      setSelectedOptions(defaults);
      setOptionErrors({});
      const defVariant = resData.product_variants.find((v: any) => v.is_default) || resData.product_variants[0];
      setSelectedVariant(defVariant);

      const relatedIds = Array.isArray(resData.related_product_ids)
        ? resData.related_product_ids.filter((id: string) => id && id !== resData.id)
        : [];
      let finalRelatedProducts: RelatedProductCard[] = [];

      if (relatedIds.length > 0) {
        const { data: related } = await supabase
          .from("products")
          .select(`id, name, slug, sell_mode, fabric, product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )`)
          .in("id", relatedIds)
          .limit(8);

        if (related) {
          const orderMap = new Map(relatedIds.map((id: string, idx: number) => [id, idx]));
          const orderedRelated = related
            .sort((a: any, b: any) => Number(orderMap.get(a.id) ?? 0) - Number(orderMap.get(b.id) ?? 0))
            .slice(0, 8);

          finalRelatedProducts = mapRelatedProducts(orderedRelated);
        }
      }

      if (finalRelatedProducts.length < 8) {
        let fallbackQuery = supabase
          .from("products")
          .select(`id, name, slug, sell_mode, fabric, is_featured, product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )`)
          .eq("is_active", true)
          .neq("id", resData.id)
          .limit(16);

        if (resData.fabric) {
          fallbackQuery = fallbackQuery.ilike("fabric", `%${resData.fabric}%`);
        }

        const { data: fallbackProducts } = await fallbackQuery;

        if (fallbackProducts && fallbackProducts.length > 0) {
          const fallbackMapped = mapRelatedProducts(fallbackProducts);
          finalRelatedProducts = mergeUniqueRelated(finalRelatedProducts, fallbackMapped);
        }
      }

      setRelatedProducts(finalRelatedProducts.slice(0, 8));
      setLoading(false);
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product || !selectedVariant) return;

    const viewKey = `${product.id}:${selectedVariant.id || "default"}`;
    if (viewedProductVariantRef.current === viewKey) return;
    viewedProductVariantRef.current = viewKey;

    const category = Array.isArray(product.categories)
      ? product.categories[0]?.name
      : product.categories?.name;

    trackViewItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      variantId: selectedVariant.id,
      unitPrice: selectedVariant.price || 0,
      sellingMode: product.sell_mode === "meter" ? "meter" : "piece",
      category: category || "",
    });
  }, [product, selectedVariant]);

  if (loading) {
    return (
      <><Navbar /><CartSidebar />
        <main className="pt-12 lg:pt-24 pb-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {/* Breadcrumb Skeleton */}
            <div className="w-48 h-4 mb-10 rounded shimmer-bg" />

            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
              {/* Left Column Media Gallery Skeleton */}
              <div className="flex flex-col gap-4">
                <div className="flex flex-row gap-4 h-[500px] lg:h-[600px] w-full">
                  <div className="flex flex-col gap-4 w-24 flex-shrink-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="w-full h-32 rounded shimmer-bg" />
                    ))}
                  </div>
                  <div className="flex-1 rounded-lg bg-background-secondary shimmer-bg" />
                </div>
              </div>

              {/* Right Column Product Details Skeleton */}
              <div className="flex flex-col gap-6">
                <div className="w-3/4 h-12 rounded shimmer-bg" />
                <div className="w-1/2 h-8 rounded shimmer-bg" />
                <div className="w-1/3 h-5 rounded shimmer-bg" />
                <div className="w-full h-24 rounded shimmer-bg" />
                <div className="w-48 h-5 rounded shimmer-bg" />
                <div className="flex gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="w-12 h-12 rounded shimmer-bg" />
                  ))}
                </div>
                <div className="w-full h-14 rounded-lg shimmer-bg" />
              </div>
            </div>
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

  const optionGroups = Array.isArray(product.product_option_groups)
    ? product.product_option_groups
      .filter((g: any) => g.is_active !== false)
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    : [];

  const clearOptionError = (groupId: string) => {
    setOptionErrors((prev) => {
      if (!prev[groupId]) return prev;
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
  };

  const validateOptions = () => {
    const errors: Record<string, string> = {};
    optionGroups.forEach((group: any) => {
      const selection = selectedOptions[group.id];
      if (group.input_type === "input") {
        const raw = selection !== undefined && selection !== null ? String(selection).trim() : "";
        if (group.required && !raw) {
          errors[group.id] = "This field is required.";
          return;
        }
        if (raw) {
          if (group.input_data_type === "number") {
            const num = Number(raw);
            if (Number.isNaN(num)) {
              errors[group.id] = "Enter a valid number.";
              return;
            }
            if (group.input_min_value !== null && group.input_min_value !== undefined && num < group.input_min_value) {
              errors[group.id] = `Minimum value is ${group.input_min_value}.`;
              return;
            }
            if (group.input_max_value !== null && group.input_max_value !== undefined && num > group.input_max_value) {
              errors[group.id] = `Maximum value is ${group.input_max_value}.`;
              return;
            }
          } else {
            if (group.input_min_length && raw.length < group.input_min_length) {
              errors[group.id] = `Minimum length is ${group.input_min_length}.`;
              return;
            }
            if (group.input_max_length && raw.length > group.input_max_length) {
              errors[group.id] = `Maximum length is ${group.input_max_length}.`;
              return;
            }
          }
        }
        return;
      }

      if (group.input_type === "multi") {
        const list = Array.isArray(selection) ? selection : [];
        if (group.required && list.length === 0) {
          errors[group.id] = "Select at least one option.";
          return;
        }
        if (group.min_selections && list.length < group.min_selections) {
          errors[group.id] = `Select at least ${group.min_selections}.`;
          return;
        }
        if (group.max_selections && list.length > group.max_selections) {
          errors[group.id] = `Select up to ${group.max_selections}.`;
          return;
        }
        return;
      }

      if (group.required && !selection) {
        errors[group.id] = "Please select an option.";
      }
    });

    setOptionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildOptionSnapshots = () => {
    return optionGroups.map((group: any) => {
      const selection = selectedOptions[group.id];
      if (group.input_type === "input") {
        if (selection === undefined || selection === null || String(selection).trim() === "") return null;
        return {
          group_id: group.id,
          group_name: group.name,
          input_type: group.input_type,
          input_value: group.input_data_type === "number" ? Number(selection) : String(selection),
        };
      }

      const values = Array.isArray(group.product_option_values)
        ? group.product_option_values.filter((v: any) => v.is_active !== false)
        : [];

      if (group.input_type === "multi") {
        const ids = Array.isArray(selection) ? selection : [];
        if (!ids.length) return null;
        const selected = values.filter((v: any) => ids.includes(v.id));
        return {
          group_id: group.id,
          group_name: group.name,
          input_type: group.input_type,
          value_ids: selected.map((v: any) => v.id),
          value_labels: selected.map((v: any) => v.label),
        };
      }

      if (!selection) return null;
      const selected = values.find((v: any) => v.id === selection);
      return {
        group_id: group.id,
        group_name: group.name,
        input_type: group.input_type,
        value_ids: [String(selection)],
        value_labels: selected ? [selected.label] : [],
      };
    }).filter(Boolean);
  };

  const handleAddToCart = () => {
    if (!validateOptions()) return;
    const optionSnapshots = buildOptionSnapshots() as any[];
    const img = selectedVariant?.variant_images?.find((i: any) => i.is_primary)?.image_url || selectedVariant?.variant_images?.[0]?.image_url || "";
    setIsAdding(true);
    setTimeout(() => {
      addToCart({
        id: selectedVariant?.id || product.id,
        product_id: product.id,
        variant_id: selectedVariant?.id || undefined,
        name: `${product.name} ${selectedVariant?.color_name ? `(${selectedVariant.color_name})` : ""}`.trim(),
        slug: product.slug,
        price: selectedVariant?.price || 0,
        image: img,
        meters: meters,
        selling_mode: product.sell_mode === "meter" ? "meter" : "piece",
        selected_options: optionSnapshots,
        analytics_source: "pdp_primary_cta",
      });
      setIsAdding(false);
    }, 600);
  };

  const averageRating = dynamicReviews.length > 0
    ? dynamicReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / dynamicReviews.length
    : 0;
  const categoryName = Array.isArray(product.categories) ? product.categories[0]?.name : product.categories?.name;
  const shortDescription = product.short_description || product.description || "";
  const longDescription = product.long_description || product.description || "";
  const descriptionHtml = product.description_html || "";
  const descriptionCss = product.description_css || "";
  const useCustomDescription = Boolean(product.use_custom_description);
  const hasCustomDescription = descriptionHtml.trim().length > 0;
  const showCustomDescription = useCustomDescription && hasCustomDescription;
  const highlightItems = Array.isArray(product.highlights) ? product.highlights : [];
  const faqItems = Array.isArray(product.faqs) ? product.faqs : [];
  const fabricRows = Array.isArray(product.fabric_details) ? product.fabric_details : [];

  const extraFabricRows = fabricRows
    .map((row: any, index: number) => {
      if (!row || typeof row !== "object") return null;
      const label = String(row.label || row.title || row.name || row.key || `Detail ${index + 1}`).trim();
      const valueRaw = row.value ?? row.text ?? row.description ?? row.detail;
      const value = valueRaw !== undefined && valueRaw !== null ? String(valueRaw).trim() : "";
      if (!value) return null;
      return { label, value };
    })
    .filter(Boolean) as Array<{ label: string; value: string }>;

  const isMeterProduct = product.sell_mode === "meter";
  const quantityStep = isMeterProduct ? 0.5 : 1;

  const normalizeQuantity = (value: number) => {
    const stepped = Math.round(value / quantityStep) * quantityStep;
    const next = Math.max(quantityStep, stepped);
    return Number(next.toFixed(isMeterProduct ? 1 : 0));
  };

  const updateQuantity = (value: number) => {
    setMeters(normalizeQuantity(value));
  };

  const meterGuideRows = [
    { use: "Straight Kurti", min: 2.5, max: 3 },
    { use: "Anarkali / Flared Kurti", min: 4, max: 5.5 },
    { use: "Suit Set (Top + Bottom + Dupatta)", min: 6.5, max: 8 },
    { use: "Saree Blouse", min: 0.8, max: 1.2 },
  ];

  const fittingGuideMatch = isMeterProduct
    ? meterGuideRows.find((row) => meters >= row.min && meters <= row.max)
    : null;

  const extractSpecValue = (keywords: string[]) => {
    const match = extraFabricRows.find((row) => {
      const normalizedLabel = normalizeSpecKey(row.label);
      return keywords.some((keyword) => normalizedLabel.includes(keyword));
    });
    return match?.value || "";
  };

  const textileSpecs = [
    { label: "GSM", value: extractSpecValue(["gsm", "weight"]) || "Not specified" },
    { label: "Feel", value: extractSpecValue(["feel", "touch", "texture", "hand"]) || "Not specified" },
    { label: "Transparency", value: extractSpecValue(["transparency", "opacity", "sheer"]) || "Not specified" },
    { label: "Stretch", value: extractSpecValue(["stretch", "elasticity"]) || "Not specified" },
    { label: "Drape", value: extractSpecValue(["drape", "fall"]) || "Not specified" },
    { label: "Care", value: product.care_instructions || extractSpecValue(["care", "wash"]) || "Not specified" },
  ];

  const detailRows: Array<{ label: string; value: string }> = [
    { label: "Fabric Type", value: product.fabric || "N/A" },
    { label: "Width", value: product.width || "N/A" },
    { label: "Care Instructions", value: product.care_instructions || "N/A" },
    { label: "Sold By", value: `Per ${isMeterProduct ? "Meter" : "Piece"}` },
    { label: "Category", value: categoryName || "N/A" },
  ];

  const seenDetailKeys = new Set(detailRows.map((row) => normalizeSpecKey(row.label)));
  extraFabricRows.forEach((row) => {
    const rowKey = normalizeSpecKey(row.label);
    if (!seenDetailKeys.has(rowKey)) {
      seenDetailKeys.add(rowKey);
      detailRows.push(row);
    }
  });

  const complementaryBundles = [
    {
      title: "Main Fabric + Lining",
      description: "Pair this selection with breathable lining for better fall, opacity, and comfort.",
    },
    {
      title: "Dupatta + Border Styling",
      description: "Build a coordinated set by adding a contrasting dupatta or embroidered border accents.",
    },
    {
      title: "Tailor-Ready Cut Plan",
      description: "Share your measurements on WhatsApp to get practical quantity guidance before checkout.",
    },
  ];

  const galleryStoryLabels = [
    "Fabric hero",
    "Texture close-up",
    "Drape preview",
    "Outfit use-case",
    "Additional detail",
  ];

  const media = (Array.isArray(selectedVariant?.variant_images)
    ? [...selectedVariant.variant_images]
      .filter((img: any) => Boolean(img?.image_url))
      .sort((a: any, b: any) => Number(Boolean(b?.is_primary)) - Number(Boolean(a?.is_primary)))
    : []
  ).map((img: any, idx: number) => ({
    type: img.media_type || "image",
    url: img.image_url,
    label: img.media_type === "video"
      ? "Fabric motion preview"
      : galleryStoryLabels[idx] || `Gallery view ${idx + 1}`,
  }));

  const detailTabs = [
    { id: "description", label: "Description" },
    { id: "details", label: "Specifications" },
    ...(faqItems.length > 0 ? [{ id: "faq", label: `FAQs (${faqItems.length})` }] : []),
    { id: "reviews", label: `Reviews (${dynamicReviews.length})` },
  ];

  const stylistAssistUrl = getWhatsAppUrl(
    `Hi, I need help selecting the right quantity and styling for ${product.name}${selectedVariant?.color_name ? ` (${selectedVariant.color_name})` : ""}.`
  );

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
                          <Image src={getThumbnailUrl(item.url)} alt={`${product.name} ${item.label.toLowerCase()} thumbnail`} fill sizes="96px" className="object-cover" />
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
                      <Image
                        src={media[activeMedia]?.url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-contain"
                        priority={activeMedia === 0}
                      />
                    ) : (
                      <div className="w-full h-full bg-border flex items-center justify-center text-text-secondary text-sm">No Image</div>
                    )
                  )}
                  {media[activeMedia]?.label && (
                    <p className="absolute top-4 right-4 z-10 bg-black/55 text-white text-[10px] tracking-[0.14em] uppercase px-3 py-2">
                      {media[activeMedia].label}
                    </p>
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
                    media.length > 0 && (
                      <Image
                        src={media[activeMedia]?.url}
                        alt={product.name}
                        fill
                        sizes="100vw"
                        className="absolute inset-0 object-contain"
                        priority={activeMedia === 0}
                      />
                    )
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
                          <Image src={getThumbnailUrl(item.url)} alt={`${product.name} ${item.label.toLowerCase()} mobile thumbnail`} fill sizes="80px" className="object-cover" />
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
                  {[1, 2, 3, 4, 5].map((star) => {
                    const avgRating = dynamicReviews.length > 0
                      ? dynamicReviews.reduce((sum, r) => sum + r.rating, 0) / dynamicReviews.length
                      : 5;
                    return (
                      <svg key={star} className={`w-4 h-4 ${star <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    );
                  })}
                </div>
                <span className="text-text-secondary text-sm">({dynamicReviews.length} review{dynamicReviews.length === 1 ? "" : "s"})</span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-medium text-foreground">{formatPrice(selectedVariant?.price || 0)}</span>
                {selectedVariant?.original_price > selectedVariant?.price && (
                  <span className="text-xl text-text-secondary line-through">{formatPrice(selectedVariant.original_price)}</span>
                )}
                <span className="text-text-secondary">/ {product.sell_mode === "meter" ? "meter" : "pc"}</span>
              </div>

              <div className="mb-8 border border-border/70 bg-background-secondary/30 p-4 sm:p-5">
                <p className="text-[11px] tracking-[0.18em] uppercase text-text-secondary mb-4">Textile Specifications</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {textileSpecs.map((spec) => (
                    <div key={spec.label} className="bg-white border border-border/70 px-3 py-3">
                      <p className="text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-1">{spec.label}</p>
                      <p className="text-sm text-foreground leading-snug">{spec.value}</p>
                    </div>
                  ))}
                </div>
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

              {optionGroups.length > 0 && (
                <div className="mb-8 space-y-6">
                  {optionGroups.map((group: any) => {
                    const values = Array.isArray(group.product_option_values)
                      ? group.product_option_values.filter((v: any) => v.is_active !== false).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
                      : [];
                    const selection = selectedOptions[group.id];

                    return (
                      <div key={group.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-foreground">
                            {group.name}
                            {group.required && <span className="text-red-500"> *</span>}
                          </label>
                          {group.help_text && (
                            <span className="text-xs text-text-secondary">{group.help_text}</span>
                          )}
                        </div>

                        {group.input_type === "input" && (
                          <input
                            type={group.input_data_type === "number" ? "number" : "text"}
                            value={selection ?? ""}
                            onChange={(e) => {
                              const val = group.input_data_type === "number" ? e.target.value : e.target.value;
                              setSelectedOptions((prev) => ({ ...prev, [group.id]: val }));
                              clearOptionError(group.id);
                            }}
                            min={group.input_min_value ?? undefined}
                            max={group.input_max_value ?? undefined}
                            placeholder={group.placeholder || ""}
                            className="w-full px-3 py-2 border border-border bg-white focus:outline-none focus:border-accent"
                          />
                        )}

                        {group.input_type === "dropdown" && (
                          <select
                            value={typeof selection === "string" ? selection : ""}
                            onChange={(e) => {
                              setSelectedOptions((prev) => ({ ...prev, [group.id]: e.target.value }));
                              clearOptionError(group.id);
                            }}
                            className="w-full px-3 py-2 border border-border bg-white focus:outline-none focus:border-accent"
                          >
                            <option value="">Select {group.name}</option>
                            {values.map((val: any) => (
                              <option key={val.id} value={val.id}>{val.label}</option>
                            ))}
                          </select>
                        )}

                        {group.input_type === "radio" && (
                          <div className="flex flex-wrap gap-2">
                            {values.map((val: any) => (
                              <button
                                key={val.id}
                                type="button"
                                onClick={() => {
                                  setSelectedOptions((prev) => ({ ...prev, [group.id]: val.id }));
                                  clearOptionError(group.id);
                                }}
                                className={`px-3 py-1.5 border text-sm transition-colors ${selection === val.id
                                  ? "border-foreground bg-foreground text-white"
                                  : "border-border bg-white text-foreground hover:border-foreground"}`}
                              >
                                {val.label}
                              </button>
                            ))}
                          </div>
                        )}

                        {group.input_type === "multi" && (
                          <div className="flex flex-wrap gap-4">
                            {values.map((val: any) => {
                              const list = Array.isArray(selection) ? selection : [];
                              const checked = list.includes(val.id);
                              return (
                                <label key={val.id} className="flex items-center gap-2 text-sm text-foreground">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => {
                                      const next = checked
                                        ? list.filter((id: string) => id !== val.id)
                                        : [...list, val.id];
                                      setSelectedOptions((prev) => ({ ...prev, [group.id]: next }));
                                      clearOptionError(group.id);
                                    }}
                                    className="h-4 w-4 border-border"
                                  />
                                  {val.label}
                                </label>
                              );
                            })}
                          </div>
                        )}

                        {optionErrors[group.id] && (
                          <p className="text-xs text-red-500">{optionErrors[group.id]}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {shortDescription && (
                <p className="text-text-secondary text-lg leading-relaxed mb-8">{shortDescription}</p>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-foreground mb-3">Select {isMeterProduct ? "Quantity (in meters)" : "Quantity"}</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button onClick={() => updateQuantity(meters - quantityStep)} className="px-4 py-3 hover:bg-background-secondary transition-colors text-lg">-</button>
                    <input
                      type="number"
                      step={quantityStep}
                      value={meters}
                      onChange={(e) => updateQuantity(Number(e.target.value) || quantityStep)}
                      className="w-24 text-center py-3 border-x border-border focus:outline-none text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min={quantityStep}
                    />
                    <button onClick={() => updateQuantity(meters + quantityStep)} className="px-4 py-3 hover:bg-background-secondary transition-colors text-lg">+</button>
                  </div>
                  <span className="text-text-secondary">Total: <strong className="text-foreground">{formatPrice((selectedVariant?.price || 0) * meters)}</strong></span>
                </div>

                {isMeterProduct && (
                  <div className="mt-4 border border-border/70 bg-[#faf8f5] px-4 py-4 space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {[2.5, 3, 4.5, 6.5].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => updateQuantity(preset)}
                          className={`px-3 py-1.5 text-xs tracking-[0.12em] uppercase border transition-colors ${meters === preset
                            ? "bg-foreground text-white border-foreground"
                            : "bg-white text-foreground border-border hover:border-foreground"
                            }`}
                        >
                          {preset}m
                        </button>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs tracking-[0.14em] uppercase text-text-secondary">Quick meter guide</p>
                      {meterGuideRows.map((row) => (
                        <div key={row.use} className="flex items-center justify-between text-sm text-foreground">
                          <span>{row.use}</span>
                          <span className="text-text-secondary">{row.min} - {row.max} m</span>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-text-secondary leading-relaxed">
                      {fittingGuideMatch
                        ? `Your selected quantity is commonly used for ${fittingGuideMatch.use}. Final usage can vary by size, style, and lining.`
                        : "Need exact estimation? Share your measurements with our stylist for a precise cut plan."}
                    </p>
                  </div>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className="w-full btn-primary justify-center gap-3 mb-4 text-lg py-5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    Add to Cart
                  </>
                )}
              </button>

              <a
                href={stylistAssistUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-3 border border-foreground text-foreground hover:bg-foreground hover:text-white transition-colors duration-300 py-4 text-sm tracking-[0.12em] uppercase mb-5"
                onClick={() => trackWhatsAppClick({
                  location: "pdp_stylist_cta",
                  productId: product.id,
                  productSlug: product.slug,
                })}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ask Stylist on WhatsApp
              </a>

              <p className="text-text-secondary text-sm text-center mb-8">Free delivery on orders above ₹999</p>

              <div className="grid sm:grid-cols-2 gap-3 py-6 border-t border-border">
                <div className="border border-border/70 p-3 bg-white">
                  <p className="text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-1">Quality Check</p>
                  <p className="text-sm text-foreground">Fabric lots are verified for weave, color consistency, and finishing before dispatch.</p>
                </div>
                <div className="border border-border/70 p-3 bg-white">
                  <p className="text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-1">Delivery Promise</p>
                  <p className="text-sm text-foreground">Packed securely with dispatch updates shared on WhatsApp after order confirmation.</p>
                </div>
                <div className="border border-border/70 p-3 bg-white">
                  <p className="text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-1">Flexible Returns</p>
                  <p className="text-sm text-foreground">Easy return support for eligible orders according to the policy terms.</p>
                </div>
                <div className="border border-border/70 p-3 bg-white">
                  <p className="text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-1">Stylist Support</p>
                  <p className="text-sm text-foreground">Get size-to-meter guidance and styling advice before placing your order.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 border-t border-border pt-12">
            <div className="flex gap-8 border-b border-border mb-8">
              {detailTabs.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === tab.id ? "text-accent" : "text-text-secondary hover:text-foreground"}`}>
                  {tab.label}
                  {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />}
                </button>
              ))}
            </div>

            <div className="max-w-3xl">
              {activeTab === "description" && (
                <div className="prose prose-lg">
                  {showCustomDescription && descriptionCss && (
                    <style dangerouslySetInnerHTML={{ __html: descriptionCss }} />
                  )}
                  {showCustomDescription ? (
                    <div className="product-desc text-text-secondary leading-relaxed" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                  ) : (
                    <p className="text-text-secondary leading-relaxed">{longDescription}</p>
                  )}
                  {highlightItems.length > 0 && (
                    <ul className="mt-6 list-disc pl-6 text-text-secondary">
                      {highlightItems.map((item: string, idx: number) => (
                        <li key={`${item}-${idx}`}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {activeTab === "details" && (
                <div className="space-y-4">
                  {detailRows.map((row, idx, list) => (
                    <div
                      key={`${row.label}-${idx}`}
                      className={`grid grid-cols-2 gap-4 py-4 ${idx < list.length - 1 ? "border-b border-border" : ""}`}
                    >
                      <span className="text-text-secondary">{row.label}</span>
                      <span className="text-foreground">{row.value}</span>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "reviews" && (
                <div>
                  <ProductReviews productId={product.id} productSlug={slug} theme="classic" />
                </div>
              )}
              {activeTab === "faq" && (
                <div className="space-y-6">
                  {faqItems.length === 0 && (
                    <p className="text-text-secondary">No FAQs available for this product.</p>
                  )}
                  {faqItems.map((faq: any, idx: number) => (
                    <div key={`faq-${idx}`} className="border-b border-border pb-4">
                      <p className="font-medium text-foreground">{faq.question || faq.q}</p>
                      <p className="text-text-secondary mt-1">{faq.answer || faq.a}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <section className="mt-20 pt-12 border-t border-border">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-10">
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-text-secondary mb-2">Related Fabrics</p>
                <h2 className="font-serif text-2xl md:text-3xl text-foreground">Recommended With This Fabric</h2>
              </div>
              <Link href="/shop" className="text-sm text-text-secondary hover:text-foreground transition-colors">View Full Collection</Link>
            </div>

            {relatedProducts.length > 0 ? (
              <div className="flex gap-6 overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
                {relatedProducts.map((relProduct) => (
                  <Link key={relProduct.id} href={`/shop/${relProduct.slug}`} className="group w-[260px] flex-shrink-0 snap-start">
                    <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary mb-4">
                      {relProduct.image ? (
                        <Image
                          src={getThumbnailUrl(relProduct.image)}
                          alt={relProduct.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-border flex items-center justify-center" />
                      )}
                    </div>
                    <p className="text-[10px] tracking-[0.14em] uppercase text-text-secondary mb-1">{relProduct.fabricType}</p>
                    <h3 className="font-serif text-lg text-foreground group-hover:text-accent transition-colors line-clamp-1">{relProduct.name}</h3>
                    <p className="text-text-secondary text-sm">{formatPrice(relProduct.price)} / {relProduct.unit}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="border border-border/70 bg-background-secondary/50 p-6 text-center">
                <p className="text-text-secondary mb-4">Recommendations are being refreshed for this product. Explore our full catalog in the meantime.</p>
                <Link href="/shop" className="inline-flex items-center justify-center border border-foreground px-6 py-3 text-xs tracking-[0.16em] uppercase text-foreground hover:bg-foreground hover:text-white transition-colors">Explore Shop</Link>
              </div>
            )}
          </section>

          <section className="mt-12 grid md:grid-cols-3 gap-4">
            {complementaryBundles.map((bundle) => (
              <div key={bundle.title} className="border border-border/70 bg-white p-5">
                <p className="text-[10px] tracking-[0.16em] uppercase text-text-secondary mb-2">Cross-Sell Bundle</p>
                <h3 className="font-serif text-xl text-foreground mb-2">{bundle.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{bundle.description}</p>
              </div>
            ))}
          </section>
        </Container>
      </main>
      <Footer />
    </>
  );
}
