import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

export interface UpsellProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  image: string;
  selling_mode: "meter" | "piece";
  category?: string;
}

export function useUpsellProducts(limit = 4) {
  const { items } = useCart();
  const [products, setProducts] = useState<UpsellProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use a derived key of product IDs in the cart to avoid re-fetching 
  // on simple quantity/meter adjustments
  const productIdsKey = items
    .map((item) => item.product_id)
    .filter(Boolean)
    .sort()
    .join(",");

  useEffect(() => {
    let isMounted = true;

    async function fetchUpsellProducts() {
      try {
        setLoading(true);
        setError(null);

        const productIdsInCart = Array.from(
          new Set(
            items
              .map((item) => item.product_id)
              .filter(Boolean) as string[]
          )
        );

        let categoryIds: string[] = [];

        // If there are products in the cart, find their categories
        if (productIdsInCart.length > 0) {
          const { data: cartProducts, error: categoryError } = await supabase
            .from("products")
            .select("category_id")
            .in("id", productIdsInCart);

          if (categoryError) throw categoryError;

          if (cartProducts) {
            categoryIds = Array.from(
              new Set(
                (cartProducts as any[])
                  .map((p) => p.category_id)
                  .filter(Boolean) as string[]
              )
            );
          }
        }

        // Fetch products in matching categories, excluding products already in the cart
        let categoryMatches: any[] = [];
        if (categoryIds.length > 0) {
          let query = supabase
            .from("products")
            .select(`
              id, name, slug, sell_mode, category_id,
              categories ( name ),
              product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )
            `)
            .eq("is_active", true)
            .in("category_id", categoryIds)
            .limit(limit);

          if (productIdsInCart.length > 0) {
            query = query.not("id", "in", `(${productIdsInCart.map(id => `"${id}"`).join(",")})`);
          }

          const { data, error: matchError } = await query;
          if (matchError) throw matchError;
          if (data) categoryMatches = data;
        }

        // If we don't have enough matching products, fetch featured products to fill the gaps
        let featuredMatches: any[] = [];
        const neededCount = limit - categoryMatches.length;
        if (neededCount > 0) {
          const excludedIds = [
            ...productIdsInCart,
            ...categoryMatches.map((p) => p.id),
          ];

          let query = supabase
            .from("products")
            .select(`
              id, name, slug, sell_mode, category_id,
              categories ( name ),
              product_variants ( price, original_price, is_default, variant_images ( image_url, is_primary ) )
            `)
            .eq("is_active", true)
            .eq("is_featured", true)
            .limit(neededCount);

          if (excludedIds.length > 0) {
            query = query.not("id", "in", `(${excludedIds.map(id => `"${id}"`).join(",")})`);
          }

          const { data, error: featuredError } = await query;
          if (featuredError) throw featuredError;
          if (data) featuredMatches = data;
        }

        const allRawProducts = [...categoryMatches, ...featuredMatches].slice(0, limit);

        const formatted: UpsellProduct[] = allRawProducts.map((p: any) => {
          const defaultVariant =
            p.product_variants?.find((v: any) => v.is_default) ||
            p.product_variants?.[0];
          const primaryImage =
            defaultVariant?.variant_images?.find((img: any) => img.is_primary)
              ?.image_url ||
            defaultVariant?.variant_images?.[0]?.image_url ||
            "";

          return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: defaultVariant?.price || 0,
            originalPrice: defaultVariant?.original_price || undefined,
            image: primaryImage,
            selling_mode: p.sell_mode === "meter" ? "meter" : "piece",
            category: Array.isArray(p.categories)
              ? p.categories[0]?.name
              : p.categories?.name || "",
          };
        });

        if (isMounted) {
          setProducts(formatted);
        }
      } catch (err: any) {
        console.error("Error fetching upsell products:", err);
        if (isMounted) {
          setError(err.message || "Failed to fetch upsell products");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchUpsellProducts();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIdsKey, limit]);

  return { products, loading, error };
}
