import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdminClient";
import { CACHE_TAGS, CACHE_TTL_SECONDS, getCacheEnabled } from "@/lib/cache";

// ─── Types ────────────────────────────────────────────────────────────────────

export type StorefrontProductVariantImage = {
  image_url: string | null;
  is_primary: boolean | null;
};

export type StorefrontProductVariant = {
  id: string;
  price: number | null;
  original_price: number | null;
  material_label: string | null;
  is_default: boolean | null;
  selling_mode?: string | null;
  variant_images: StorefrontProductVariantImage[];
};

export type StorefrontProductCategory = {
  name: string | null;
  slug: string | null;
};

export type StorefrontProduct = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  is_featured: boolean | null;
  is_new_arrival: boolean | null;
  is_active: boolean;
  sell_mode: string | null;
  categories: StorefrontProductCategory | StorefrontProductCategory[] | null;
  product_variants: StorefrontProductVariant[];
};

// ─── Raw DB Query ─────────────────────────────────────────────────────────────
// Single source of truth for product shape — all cached functions use this.
const PRODUCT_SELECT = `
  id,
  name,
  slug,
  short_description,
  description,
  is_featured,
  is_new_arrival,
  is_active,
  sell_mode,
  categories ( name, slug ),
  product_variants (
    id,
    price,
    original_price,
    material_label,
    is_default,
    variant_images ( image_url, is_primary )
  )
`;

async function fetchAllActiveProducts(): Promise<StorefrontProduct[]> {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[products] DB fetch error:", error.message);
    return [];
  }

  return (data ?? []) as unknown as StorefrontProduct[];
}

// ─── Cached Version ────────────────────────────────────────────────────────────
const fetchAllActiveProductsCached = unstable_cache(
  fetchAllActiveProducts,
  ["storefront_products_all"],
  { revalidate: CACHE_TTL_SECONDS, tags: [CACHE_TAGS.products] },
);

// ─── Public API ────────────────────────────────────────────────────────────────
// All theme components should import from here — never query Supabase directly.

/**
 * Returns ALL active products (up to 500).
 * Filtered in memory by callers to avoid many cache keys.
 * Uses supabaseAdmin on the server — never exposed to the browser.
 */
export async function getAllActiveProducts(): Promise<StorefrontProduct[]> {
  const cacheEnabled = await getCacheEnabled();
  if (cacheEnabled) {
    return fetchAllActiveProductsCached();
  }
  return fetchAllActiveProducts();
}

/**
 * Products filtered by category slug. Pass null/undefined for all products.
 */
export async function getProductsForCategory(
  categorySlug?: string | null,
): Promise<StorefrontProduct[]> {
  const all = await getAllActiveProducts();

  if (!categorySlug || categorySlug === "all") {
    return all;
  }

  const normalizedSlug = categorySlug.trim().toLowerCase();

  return all.filter((product) => {
    const cats = Array.isArray(product.categories)
      ? product.categories
      : product.categories
        ? [product.categories]
        : [];
    return cats.some(
      (cat) => (cat?.slug ?? "").trim().toLowerCase() === normalizedSlug,
    );
  });
}

/**
 * Featured products (is_featured = true).
 */
export async function getFeaturedProducts(): Promise<StorefrontProduct[]> {
  const all = await getAllActiveProducts();
  return all.filter((p) => p.is_featured === true);
}

/**
 * New arrivals (is_new_arrival = true).
 */
export async function getNewArrivalProducts(): Promise<StorefrontProduct[]> {
  const all = await getAllActiveProducts();
  return all.filter((p) => p.is_new_arrival === true);
}

/**
 * Single product by slug for the product detail page.
 */
export async function getProductBySlug(
  slug: string,
): Promise<StorefrontProduct | null> {
  const all = await getAllActiveProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

/**
 * Single product by exact slug match — used on homepage featured section.
 */
export async function getFeaturedProductBySlug(
  slug: string,
): Promise<StorefrontProduct | null> {
  return getProductBySlug(slug);
}
