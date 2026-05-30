/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/ui/Container";
import CartSidebar from "@/components/cart/CartSidebar";
import { formatPrice } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";

// Static reviews data
const reviewsData = [
  { id: 1, name: "Priya Sharma", rating: 5, date: "2 weeks ago", comment: "Excellent fabric quality!", verified: true },
  { id: 2, name: "Anjali Patel", rating: 4, date: "1 month ago", comment: "Good quality fabric.", verified: true },
  { id: 3, name: "Meera Gupta", rating: 5, date: "1 month ago", comment: "Love the color and quality.", verified: true },
];

interface ProductDetailClientProps { slug: string; }

export default function ProductDetailClient({ slug }: ProductDetailClientProps) {
  useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meters, setMeters] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "details" | "reviews" | "faq">("description");
  const [activeMedia, setActiveMedia] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string | string[] | number>>({});
  const [optionErrors, setOptionErrors] = useState<Record<string, string>>({});

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
      if (relatedIds.length > 0) {
        const { data: related } = await supabase
          .from("products")
          .select(`id, name, slug, sell_mode, product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )`)
          .in("id", relatedIds)
          .limit(8);

        if (related) {
          const orderMap = new Map(relatedIds.map((id: string, idx: number) => [id, idx]));
          const formattedRelated = related
            .sort((a: any, b: any) => Number(orderMap.get(a.id) ?? 0) - Number(orderMap.get(b.id) ?? 0))
            .map((p: any) => {
              const dv = p.product_variants.find((v: any) => v.is_default) || p.product_variants[0];
              const img = dv?.variant_images?.find((i: any) => i.is_primary)?.image_url || dv?.variant_images?.[0]?.image_url || "";
              return { id: p.id, name: p.name, slug: p.slug, price: dv?.price || 0, unit: p.sell_mode === "meter" ? "meter" : "pc", image: img };
            });
          setRelatedProducts(formattedRelated);
        }
      } else {
        setRelatedProducts([]);
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
    });
  };

  const averageRating = reviewsData.reduce((sum, r) => sum + r.rating, 0) / reviewsData.length;
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
    { id: "reviews", label: `Reviews (${reviewsData.length})` },
  ];

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
                          <Image src={item.url} alt={`${product.name} ${item.label.toLowerCase()} thumbnail`} fill sizes="96px" className="object-cover" />
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
                          <Image src={item.url} alt={`${product.name} ${item.label.toLowerCase()} mobile thumbnail`} fill sizes="80px" className="object-cover" />
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
                <label className="block text-sm font-medium text-foreground mb-3">Select {product.sell_mode === "meter" ? "Quantity (in meters)" : "Quantity"}</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border">
                    <button onClick={() => setMeters(Math.max(1, meters - 1))} className="px-4 py-3 hover:bg-background-secondary transition-colors text-lg">-</button>
                    <input type="number" value={meters} onChange={(e) => setMeters(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center py-3 border-x border-border focus:outline-none text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" min="1" />
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
                  {fabricRows.length === 0 && (
                    <>
                      <div className="grid grid-cols-2 gap-4 py-4 border-b border-border"><span className="text-text-secondary">Fabric Type</span><span className="text-foreground">{product.fabric || "N/A"}</span></div>
                      <div className="grid grid-cols-2 gap-4 py-4 border-b border-border"><span className="text-text-secondary">Width</span><span className="text-foreground">{product.width || "N/A"}</span></div>
                      <div className="grid grid-cols-2 gap-4 py-4 border-b border-border"><span className="text-text-secondary">Care Instructions</span><span className="text-foreground">{product.care_instructions || "N/A"}</span></div>
                    </>
                  )}
                  {fabricRows.map((row: any, idx: number) => (
                    <div key={`fabric-${idx}`} className="grid grid-cols-2 gap-4 py-4 border-b border-border">
                      <span className="text-text-secondary">{row.key}</span>
                      <span className="text-foreground">{row.value}</span>
                    </div>
                  ))}
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

          {relatedProducts.length > 0 && (
            <section className="mt-20 pt-12 border-t border-border">
              <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-10">You May Also Like</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relProduct) => (
                  <Link key={relProduct.id} href={`/shop/${relProduct.slug}`} className="group">
                    <div className="aspect-[4/5] relative overflow-hidden bg-background-secondary mb-4">
                      {relProduct.image ? (
                        <Image
                          src={relProduct.image}
                          alt={relProduct.name}
                          fill
                          sizes="(max-width: 1024px) 50vw, 25vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
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
