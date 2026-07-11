import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";
import { getThemePage } from "@/themes/themeResolver";

const shopTitle = "Shop All Fabrics | Shree Hari Cutpiece";
const shopDescription = "Browse premium cutpiece fabrics by category, style, and price. Shop cotton, silk, georgette, rayon, and more sold per meter.";

export const metadata: Metadata = buildPageMetadata({
  title: shopTitle,
  description: shopDescription,
  path: "/shop",
  keywords: ["shop fabrics", "cotton fabric", "silk cutpiece", "georgette fabric", "fabric by meter"],
});

type ShopAppPageProps = {
  searchParams?: {
    category?: string;
  };
};

export default async function ShopAppPage({ searchParams }: ShopAppPageProps) {
  const ThemeShopPage = await getThemePage("ShopPage");

  const schemaMarkup = [
    buildWebPageSchema({
      path: "/shop",
      title: shopTitle,
      description: shopDescription,
      type: "CollectionPage",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Shop", path: "/shop" },
    ]),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`shop-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ThemeShopPage searchParams={searchParams} />
    </>
  );
}
