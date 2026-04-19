import { Metadata } from "next";
import PolicyPageLayout from "@/components/policy/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";

export const metadata: Metadata = buildPageMetadata({
  title: "Returns Policy | Shree Hari Cutpiece",
  description: "Return eligibility, quality checks, and resolution process for Shree Hari Cutpiece orders.",
  path: "/returns-policy",
});

export default function ReturnsPolicyPage() {
  const schemaMarkup = [
    buildWebPageSchema({
      path: "/returns-policy",
      title: "Returns Policy | Shree Hari Cutpiece",
      description: "Return eligibility, quality checks, and resolution process for Shree Hari Cutpiece orders.",
      type: "WebPage",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Returns Policy", path: "/returns-policy" },
    ]),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`returns-policy-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PolicyPageLayout
        eyebrow="Store Policy"
        title="Returns Policy"
        subtitle="A transparent return process focused on quality and customer confidence."
        updatedAt="31 March 2026"
        sections={[
          {
            title: "Return Eligibility",
            body: [
              "Return requests must be raised within 7 days of delivery for eligible products.",
              "Items must be unused, unstitched, and in original condition with all packaging and tags intact.",
            ],
          },
          {
            title: "Non-Returnable Cases",
            body: [
              "Customized, stitched, washed, or altered fabrics are not eligible for return.",
              "Minor shade variation due to screen calibration is a normal occurrence and is not treated as a defect.",
            ],
          },
          {
            title: "Quality Review",
            body: [
              "All approved returns are quality-reviewed after pickup and before refund or exchange initiation.",
              "If the returned item does not meet policy condition requirements, the return may be declined.",
            ],
          },
          {
            title: "Refund Timeline",
            body: [
              "Approved refunds are processed to the original payment source as per banking timelines.",
              "For COD orders, refund method and timeline are confirmed by support at the time of approval.",
            ],
          },
        ]}
      />
    </>
  );
}
