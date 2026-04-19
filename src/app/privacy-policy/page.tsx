import { Metadata } from "next";
import PolicyPageLayout from "@/components/policy/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy | Shree Hari Cutpiece",
  description: "How Shree Hari Cutpiece collects, uses, and protects customer information.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  const schemaMarkup = [
    buildWebPageSchema({
      path: "/privacy-policy",
      title: "Privacy Policy | Shree Hari Cutpiece",
      description: "How Shree Hari Cutpiece collects, uses, and protects customer information.",
      type: "WebPage",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Privacy Policy", path: "/privacy-policy" },
    ]),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`privacy-policy-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PolicyPageLayout
        eyebrow="Store Policy"
        title="Privacy Policy"
        subtitle="Your personal information is handled with care, clarity, and responsible access controls."
        updatedAt="31 March 2026"
        sections={[
          {
            title: "Information We Collect",
            body: [
              "We collect information required to process orders, deliver products, and provide customer support, including contact details and shipping information.",
              "Payment details are processed through secure payment partners. Sensitive card information is not stored directly in this storefront.",
            ],
          },
          {
            title: "How We Use Information",
            body: [
              "Customer data is used for order confirmation, dispatch communication, delivery coordination, and after-sales support.",
              "When consent is provided, we may share product updates or promotional messages through approved channels.",
            ],
          },
          {
            title: "Data Security",
            body: [
              "We apply reasonable technical and operational safeguards to reduce unauthorized access and data misuse risks.",
              "Access to operational customer data is limited to authorized personnel and role-restricted systems.",
            ],
          },
          {
            title: "Data Requests",
            body: [
              "Customers can request profile updates, communication preference changes, or account assistance by contacting support.",
              "Regulatory and legal retention requirements may apply to transaction records.",
            ],
          },
        ]}
      />
    </>
  );
}
