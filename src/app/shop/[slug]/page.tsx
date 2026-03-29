import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/siteUrl";
import { getActiveTheme } from "@/lib/theme";
import themes from "@/themes/registry";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const { data } = await supabase.from("products").select("slug").eq("is_active", true);
  if (!data) return [];

  return data.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data: product } = await supabase
    .from("products")
    .select("name, description, short_description, meta_title, meta_description, canonical_url, og_title, og_description, og_image_url, twitter_card_type")
    .eq("slug", slug)
    .single();

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

export default async function ProductAppPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const activeTheme = await getActiveTheme();

  // Resolve the active theme's product page component
  const themeConfig = themes[activeTheme] || themes["classic"];
  const ThemeProductPage = themeConfig.ProductPage;

  return <ThemeProductPage slug={slug} />;
}
