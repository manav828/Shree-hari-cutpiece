import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { getActiveTheme } from "@/lib/theme";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";
import DefaultCartFullPage from "@/components/cart/DefaultCartFullPage";
import BohemianCartPage from "@/themes/bohemian/pages/CartPage";

const cartTitle = "Your Cart | Shree Hari Cutpiece";
const cartDescription = "Review your selected items, update quantity, and continue to secure checkout.";

export const metadata: Metadata = buildPageMetadata({
  title: cartTitle,
  description: cartDescription,
  path: "/cart",
  keywords: ["cart", "shopping cart", "fabric cart", "checkout"],
});

export default async function CartAppPage() {
  const activeTheme = await getActiveTheme();

  const schemaMarkup = [
    buildWebPageSchema({
      path: "/cart",
      title: cartTitle,
      description: cartDescription,
      type: "CollectionPage",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Cart", path: "/cart" },
    ]),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`cart-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {activeTheme === "bohemian" ? <BohemianCartPage /> : <DefaultCartFullPage />}
    </>
  );
}