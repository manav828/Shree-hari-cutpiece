export type BohemianListingVariant = "archive" | "loom";

export type BohemianListingCategoryOption = {
  id: string;
  name: string;
  slug: string;
};

export type BohemianListingProduct = {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  material: string;
  price: number;
  originalPrice: number | null;
  image: string;
  categoryName: string;
  categorySlug: string;
  featured: boolean;
};

export type BohemianListingHero = {
  title: string;
  description: string;
  image: string;
};

type ListingSeedProduct = {
  slug: string;
  name: string;
  subtitle: string;
  material: string;
  price: number;
  originalPrice?: number;
  image: string;
};

const archiveSeedProducts: ListingSeedProduct[] = [
  {
    slug: "solstice-throw",
    name: "The Solstice Throw",
    subtitle: "Soft tassel throw in warm neutral tones.",
    material: "Sustainable Linen",
    price: 185,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCV94lDjRNBvql1-sAuBHx3RcKcyzhXAvWpXD0-J5ZoGJnPqCQMHn8sI62il0QbNyOUir-urdoglPzkT9hegl0DWnSOV7PCGVF4YNLEGpXm-mTU0dJIwUT-dYa6CPz-Gtv-DO0N2M6wD_ii6eMV8STRGv6SoihShyA2MSGJnKynzpoOVZBPPpAg0PvQ9SONySxB0iI3UXupnqxM7XWj-Gm7UOjaHVz7mpU9HEv_ne-A8zK83r-g73cabXxwPN7-iu6B2_TR2SRfAHQ",
  },
  {
    slug: "earthen-napkin-set",
    name: "Earthen Napkin Set",
    subtitle: "Everyday napkins with a grounded terracotta tone.",
    material: "Organic Cotton",
    price: 45,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAP0B3_NaVEA3SBcsvM7s1GbJMidZaWbvid3y3TlpFZ-qiwEb1hsGY5LDSAE83C_Wf-4p56G1wk9vNuDGNumfQiseGwPiZg8qLNfd-ACVGiedHsxeMdVKZQezvEeENP8GYj4FkthP-xZgDrYFCgpxCo8TqQ_OlFeZFESd04wmqO1Oc98vHyyUPgNky9FjM-qjFBXeuUs1PKgpW8pglgLrfY56kDUvu1CH3WeJm56fWy8bj4okb7tOjbhsI_4Yq85rXs5e06ZjPV1w0",
  },
  {
    slug: "nomad-wall-tapestry",
    name: "Nomad Wall Tapestry",
    subtitle: "Textured wall art with earthy geometric rhythm.",
    material: "Jute and Wool",
    price: 320,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCJleu9GsGVN9amQqXU7dDZIylqOQeLk7Q1j9re1k42XoeXEBgtj015FU9pyvrPYMwgsmszqpxlGbT5ZeKAqFdsMkx7TRimUU9c0jrdCGcL7LOsTqI1DKBXURruURy1LSObUV50PMJGPaSM2HbQaqfQ4fxRhr13aVx5GPqvAcJNu56RmvErtSCWwvtt5-oYV_Xt0ZKjVoPv9Mk_KJ6WyrTA6hXIwiTQmXF4IJcRXAjVzVe5lnMeBMOBmWaJ1oU28gSiL7HifdmzVFQ",
  },
  {
    slug: "sage-waffle-cushion",
    name: "Sage Waffle Cushion",
    subtitle: "Muted texture designed for layered seating.",
    material: "Belgian Linen",
    price: 65,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBOhv7gSiZnLqZ2iPGsN6JvN6JjhaXmW0q5XufQSZMpQXjRCSUmUI0gWMNwUi_RlwutY0j4KEFBhFxc0yAAUhVEu6Zmu_qcDU3ybkE4iWCnauSgp8N7cgv2JUY2jo_KMUuvvzNJqtc1aO-uwm0jaHnz9Jlncxo2VqYrMlQXSZFN9bPzUhXcwYBa07xHvwy0W7l3yxtoG4xk8LzfA4-64mQbIgwzYr6euPeyC0UbrX_NT1MlH24yUAxsTG5BnjiII3t2qVL40MmkujQ",
  },
  {
    slug: "amber-bed-runner",
    name: "Amber Bed Runner",
    subtitle: "Warm hand-woven accent for layered bedding.",
    material: "Recycled Wool",
    price: 145,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBIiNfJseCHzvelERnUORKQSU_famV441nW951xqtd2c4h8eO2NPy2cNXr0jKEnV5VenmZYJo_4-mmec-aVyKWJgVnqJNznnKgm10KD5ApT-nZCK_JM95YBrLrfgbp9q7DQvDOG-bdXPCudVABi99sh0X9Cgu2_499op6Ik0hMyAAgyICgZJJY9ehl5QC1eRVnIGO4xVHy1bpoapT4Wqyk7ONIQfW_5whcnkSXedv3LoA5lKalIB4aDlYbc4VeYTw07MCBaWyPUTBs",
  },
  {
    slug: "tectonic-table-runner",
    name: "Tectonic Table Runner",
    subtitle: "Structured lines for a slow dining ritual.",
    material: "Sustainable Cotton",
    price: 88,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBotdZHkARTAKMSfeysghfXkjGuHkp-rEbysTytjTN9mpjIhQZTSPAO22iAmBI3P40dagxgO2-nEdKmpKtgOY881OLdfkXBZbeYqJ6VfwV8G3tRC_Oa3B2YuTQTLuWAzRGtYsWQmjsgB7K0r0aaPRpV7CiRJwOLPXWl7fBRz6Y09TqQntRRDYX7xpOerW5IROyepoGQAFFmmUOEEPL610fB0imqgWxrzyhQciAwOGyUwa5bClWItwc0IfUr2cxEnXeQ6W6rxWqUDpE",
  },
];

