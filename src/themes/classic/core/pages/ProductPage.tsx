import ProductDetailClient from "@/themes/classic/components/shop/ProductDetailClient";

interface ProductPageProps {
    slug: string;
    serverData?: any;
}

export default function ProductPage({ slug, serverData }: ProductPageProps) {
    return <ProductDetailClient slug={slug} serverData={serverData} />;
}
