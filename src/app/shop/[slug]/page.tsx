import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { getSiteUrl } from "@/lib/siteUrl";
import { buildBreadcrumbSchema, buildProductSchema, buildWebPageSchema } from "@/lib/seoSchema";
import { getThemePage } from "@/themes/themeResolver";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase.from("products").select("slug").eq("is_active", true);
  if (!data) return [];

  return (data as any[]).map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: productRaw } = await supabase
    .from("products")
    .select("name, description, short_description, meta_title, meta_description, canonical_url, og_title, og_description, og_image_url, twitter_card_type")
    .eq("slug", slug)
    .single();

  const product = productRaw as any;

  if (!product) {
    return {
      title: "Product Not Found | Shree Hari Cutpiece",
    };
  }

  const siteUrl = getSiteUrl();
  const title = product.meta_title || `${product.name} | Shree Hari Cutpiece`;
  const description = product.meta_description || product.short_description || product.description || "";
  const canonical = product.canonical_url || `${siteUrl}/shop/${slug}`;
  const ogTitle = product.og_title || title;
  const ogDescription = product.og_description || description;
  const ogImage = product.og_image_url || undefined;
  const twitterCard = product.twitter_card_type || "summary_large_image";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: twitterCard as "summary" | "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Server-side data fetching helpers                                   */
/* ------------------------------------------------------------------ */

async function fetchFullProduct(slug: string) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id, name, slug, description, short_description, long_description, description_html, description_css, use_custom_description, related_product_ids,
      artisan_headline, artisan_description, artisan_image, artisan_quote, custom_tabs,
      highlights, faqs, fabric, width, care_instructions, fabric_details,
      sell_mode,
      categories ( id, name, slug ),
      product_variants ( id, color_name, color_hex, material_label, price, original_price, stock, sku, is_default, variant_images ( image_url, is_primary, media_type ) ),
      product_option_groups ( id, name, input_type, input_data_type, required, min_selections, max_selections, placeholder, help_text, input_min_length, input_max_length, input_min_value, input_max_value, sort_order, is_active, product_option_values ( id, label, value, is_default, sort_order, is_active ) )
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) return null;
  return data as any;
}

async function fetchRelatedProducts(product: any) {
  const relatedIds = Array.isArray(product.related_product_ids)
    ? product.related_product_ids.filter((id: string) => id && id !== product.id)
    : [];

  let results: any[] = [];

  if (relatedIds.length > 0) {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, sell_mode, fabric, product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )")
      .in("id", relatedIds)
      .eq("is_active", true)
      .limit(8);

    if (data) {
      const orderMap = new Map(relatedIds.map((id: string, idx: number) => [id, idx]));
      results = data
        .sort((a: any, b: any) => Number(orderMap.get(a.id) ?? 0) - Number(orderMap.get(b.id) ?? 0))
        .slice(0, 8);
    }
  }

  // Fallback: fetch by fabric similarity
  if (results.length === 0) {
    let fallbackQuery = supabase
      .from("products")
      .select("id, name, slug, sell_mode, fabric, is_featured, product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )")
      .eq("is_active", true)
      .neq("id", product.id)
      .limit(16);

    if (product.fabric) {
      fallbackQuery = fallbackQuery.ilike("fabric", `%${product.fabric}%`);
    }

    const { data: fallbackProducts } = await fallbackQuery;
    if (fallbackProducts && fallbackProducts.length > 0) {
      results = fallbackProducts;
    }
  }

  return results.slice(0, 8);
}

async function fetchReviewsSettings() {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", ["show_product_reviews", "allow_user_reviews"]);

    if (error) return { showProductReviews: true, allowUserReviews: true };

    const map: Record<string, string> = {};
    (data || []).forEach((row) => { map[row.key] = row.value; });

    const parseBoolean = (raw: string | undefined, defaultVal: boolean): boolean => {
      if (raw === undefined || raw === null) return defaultVal;
      const clean = String(raw).replace(/"/g, "").trim().toLowerCase();
      return clean === "true" || clean === "1";
    };

    return {
      showProductReviews: parseBoolean(map["show_product_reviews"], true),
      allowUserReviews: parseBoolean(map["allow_user_reviews"], true),
    };
  } catch {
    return { showProductReviews: true, allowUserReviews: true };
  }
}

async function fetchProductReviews(productId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("product_reviews")
      .select("id, product_id, user_id, user_name, rating, comment_text, images, video_url, created_at")
      .eq("product_id", productId)
      .eq("is_visible", true)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  } catch {
    return [];
  }
}

/* ------------------------------------------------------------------ */
/* Page Component                                                      */
/* ------------------------------------------------------------------ */

export default async function ProductAppPage({ params }: ProductPageProps) {
  const { slug } = await params;

  // Fetch product data + theme page component in parallel
  const [product, ThemeProductPage] = await Promise.all([
    fetchFullProduct(slug),
    getThemePage("ProductPage"),
  ]);

  // Build schema markup from product data
  const schemaProduct = product;
  const variants = Array.isArray(schemaProduct?.product_variants) ? schemaProduct.product_variants : [];
  const defaultVariant = variants.find((variant: { is_default?: boolean }) => variant.is_default) || variants[0];
  const variantImages = Array.isArray(defaultVariant?.variant_images) ? defaultVariant.variant_images : [];
  const primaryImage = variantImages.find((image: { is_primary?: boolean }) => image.is_primary)?.image_url || variantImages[0]?.image_url;
  const categoryEntry = Array.isArray(schemaProduct?.categories) ? schemaProduct.categories[0] : schemaProduct?.categories;

  const schemaMarkup = schemaProduct ? [
    buildWebPageSchema({
      path: `/shop/${slug}`,
      title: schemaProduct.name,
      description: schemaProduct.short_description || schemaProduct.description || schemaProduct.name,
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
      { name: schemaProduct.name, path: `/shop/${slug}` },
    ]),
    buildProductSchema({
      path: `/shop/${slug}`,
      name: schemaProduct.name,
      description: schemaProduct.short_description || schemaProduct.description || schemaProduct.name,
      category: categoryEntry?.name || null,
      images: primaryImage ? [primaryImage] : [],
      sku: defaultVariant?.sku || null,
      price: typeof defaultVariant?.price === "number" ? defaultVariant.price : null,
      availability: typeof defaultVariant?.stock === "number" && defaultVariant.stock <= 0
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    }),
  ] : [];

  // Fetch related data in parallel (only if product was found)
  let serverData: any = null;
  if (product) {
    const [relatedProducts, reviewsSettings, reviews] = await Promise.all([
      fetchRelatedProducts(product),
      fetchReviewsSettings(),
      fetchProductReviews(product.id),
    ]);

    serverData = {
      product,
      relatedProducts,
      reviewsSettings,
      reviews,
    };
  }

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`product-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ThemeProductPage slug={slug} serverData={serverData} />
    </>
  );
}
