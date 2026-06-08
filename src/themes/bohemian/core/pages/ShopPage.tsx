import Image from "next/image";
import Link from "next/link";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { ArrowRight, ChevronDown, Search } from "lucide-react";
import { getActiveCmsBannersByPlacement, getActiveCmsCategories, getSiteConfigMap, type CmsCategory } from "@/lib/cms";
import { getAllActiveProducts } from "@/lib/products";
import CartSidebar from "@/themes/bohemian/components/cart/CartSidebar";
import Navbar from "@/themes/bohemian/components/layout/Navbar";
import Footer from "@/themes/bohemian/components/layout/Footer";
import { BOHEMIAN_SITE_CONTAINER } from "@/themes/bohemian/components/layout/siteStyles";
import LazyCollectionGrid from "@/themes/bohemian/components/shop/LazyCollectionGrid";
import BohemianProductListing from "@/themes/bohemian/components/shop/BohemianProductListing";
import {
  formatCategoryName,
  getBohemianFallbackProducts,
  type BohemianListingCategoryOption,
  type BohemianListingProduct,
} from "@/themes/bohemian/components/shop/bohemianListingData";

type ShopPageProps = {
  searchParams?: {
    category?: string;
  };
};

type CategoryCard = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  alt: string;
  countLabel: string;
  filter_layout?: string;
};

type ProductVariantImageRow = {
  image_url: string | null;
  is_primary: boolean | null;
};

type ProductVariantRow = {
  id: string;
  price: number | null;
  original_price: number | null;
  material_label: string | null;
  is_default: boolean | null;
  variant_images: ProductVariantImageRow[] | null;
};

type ProductCategoryRow = {
  name: string | null;
  slug: string | null;
};

type ProductQueryRow = {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  is_featured: boolean | null;
  categories: ProductCategoryRow | ProductCategoryRow[] | null;
  product_variants: ProductVariantRow[] | null;
};

const manrope = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
});

const primaryCategoryFallbacks: CategoryCard[] = [
  {
    id: "fallback-textiles",
    name: "Textiles",
    slug: "textiles",
    description: "Hand-woven layers and natural linens.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL8VZ8oIMfm_4FcKCpgeyhkM6iZ4--UJOonP0t22Khmj8vtEVNACVdwQN_bVoP7AjWl4Lg7pV7Xm2-txauTE9wIhH50lCEIVPZvScNeYG0heC3NHO8--7rn12O8cATkvmlsfAxxt_jR2Rqi8GdQdUNRwR2931gKKz00BdR0mZ_qpkJbddCS_BBaQ6zaFu7RePUS9co1mLCoudOxoUGQbZhQr_cEXzbUMiP9Doe5DdZxGVNs6gqERlpxbB4qTKYO8pbWWqlqwxBOis",
    alt: "Layered natural linen textiles",
    countLabel: "42 pieces",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-ceramics",
    name: "Ceramics",
    slug: "ceramics",
    description: "Earth-fired pottery and table forms.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLLCC3vYv9B1aoLSfPhHU6_wr3GRPvLNo_tyBS5L8xIXKRyVGUVeWW4quhGqd9UgGCtkD63nZWX5fK7cZksw5fd8VAI2IQ00tdRXSAHGjj1RhVzZ1bMgqjHruPiYGPKt-EmBvhGT6XCavt69H0afNXXZajZjPvnrkiKSqGKREtaLaEa_LZWzVlB-wWeAIaGhudrZq-nTtnuvEkugbp2T8K79IvW-5xYmXKbQOb57A46wtyQcgRC2xqP-ioj_tRhZHZBhsSC-t5Zfw",
    alt: "Handmade pottery in warm tones",
    countLabel: "28 pieces",
    filter_layout: "top",
  },
  {
    id: "fallback-living",
    name: "Living",
    slug: "living",
    description: "Soft forms for intentional spaces.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBjBr8G9Yit57JiHVHCxBvGFgOG67Hn2Em-b3mraJR-jwiQa3rYOBL92tFuZ29o-UKXyusW6QrfujdZz1dRTCEdRjYYOxO4dpDNdkRw6GzO_gfPfilgnU0WwzsDgfyhTZ1IKKzXK-qMAJLw695wvuGN12gjf8EHRw-saHtcqYGZ3dFunH9ysLrLNI0KpFLIJGSl0uBVPv3dAheR_YLZhouEEf-NSb3HnV3mEEqRqyTg_qi7IL64mVQslyyiWCbLtjuDxSFU3mR4CXY",
    alt: "Calm living room in earthy palette",
    countLabel: "15 pieces",
    filter_layout: "top",
  },
  {
    id: "fallback-kitchen",
    name: "Kitchen",
    slug: "kitchen",
    description: "Functional craft for daily rituals.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLnB-vzpjJdhX39TNk_BZSxJrxVjhoUhJHk2XKE0XyLawhiYQcS8_i9S3Z-Xr-St9bICk30COJzsq-ATUyewElyNo_Mxo2S3ttQrWsRe0dk-n68-088InBe9Ppo-uJ0jpVyEN07PcGGlSpkhzoV0n1uk0OGZWqJkAOI92wbs9IAYx8agXNHTNpz7M5qZK_A6LPABnFhGD0QAKF8ByfBwCF2R8Bzrfbr8ayCM5jYjihaoPchxu4VA9rrgJRbbYtPhy9JMk4AZgOy28",
    alt: "Kitchen shelf with wooden utensils",
    countLabel: "34 pieces",
    filter_layout: "sidebar",
  },
];

