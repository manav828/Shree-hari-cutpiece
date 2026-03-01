import { Metadata } from "next";
import productsData from "@/data/products.json";
import ProductDetailClient from "@/components/shop/ProductDetailClient";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return productsData.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = productsData.find((p) => p.slug === slug);
  
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