const loomSeedProducts: ListingSeedProduct[] = [
  {
    slug: "atlas-throw",
    name: "The Atlas Throw",
    subtitle: "Hand-spun organic wool",
    material: "Organic Wool",
    price: 280,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK2qxA80Rfeq7_Fqd64_cu1UI35d76lF7VjSRsx3sOh5_lx01mAuCqmGVpssqErGczwHoulg9MWKxVEYN6Oyr01c0s1zVqD7oFyossFkVnMEowLXCvqWGyX1zpnBQ-91qLurG_N4RvoGNGBinuMBeYq2lyATaH_RqlE3uhz56p0hc4fHtDuk4A3iu1vfZl9qz6fdSCNZui2fIpjjjWOVemaCKk5a_UuebtnloBXyGrvs8DhjsPYRz0UcCfgmxoKrHgugXslS1kkQI",
  },
  {
    slug: "dusk-indigo-cushion",
    name: "Dusk Indigo Cushion",
    subtitle: "Hand-dyed botanical pigments",
    material: "Natural Pigment",
    price: 125,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuACH8SLNGkokfUscn8-LdexJRNMu3-QwypkSGHrjty_5V6ssVD1HzJ-sMHlJI2Ge2aXZZF2CpLZH3JliX2e4yz0J_QCOC3HUttMpRBtKrr-9aO6dXrMs3j1PVVoQhjW3KXNqULBC9B98jMJYGIos8kI09G2N1vWrBwCCCtXl6c1sTSecw2bJDF1UQARqlL9BNNfsGtHbTlHZCzYD1-01G6KD4v-L3_oMIVxYjWGm3BwFs4rOon8G9fSt87SKsWKvJ3RNMt08zYXtkg",
  },
  {
    slug: "oaxaca-runner",
    name: "Oaxaca Runner",
    subtitle: "Flat-weave traditional wool",
    material: "Wool",
    price: 340,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCiLnfiiHeE2wseuPkFD8Qw6uW9Mim2-qfdsKgmx9IGVPyTQksxYBp7JYkZwJxxJamPYlaFp4S_6wTY5eF540pVQq9P4BD4BYGlj0mAQsHMhhLwzgjuvrIs_shsBLEwM3DiDtz6a_ThyNmHyIUv6eLUKX8I1XjTSV-ECpJbBXXZctSym71arprkZs8j1Il3L2ovR3CIZXL6_9H4xMnFiLbBEGbHivfR9QWNr_-M0NQX0c7uSe6GxIuv0kq1PM4kK27UM20ZFBmdxFg",
  },
  {
    slug: "muted-sage-blanket",
    name: "Muted Sage Blanket",
    subtitle: "Recycled cotton and silk blend",
    material: "Cotton Blend",
    price: 195,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdCNRYzVY13jeNGRR40C_S9IKJoKnq9JdSocRxDVBfKyVzLKn2iVlO3eSaybN5nXWJYAZMW2Wi9uIkxMvrDIfma4daKjL-0FPRT8zHgmhdxvCsaHX3jazBNM-MWcybXpPdxPxW0YemZ8Kvr36f-pXE57D7NB1VXME7P1HbFdge1TVa6dR_MPj1nm3Ro1kctSqR3HlT6q5bnR7ZBXNFwjzv9vH4s9gYavAtFt07F8TOmVw3lrqfqPKJFleRUwfoym4Nz-c4WpymoqY",
  },
  {
    slug: "earth-tier-cushion-set",
    name: "Earth Tier Cushion Set",
    subtitle: "Stonewashed heavy linen",
    material: "Linen",
    price: 110,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2nVKc4iUa4W_1V_M20vN3w-y-HdSBPyLg7OdWVHud8gCVyXvPnaD5H_XkwRCNWPeMnQuJKLRXpsL3g1Z38QwdpSmB0abhzL6umvwvpSQSQxNQAFJkI_Qqr0tL126mwXITX52BaCs4bveU9EqgSJGonV66KOFHYyogSi3A45bLe_3bvw_KfHPx6c3Gjmd4mRlWhXvTJEs1QIqm_VbCXKG0HqDt1pbafFAoOp0sbW2e3kiAn9ZfX5YlRX8hg6EbS850BXZyiO_iqWc",
  },
  {
    slug: "horizon-tapestry",
    name: "Horizon Tapestry",
    subtitle: "Hand-knotted jute and hemp",
    material: "Jute and Hemp",
    price: 420,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDlxkDnR5Ct-eabsDqb2ec86WHeys-jdLJ96MYEkrwWJfdaVC-gsNL5vYX5baBzQkozgRCKCmcDdejzzZavlvV9fIgSSjM9XLn2DL7XAHsbaiIwBtga0qaCEZtzFvUlyJoi5imWnvNWNGZa4pK4jGerGuimUeqhj8wxf6Ipw1u503PGhklz0xXEeVJhuti5XRVLyEPXhIWRaXsM7JtNWNughcdu5UzbYcl2MQBDhBEz99BU8DgZiaVcVrkA0KWh_Zs0QRV3vG9tnCQ",
  },
];