const moreCategoryFallbacks: CategoryCard[] = [
  {
    id: "fallback-rugs",
    name: "Rugs",
    slug: "rugs",
    description: "Woven anchors for cozy rooms.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBNwv_YRuzDgBYftHCyIG8sj8TXxECng4ufKiK6qYUcRvOvJXcqQXXKI9DoMVa-rPdXwmmxTe0h4DfElMvJAhtm7Rc22skgwe28yq6NaADKzoD0B3GTA0PEkyrwyoIrvtsg4vQhqdxrGxIa5a6cc0t8vAj7S57xPwn7bOydmNyBj5CvP793BkY_IUrTz2_6pUkfqMQxiiSbF211qW0GF4SfktMK_7tgy62PTyn4hLnVUOI96g2NvRG23Irueqv6v8K1a-52M-k1Ii8",
    alt: "Textured woven rug",
    countLabel: "12 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-decor",
    name: "Decor",
    slug: "decor",
    description: "Small accents with quiet character.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUHosQ2mk2S5Xr_dTCorKhsbLM3rAIGGhE_Xh_p3oHu0isbmEhWWQ95nSG8npExRN7EKw_pQLYdrrPmKgWJENSlaKTWyrDFPmBsfphbJt5VDuYf98aezQ4fqcg7PcfdMCBGS4AjT-Ged74xyT51gqMx8y2xOBP-FWf4AdJxdx5M_JprG2JYAY_Hyr26-9F1lbfxCs44D1y8d-MJu-tsDKqh2cRkb6CLfzXh0LIFVVkmUwSGDjmyNTUvchJCdJ_5TyuvmNHZv8TQZk",
    alt: "Decor objects on neutral shelf",
    countLabel: "48 items",
    filter_layout: "top",
  },
  {
    id: "fallback-furniture",
    name: "Furniture",
    slug: "furniture",
    description: "Natural forms in wood and fiber.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDenhfvTY2v8l0yTaL3DrhTv2EUR7cwm6_VFo68qC4nZoacoWTpxet3fROwWcTQOerR0C0-TnqkQa8Vg0mth1HQeF_b_qduB1FJzKuNGUmEi7J0LNb1NfE2517qbQ1ZbCQXUdmrj6pElD_cF3UWqLOV50lb7bPLwJ2-HLcLJxaBCz59lmn6IJuJSRLkRDA0lBUSTUkxccQWwqbM0jnsMzmzWDyWncRlDPZkNRxJU__PD7ojwwmKlMcFfyOUD3andsJmf-F0mXGAr7I",
    alt: "Minimal wood lounge chair",
    countLabel: "9 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-lighting",
    name: "Lighting",
    slug: "lighting",
    description: "Handmade luminaires and glow.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAHQWXqYCTzh29hCgG-5S1b4ulV8ByYnTAl7SgsfISWyHtZCBTKLXYswnMxGHQTbSVQPAn5qTv6oL5D_opPhP-YTWDVLLmyhMJbaUS5L3uFi63B_iCb7c7bbbohlrj_AejB2uPXE6ql6ZeP7iYP6IBHMMYHQvzDdx8518EtTUVr9-bly-MNLnMrW12M6ymWsS7wpZgpcH9LAdX9QY5pF7iR81rzUTnYWUEHVDsWN_ljFKQ3G6rChla2OFNORVS_L2PGLuELyJleE-Y",
    alt: "Woven pendant light",
    countLabel: "16 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-wall-art",
    name: "Wall Art",
    slug: "wall-art",
    description: "Textural art in warm palette.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD2y8SFEHkdvduzBVAHF3-i5UyE7AUlZS6hSuHGeAWeiyPuAQxUq6O_DMkurcwuBzVSIH2nUvJo6vPgciMtbEWxMuW570sQcAxQyGjkkmqNtKazCg4_iHwJv0qIV0Rs_l_X8Vv0VQEn1KZKDczyYxvWRkrT6RlgxCo6rdZuHQ0DiBFrCBXz0FoAbe5Zm9UoaDacbbYWOerhZYkL3upCyaI9gym1fDrO0CHHGK_IxO-OqLBFVkZuVg9XJuBkeHzC4N5XNdF_uREARdc",
    alt: "Abstract wall art in earthy tones",
    countLabel: "21 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-bedding",
    name: "Bedding",
    slug: "bedding",
    description: "Soft-touch sleep layers and throws.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDL8VZ8oIMfm_4FcKCpgeyhkM6iZ4--UJOonP0t22Khmj8vtEVNACVdwQN_bVoP7AjWl4Lg7pV7Xm2-txauTE9wIhH50lCEIVPZvScNeYG0heC3NHO8--7rn12O8cATkvmlsfAxxt_jR2Rqi8GdQdUNRwR2931gKKz00BdR0mZ_qpkJbddCS_BBaQ6zaFu7RePUS9co1mLCoudOxoUGQbZhQr_cEXzbUMiP9Doe5DdZxGVNs6gqERlpxbB4qTKYO8pbWWqlqwxBOis",
    alt: "Layered bedding in warm neutral tones",
    countLabel: "18 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-dining",
    name: "Dining",
    slug: "dining",
    description: "Earthy table styling essentials.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCLLCC3vYv9B1aoLSfPhHU6_wr3GRPvLNo_tyBS5L8xIXKRyVGUVeWW4quhGqd9UgGCtkD63nZWX5fK7cZksw5fd8VAI2IQ00tdRXSAHGjj1RhVzZ1bMgqjHruPiYGPKt-EmBvhGT6XCavt69H0afNXXZajZjPvnrkiKSqGKREtaLaEa_LZWzVlB-wWeAIaGhudrZq-nTtnuvEkugbp2T8K79IvW-5xYmXKbQOb57A46wtyQcgRC2xqP-ioj_tRhZHZBhsSC-t5Zfw",
    alt: "Ceramic dining ware arranged on table",
    countLabel: "24 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-planters",
    name: "Planters",
    slug: "planters",
    description: "Clay homes for indoor greens.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCUHosQ2mk2S5Xr_dTCorKhsbLM3rAIGGhE_Xh_p3oHu0isbmEhWWQ95nSG8npExRN7EKw_pQLYdrrPmKgWJENSlaKTWyrDFPmBsfphbJt5VDuYf98aezQ4fqcg7PcfdMCBGS4AjT-Ged74xyT51gqMx8y2xOBP-FWf4AdJxdx5M_JprG2JYAY_Hyr26-9F1lbfxCs44D1y8d-MJu-tsDKqh2cRkb6CLfzXh0LIFVVkmUwSGDjmyNTUvchJCdJ_5TyuvmNHZv8TQZk",
    alt: "Natural planters and decor objects",
    countLabel: "14 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-storage",
    name: "Storage",
    slug: "storage",
    description: "Beautiful baskets and utility forms.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBNwv_YRuzDgBYftHCyIG8sj8TXxECng4ufKiK6qYUcRvOvJXcqQXXKI9DoMVa-rPdXwmmxTe0h4DfElMvJAhtm7Rc22skgwe28yq6NaADKzoD0B3GTA0PEkyrwyoIrvtsg4vQhqdxrGxIa5a6cc0t8vAj7S57xPwn7bOydmNyBj5CvP793BkY_IUrTz2_6pUkfqMQxiiSbF211qW0GF4SfktMK_7tgy62PTyn4hLnVUOI96g2NvRG23Irueqv6v8K1a-52M-k1Ii8",
    alt: "Woven storage baskets",
    countLabel: "19 items",
    filter_layout: "sidebar",
  },
  {
    id: "fallback-mirrors",
    name: "Mirrors",
    slug: "mirrors",
    description: "Organic shapes with soft reflection.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDenhfvTY2v8l0yTaL3DrhTv2EUR7cwm6_VFo68qC4nZoacoWTpxet3fROwWcTQOerR0C0-TnqkQa8Vg0mth1HQeF_b_qduB1FJzKuNGUmEi7J0LNb1NfE2517qbQ1ZbCQXUdmrj6pElD_cF3UWqLOV50lb7bPLwJ2-HLcLJxaBCz59lmn6IJuJSRLkRDA0lBUSTUkxccQWwqbM0jnsMzmzWDyWncRlDPZkNRxJU__PD7ojwwmKlMcFfyOUD3andsJmf-F0mXGAr7I",
    alt: "Neutral interior with handcrafted furniture",
    countLabel: "11 items",
    filter_layout: "sidebar",
  },
];

