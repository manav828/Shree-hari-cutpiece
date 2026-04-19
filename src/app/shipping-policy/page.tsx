import { Metadata } from "next";
import PolicyPageLayout from "@/components/policy/PolicyPageLayout";
import { buildPageMetadata } from "@/lib/seo";
import { buildBreadcrumbSchema, buildWebPageSchema } from "@/lib/seoSchema";

export const metadata: Metadata = buildPageMetadata({
  title: "Shipping Policy | Shree Hari Cutpiece",
  description: "Shipping timelines, dispatch process, and delivery coverage for Shree Hari Cutpiece orders.",
  path: "/shipping-policy",
});

export default function ShippingPolicyPage() {
  const schemaMarkup = [
    buildWebPageSchema({
      path: "/shipping-policy",
      title: "Shipping Policy | Shree Hari Cutpiece",
      description: "Shipping timelines, dispatch process, and delivery coverage for Shree Hari Cutpiece orders.",
      type: "WebPage",
    }),
    buildBreadcrumbSchema([
      { name: "Home", path: "/" },
      { name: "Shipping Policy", path: "/shipping-policy" },
    ]),
  ];

  return (
    <>
      {schemaMarkup.map((schema, index) => (
        <script
          key={`shipping-policy-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <PolicyPageLayout
        eyebrow="Store Policy"
        title="Shipping Policy"
        subtitle="Clear dispatch and delivery expectations for every order."
        updatedAt="31 March 2026"
        sections={[
          {
            title: "Order Processing",
            body: [
              "Orders are confirmed after payment or order verification and are typically processed within 1 to 2 business days.",
              "During peak sale periods or festive seasons, processing may take slightly longer, and the updated estimate will be shared by our support team.",
            ],
          },
          {
            title: "Dispatch and Delivery",
            body: [
              "Standard delivery timelines are 3 to 7 business days for most serviceable locations in India.",
              "Remote pin codes may take additional time depending on courier network availability.",
            ],
          },
          {
            title: "Shipping Charges",
            body: [
              "Shipping fees are shown at checkout before final payment.",
              "Promotional free-shipping offers apply only when the order meets published campaign conditions.",
            ],
          },
          {
            title: "Tracking and Support",
            body: [
              "When available, a tracking link is shared after dispatch so you can follow your order status in real time.",
              "If tracking is delayed or unavailable, please contact support with your order number for manual status assistance.",
            ],
          },
        ]}
      />
    </>
  );
}