export const BOHEMIAN_LISTING_HERO_BY_VARIANT: Record<BohemianListingVariant, BohemianListingHero> = {
  archive: {
    title: "Hand-Woven Textiles",
    description: "Tactile stories woven from sustainable fibers, designed for the slow-living sanctuary.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCUqfLd3chRl8iLG_4ZCEVY3dwc5nqC8RemCQWkpnncETzZFjX1EdLNItovuGf3PMJknvKwda4UubJVW2LPGEUDiZhL6nqzUW_cDc6NezHdfpMgZjyrt_kG1SbFHGCdWPFw9Fl3943b4Rtn2kjth2_9ClhYN3TgPwfqaSWmsUbY2uG7yxXLf6mESa2urdaahJUhMTT7VnRsT4bgBqEg53UipmUN9s3YEoW8H_pA8nIq_CSFaijvstuu_mAZcEKhSYCoxaAIhSseoqI",
  },
  loom: {
    title: "Hand-Woven Textiles",
    description: "Ancestral weaving techniques passed through generations, creating warmth and history for the modern home.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbLY8Uc_JXM0tkCK5KKTbdxEh-2PdZso8QsKwcCMaCjgI0lGQClj3oKbKRTkWOE1NaW-iBjeFqAm2ysZLHKT6i-xVAod-nMnrlzOVlupIEP_bPkzjmmXwJRZje-ogx8cAElWCkUv-VRE6bUmzOyXc9VfB9ChsQhRtjNgJVkl75w114FhA88_-dbnNAVDvKX7AuivQ--0aUVTuMKy20-yRkyDQIA3DRFyZIIFgmMHOxPtI4p19PpvYft1yRIU1HphKLrMnCOSqqoIo",
  },
};

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

export function getBohemianListingVariant(categorySlug: string): BohemianListingVariant {
  const normalized = normalizeCategory(categorySlug);
  if (normalized === "ceramics" || normalized === "living" || normalized === "decor") {
    return "loom";
  }
  return "archive";
}

export function formatCategoryName(categorySlug: string): string {
  const cleaned = categorySlug.trim();
  if (!cleaned) {
    return "Collection";
  }

  return cleaned
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getBohemianFallbackProducts(
  categorySlug: string,
  categoryName: string,
  variant: BohemianListingVariant,
): BohemianListingProduct[] {
  const source = variant === "archive" ? archiveSeedProducts : loomSeedProducts;

  return source.map((seed, index) => ({
    id: `fallback-${categorySlug}-${index + 1}`,
    slug: seed.slug,
    name: seed.name,
    subtitle: seed.subtitle,
    material: seed.material,
    price: seed.price,
    originalPrice: seed.originalPrice ?? null,
    image: seed.image,
    categoryName,
    categorySlug,
    featured: index < 2,
  }));
}
