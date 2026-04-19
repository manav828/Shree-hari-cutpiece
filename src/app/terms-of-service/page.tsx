import { Metadata } from "next";
import PolicyPageLayout from "@/components/policy/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";

export const metadata: Metadata = buildPageMetadata({
  title: "Terms of Service | Shree Hari Cutpiece",
  description: "Terms governing the use of the Shree Hari Cutpiece website and order services.",
  path: "/terms-of-service",
});

export default function TermsOfServicePage() {
  const schemaMarkup = [
    buildWebPageSchema({
      path: "/terms-of-service",
      title: "Terms of Service | Shree Hari Cutpiece",
      description: "Terms governing the use of the Shree Hari Cutpiece website and order services.",
      type: "WebPage",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Terms of Service", path: "/terms-of-service" },
    ]),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`terms-policy-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PolicyPageLayout
        eyebrow="Store Policy"
        title="Terms of Service"
        subtitle="Standard terms that apply to website usage, purchases, and customer interactions."
        updatedAt="31 March 2026"
        sections={[
          {
            title: "Website Usage",
            body: [
              "By using this website, you agree to provide accurate information and use services for lawful purchase and communication purposes only.",
              "Any misuse, unauthorized attempts to access restricted areas, or harmful activity may result in access suspension.",
            ],
          },
          {
            title: "Product and Pricing",
            body: [
              "Product descriptions and pricing are maintained with care; however, occasional updates or corrections may be required.",
              "In case of clear pricing or listing errors, the store reserves the right to cancel or revise affected orders after communication.",
            ],
          },
          {
            title: "Order Acceptance",
            body: [
              "Orders are confirmed after successful verification and operational acceptance.",
              "The store may decline or cancel orders in rare situations such as stock mismatch, payment risk, or delivery-service limitations.",
            ],
          },
          {
            title: "Policy Applicability",
            body: [
              "Shipping, return, and privacy policies form part of these terms and should be reviewed before purchase.",
              "Continued use of the site after policy updates indicates acceptance of revised terms.",
            ],
          },
        ]}
      />
    </>
  );
}
