import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { buildOrganizationSchema, buildWebPageSchema, buildWebSiteSchema } from "@/lib/seoSchema";
import { getThemePage } from "@/themes/themeResolver";

const homeTitle = "Shree Hari Cutpiece | Premium Fabric Per Meter";
const homeDescription = "Discover premium cutpiece fabrics at Shree Hari. Shop cotton, silk, georgette, and occasion-ready textiles sold per meter.";

export const metadata: Metadata = buildPageMetadata({
  title: homeTitle,
  description: homeDescription,
  path: "/",
  keywords: ["premium fabric", "cutpiece", "fabrics per meter", "Ahmedabad textile market", "dress material"],
});

export default async function Home() {
  const ThemeHomePage = await getThemePage("HomePage");

  const schemaMarkup = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    buildWebPageSchema({
      path: "/",
      title: homeTitle,
      description: homeDescription,
    }),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`home-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ThemeHomePage />
    </>
  );
}