function mapCmsCategoryToCard(cmsCategory: CmsCategory | undefined, fallback: CategoryCard): CategoryCard {
  return {
    id: cmsCategory?.id || fallback.id,
    name: cmsCategory?.name?.trim() || fallback.name,
    slug: cmsCategory?.slug?.trim() || fallback.slug,
    description: cmsCategory?.description?.trim() || fallback.description,
    image: cmsCategory?.image?.trim() || fallback.image,
    alt: cmsCategory?.name?.trim() ? `${cmsCategory.name} collection` : fallback.alt,
    countLabel: fallback.countLabel,
    filter_layout: cmsCategory?.filter_layout || fallback.filter_layout || "sidebar",
  };
}

function buildPrimaryCategories(categories: CmsCategory[]): CategoryCard[] {
  return primaryCategoryFallbacks.map((fallback) => {
    const dbCategory = categories.find((c) => c.slug === fallback.slug);
    return mapCmsCategoryToCard(dbCategory, fallback);
  });
}

function buildMoreCategories(categories: CmsCategory[]): CategoryCard[] {
  const primarySlugs = new Set(primaryCategoryFallbacks.map((f) => f.slug));
  
  const remainingBohemianCategories = categories.filter(
    (c) => !primarySlugs.has(c.slug)
  );

  const cmsDrivenCards = remainingBohemianCategories.map((category, index) => {
    const fallback = moreCategoryFallbacks.find((f) => f.slug === category.slug) 
      || moreCategoryFallbacks[index % moreCategoryFallbacks.length];
    
    return mapCmsCategoryToCard(category, {
      ...fallback,
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description || fallback.description,
      image: category.image || fallback.image,
    });
  });

  const usedSlugs = new Set(cmsDrivenCards.map((c) => c.slug));
  const fallbackCards = moreCategoryFallbacks.filter((f) => !usedSlugs.has(f.slug));

  return [...cmsDrivenCards, ...fallbackCards];
}

