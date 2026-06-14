import { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildOrganizationSchema, buildWebPageSchema } from "@/lib/seoSchema";
import { getActiveTheme } from "@/lib/theme";
import themes from "@/themes/registry";

const aboutTitle = "About Us | Shree Hari Cutpiece";
const aboutDescription = "Learn about Shree Hari Cutpiece, a trusted Ahmedabad-based premium cutpiece fabric brand focused on quality and guidance.";

export const metadata: Metadata = buildPageMetadata({
  title: aboutTitle,
  description: aboutDescription,
  path: "/about",
  keywords: ["about shree hari", "ahmedabad fabric store", "textile heritage", "premium cutpiece"],
});

const milestones = [
  {
    year: "2011",
    title: "Store Foundation",
    description: "Started as a neighborhood textile counter focused on quality-driven cutpiece fabrics.",
  },
  {
    year: "2016",
    title: "Category Expansion",
    description: "Expanded into bridal, festive, and premium designer textile collections.",
  },
  {
    year: "2021",
    title: "Digital Orders",
    description: "Introduced assisted online ordering with WhatsApp consultation and verified dispatch flow.",
  },
  {
    year: "Today",
    title: "Trusted Fabric Partner",
    description: "Serving thousands of repeat customers from Ahmedabad and across India.",
  },
];

const values = [
  {
    title: "Quality Without Compromise",
    description: "Every fabric lot is hand-checked for texture, drape, and finishing before it reaches the shelf.",
  },
  {
    title: "Honest Fabric Advice",
    description: "We recommend what suits your design, occasion, and budget instead of pushing one-size choices.",
  },
  {
    title: "Personalized Support",
    description: "From first-time buyers to boutique owners, each customer gets practical, personal guidance.",
  },
];

export default async function AboutPage() {
  const activeTheme = await getActiveTheme();
  const ThemeAboutPage = themes[activeTheme]?.AboutPage || themes.classic.AboutPage;

  const schemaMarkup = [
    buildOrganizationSchema(),
    buildWebPageSchema({
      path: "/about",
      title: aboutTitle,
      description: aboutDescription,
      type: "AboutPage",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
    ]),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`about-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <ThemeAboutPage />
    </>
  );
}
