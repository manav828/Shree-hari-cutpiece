import ProductDetailClient from "@/themes/bohemian/components/shop/ProductDetailClient";

interface ProductPageProps {
  slug: string;
}

export default function BohemianProductPage({ slug }: ProductPageProps) {
  return <ProductDetailClient slug={slug} />;
}