function normalizeValue(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase();
}

function extractCategory(categoryEntry: ProductQueryRow["categories"]): ProductCategoryRow | null {
  if (Array.isArray(categoryEntry)) {
    return categoryEntry[0] || null;
  }

  return categoryEntry || null;
}

function buildListingCategoryOptions(cards: CategoryCard[]): BohemianListingCategoryOption[] {
  const seenSlugs = new Set<string>();
  const options: BohemianListingCategoryOption[] = [];

  cards.forEach((card, index) => {
    const normalizedSlug = normalizeValue(card.slug);
    if (!normalizedSlug || seenSlugs.has(normalizedSlug)) {
      return;
    }

    seenSlugs.add(normalizedSlug);
    options.push({
      id: card.id || `category-${index}`,
      name: card.name,
      slug: card.slug,
    });
  });

  return options;
}

function mapRowsToListingProducts(
  rows: ProductQueryRow[],
  selectedCategorySlug: string,
  selectedCategoryName: string,
): BohemianListingProduct[] {
  return rows.map((row) => {
    const category = extractCategory(row.categories);
    const variants = Array.isArray(row.product_variants) ? row.product_variants : [];
    const defaultVariant = variants.find((variant) => variant.is_default) || variants[0];
    const variantImages = Array.isArray(defaultVariant?.variant_images) ? defaultVariant.variant_images : [];
    const primaryImage = variantImages.find((image) => image.is_primary)?.image_url
      || variantImages[0]?.image_url
      || "https://lh3.googleusercontent.com/aida-public/AB6AXuCV94lDjRNBvql1-sAuBHx3RcKcyzhXAvWpXD0-J5ZoGJnPqCQMHn8sI62il0QbNyOUir-urdoglPzkT9hegl0DWnSOV7PCGVF4YNLEGpXm-mTU0dJIwUT-dYa6CPz-Gtv-DO0N2M6wD_ii6eMV8STRGv6SoihShyA2MSGJnKynzpoOVZBPPpAg0PvQ9SONySxB0iI3UXupnqxM7XWj-Gm7UOjaHVz7mpU9HEv_ne-A8zK83r-g73cabXxwPN7-iu6B2_TR2SRfAHQ";

    const categorySlug = category?.slug?.trim() || selectedCategorySlug;
    const categoryName = category?.name?.trim() || selectedCategoryName;

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      subtitle: row.short_description?.trim() || `Crafted for ${selectedCategoryName.toLowerCase()} spaces.`,
      material: defaultVariant?.material_label?.trim() || categoryName,
      price: typeof defaultVariant?.price === "number" ? defaultVariant.price : 0,
      originalPrice: typeof defaultVariant?.original_price === "number" ? defaultVariant.original_price : null,
      image: primaryImage,
      categoryName,
      categorySlug,
      featured: Boolean(row.is_featured),
    } satisfies BohemianListingProduct;
  });
}

