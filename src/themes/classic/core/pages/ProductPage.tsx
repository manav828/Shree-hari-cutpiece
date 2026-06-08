import ProductDetailClient from "@/themes/classic/components/shop/ProductDetailClient";

interface ProductPageProps {
    slug: string;
}

export default function ProductPage({ slug }: ProductPageProps) {
    return <ProductDetailClient slug={slug} />;
}
