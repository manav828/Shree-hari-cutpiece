import ProductDetailClient from "@/themes/bohemian/components/shop/ProductDetailClient";

interface ProductPageProps {
  slug: string;
  serverData?: any;
}

export default function BohemianProductPage({ slug, serverData }: ProductPageProps) {
  return <ProductDetailClient slug={slug} serverData={serverData} />;
}