export default async function BohemianShopPage({ searchParams }: ShopPageProps) {
  const [allCategories, shopTopBanners, siteConfig] = await Promise.all([
    getActiveCmsCategories(),
    getActiveCmsBannersByPlacement("shop_top"),
    getSiteConfigMap(),
  ]);

  const classicSlugs = ["chiffon", "crepe", "cotton", "silk", "georgette", "rayon"];
  const cmsCategories = allCategories.filter((c) => !classicSlugs.includes(c.slug));

  const requestedCategory = typeof searchParams?.category === "string"
    ? searchParams.category.trim().toLowerCase()
    : "";
  const initialCategory = requestedCategory || "all";

  const primaryCards = buildPrimaryCategories(cmsCategories);
  const moreCards = buildMoreCategories(cmsCategories);
  const shopTopBanner = shopTopBanners[0];

  const searchCategoryOptions = [
    ...primaryCards,
    ...moreCards,
  ];

  if (initialCategory !== "all") {
    const selectedCategoryCard = searchCategoryOptions.find(
      (card) => normalizeValue(card.slug) === initialCategory,
    );
    const selectedCategoryName = selectedCategoryCard?.name?.trim() || formatCategoryName(initialCategory);
    const selectedCategorySlug = selectedCategoryCard?.slug?.trim().toLowerCase() || initialCategory;
    const listingVariant = selectedCategoryCard?.filter_layout === "top" ? "loom" : "archive";
    const listingCategoryOptions = buildListingCategoryOptions(searchCategoryOptions);

    const productRows = await getAllActiveProducts();

    const mappedProducts = mapRowsToListingProducts(productRows as unknown as ProductQueryRow[], selectedCategorySlug, selectedCategoryName);

    const hasProductsForSelectedCategory = mappedProducts.some((product) => {
      const productCategorySlug = normalizeValue(product.categorySlug);
      const productCategoryName = normalizeValue(product.categoryName);
      return productCategorySlug === selectedCategorySlug || productCategoryName === selectedCategorySlug;
    });

    const listingProducts = mappedProducts.length > 0 && hasProductsForSelectedCategory
      ? mappedProducts
      : getBohemianFallbackProducts(selectedCategorySlug, selectedCategoryName, listingVariant);

    return (
      <div className={`${manrope.className} min-h-screen bg-[#fcf9f4] text-[#1c1c19] selection:bg-[#ffdad2] selection:text-[#3d0600]`}>
        <CartSidebar />
        <Navbar activePage="shop" />
        <BohemianProductListing
          selectedCategorySlug={selectedCategorySlug}
          selectedCategoryName={selectedCategoryName}
          categories={listingCategoryOptions}
          products={listingProducts}
          variant={listingVariant}
        />
        <Footer />
      </div>
    );
  }

  const immersiveBannerImage = shopTopBanner?.image_url?.trim()
    || "https://lh3.googleusercontent.com/aida-public/AB6AXuBXeZT2hMdOm3O3Zd8G1MABm-gALMAWLLCIR5PVGltTnn-0AfcDtHQFwMIFac_p0otpSSXvHsKxjGH3gSJPv_m0VritbPK4J_qeXHo9UQ_Ue4ME8kVJAtIyqKWEbv49k14Jy77ZNKg06fNfFjpIjhH-MiNamzaa4xFlLN8bh3L9WD6JJpelieBYcDDIvzOsIbzS1022IVWHOWZbV0e9bl1SJ7rL7nUrQfTAbBoajEnW5ErgY1q6q9mgGnQYOZR4_bBcFbEXEbAIYCA";

  const immersiveBannerTitle = shopTopBanner?.title?.trim() || "The Clay Studio";
  const immersiveBannerCopy = shopTopBanner?.content_text?.trim()
    || "Raw, unrefined, and perfectly imperfect. Explore our latest drop of hand-thrown vessels.";
  const immersiveBannerUrl = shopTopBanner?.link_url?.trim() || "/shop";

  return (
    <div className={`${manrope.className} min-h-screen bg-[#fcf9f4] text-[#1c1c19] selection:bg-[#ffdad2] selection:text-[#3d0600]`}>
      <CartSidebar />
      <Navbar activePage="shop" />

      <main className="pb-20">
        <section className={`${BOHEMIAN_SITE_CONTAINER} pb-8 pt-10`}>
          <div className="max-w-3xl">
            <h1 className={`${newsreader.className} text-5xl leading-[0.95] text-[#1c1c19] md:text-7xl`}>
              Our Collections
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#56423d] md:text-base">
              A curated selection of artisanal home essentials, designed for intentional living spaces. Each category
              remains connected with your admin-managed products and CMS category settings.
            </p>
          </div>
        </section>

        <section className={`${BOHEMIAN_SITE_CONTAINER} pb-6`}>
          <div className="rounded-xl bg-[#f6f3ee] p-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
              <label className="flex items-center gap-3 rounded-lg bg-[#fcf9f4] px-4 py-3">
                <Search className="h-4 w-4 text-[#89726c]" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  className="w-full border-none bg-transparent p-0 text-sm text-[#1c1c19] placeholder:text-[#89726c] focus:outline-none focus:ring-0"
                />
              </label>

              <div className="relative">
                <select className="w-full appearance-none rounded-lg bg-[#fcf9f4] px-4 py-3 text-sm text-[#56423d] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]">
                  <option>Type</option>
                  {searchCategoryOptions.map((category) => (
                    <option key={`type-${category.id}`} value={category.slug}>{category.name}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
              </div>

              <div className="relative">
                <select className="w-full appearance-none rounded-lg bg-[#fcf9f4] px-4 py-3 text-sm text-[#56423d] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]">
                  <option>Material</option>
                  <option>Clay</option>
                  <option>Linen</option>
                  <option>Wood</option>
                  <option>Rattan</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
              </div>

              <div className="relative">
                <select className="w-full appearance-none rounded-lg bg-[#fcf9f4] px-4 py-3 text-sm text-[#56423d] focus:outline-none focus:ring-1 focus:ring-[#9f3f29]">
                  <option>Price Range</option>
                  <option>$0 - $100</option>
                  <option>$100 - $500</option>
                  <option>$500+</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#89726c]" />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/shop"
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                initialCategory === "all"
                  ? "border-[#9f3f29] bg-[#9f3f29] text-white"
                  : "border-[#ddc0ba] text-[#5f5954] hover:border-[#9f3f29] hover:text-[#9f3f29]"
              }`}
            >
              All
            </Link>
            {searchCategoryOptions.map((category) => (
              <Link
                key={`chip-${category.id}`}
                href={`/shop?category=${category.slug}`}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
                  initialCategory === category.slug
                    ? "border-[#9f3f29] bg-[#9f3f29] text-white"
                    : "border-[#ddc0ba] text-[#5f5954] hover:border-[#9f3f29] hover:text-[#9f3f29]"
                }`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className={`${BOHEMIAN_SITE_CONTAINER} pb-20`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-2 md:gap-5">
            <Link
              href={`/shop?category=${primaryCards[0].slug}`}
              className="group relative min-h-[460px] overflow-hidden rounded-xl md:col-span-2 md:row-span-2"
            >
              <Image
                src={primaryCards[0].image}
                alt={primaryCards[0].alt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
              <div className="absolute bottom-0 left-0 w-full p-7 text-white md:p-8">
                <p className="text-xs uppercase tracking-[0.2em] text-white/75">{primaryCards[0].countLabel}</p>
                <h2 className={`${newsreader.className} mt-1 text-4xl italic md:text-5xl`}>{primaryCards[0].name}</h2>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                  Explore <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </Link>

            {primaryCards.slice(1).map((card) => (
              <Link
                key={`primary-${card.id}`}
                href={`/shop?category=${card.slug}`}
                className="group relative min-h-[220px] overflow-hidden rounded-xl"
              >
                <Image
                  src={card.image}
                  alt={card.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 text-white">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/75">{card.countLabel}</p>
                  <h3 className={`${newsreader.className} text-[30px] italic leading-none`}>{card.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#f0ede8] py-20">
          <div className={`${BOHEMIAN_SITE_CONTAINER} grid grid-cols-1 items-center gap-14 md:grid-cols-2`}>
            <div className="relative">
              <div className="overflow-hidden rounded-xl">
                <Image
                  src={siteConfig.maker_series_image?.trim() || "https://lh3.googleusercontent.com/aida-public/AB6AXuDGXqc769ujBDi2-RH5Lqn4T1FmaPU3aFvLNwjCSzBvf486Prxin84RJnddLGVeDY11c6cXy7miwEGgeVTfbFm7pJ1sPgWO1vj9WyYAlO4Hte31GToIvsBZt0cw98wNYpwvBYbvWHt76QRnml__dNmV1qYM3rITrFdDSp5XnJwKyzFM-UgsE-iDe-AwkN85Y-7J15FFYHt0a7fKsON_gwQZl3CCBfD4YUGZtvdXsUaK7WoWvmvEbC4sejK9-sYbY6l0NLAGcN2Ay58"}
                  alt="Artisan weaving textile on loom"
                  width={980}
                  height={1100}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 right-4 hidden max-w-[220px] rotate-2 rounded-xl bg-[#9f3f29] px-6 py-7 text-[28px] italic leading-[1.05] text-white lg:block">
                <span className={newsreader.className}>Sustainably sourced, humanly made.</span>
              </div>
            </div>

            <div>
              <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9f3f29]">
                {siteConfig.maker_series_badge?.trim() || "The Maker Series"}
              </p>
              <h2 className={`${newsreader.className} mb-6 text-5xl text-[#1c1c19] md:text-6xl`}>
                {siteConfig.maker_series_title?.trim() || "Artisan Weaves"}
              </h2>
              <p className="mb-8 max-w-xl text-base leading-relaxed text-[#56423d] md:text-lg">
                {siteConfig.maker_series_description?.trim() || "Every thread tells a story of heritage and patience. Our loom-woven collection is crafted by community cooperatives using traditional techniques passed down through generations."}
              </p>
              <Link
                href={siteConfig.maker_series_btn_url?.trim() || "/about"}
                className="inline-flex items-center gap-2 rounded-lg bg-[#9f3f29] px-7 py-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(159,63,41,0.2)] transition-opacity hover:opacity-90"
              >
                {siteConfig.maker_series_btn_label?.trim() || "Discover the Process"}
              </Link>
            </div>
          </div>
        </section>

        <section className={`${BOHEMIAN_SITE_CONTAINER} py-20`}>
          <div className="relative h-[400px] overflow-hidden rounded-2xl md:h-[470px]">
            <Image
              src={immersiveBannerImage}
              alt={immersiveBannerTitle}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
              <h2 className={`${newsreader.className} text-5xl italic md:text-6xl`}>{immersiveBannerTitle}</h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">{immersiveBannerCopy}</p>
              <Link
                href={immersiveBannerUrl}
                className="mt-9 rounded-full bg-white px-8 py-3 text-sm font-bold text-[#9f3f29] transition-colors hover:bg-[#f0ede8]"
              >
                Shop the Drop
              </Link>
            </div>
          </div>
        </section>

        <section className={`${BOHEMIAN_SITE_CONTAINER} pb-20`}>
          <div className="mb-10 flex items-end justify-between gap-4">
            <h3 className={`${newsreader.className} text-4xl text-[#1c1c19] md:text-[46px]`}>Explore More Collections</h3>
            <Link href="/shop" className="hidden items-center gap-2 text-sm font-semibold text-[#9f3f29] md:inline-flex">
              View More Collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <LazyCollectionGrid cards={moreCards} titleClassName={newsreader.className} />
        </section>
      </main>

      <Footer />
    </div>
  );
}