import { Metadata } from "next";
import ProductDetailClient from "@/components/shop/ProductDetailClient";
import { supabase } from "@/lib/supabase";

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

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  return <ProductDetailClient slug={slug} />;
}
