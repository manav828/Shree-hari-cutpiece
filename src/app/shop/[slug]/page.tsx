import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
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
    .select("name, description")
    .eq("slug", slug)
    .single();

  if (!product) {
    return {
      title: "Product Not Found | Shree Hari Cutpiece",
    };
  }

  return {
    title: `${product.name} | Shree Hari Cutpiece`,
    description: product.description,
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
